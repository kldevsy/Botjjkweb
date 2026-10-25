from fastapi import FastAPI, APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from collections import Counter
from typing import Optional
from pathlib import Path
import os
import logging

from guide_data import load_all, summary, CATEGORIES, RARITY_ORDER, strip_accents, translate, load_translations

ROOT_DIR = Path(__file__).parent
FRONTEND_BUILD_DIR = ROOT_DIR.parent / "frontend" / "build"
load_dotenv(ROOT_DIR / '.env')

DATA = load_all()
HIGHLIGHT = {c["key"]: c["highlight"] for c in CATEGORIES}
INDEX = {(i["category"], i["id"]): i for items in DATA.values() for i in items}
TRANSLATIONS = load_translations()
Lang = Query("pt", pattern="^(pt|en|es)$")


def tr(obj, lang):
    return translate(obj, TRANSLATIONS.get(lang))

app = FastAPI()
api_router = APIRouter(prefix="/api")


def norm(s):
    return strip_accents(str(s or "")).lower()


def get_cat(category):
    if category not in DATA:
        raise HTTPException(404, "Categoria não encontrada")
    return DATA[category]


@api_router.get("/")
async def root():
    return {"message": "Guia API online"}


@api_router.get("/categories")
async def categories():
    out = []
    for c in CATEGORIES:
        items = DATA[c["key"]]
        out.append({"key": c["key"], "count": len(items),
                    "tipos": sorted({i["tipo"] for i in items if i["tipo"]}),
                    "raridades": [r for r in RARITY_ORDER if any(i["raridade"] == r for i in items)],
                    "statKeys": sorted({k for i in items for k in i["stats"]})})
    return out


@api_router.get("/items/{category}")
async def list_items(category: str, q: Optional[str] = None, raridade: Optional[str] = None, tipo: Optional[str] = None,
                     sort: Optional[str] = None, order: str = Query("desc", pattern="^(asc|desc)$"), lang: str = Lang):
    items = get_cat(category)
    if q:
        nq = norm(q)
        items = [i for i in items if any(nq in norm(x) for x in (i["nome"], i["descricao"], i["subtitulo"], tr(i["nome"] and {"nome": i["nome"]}, lang)["nome"]))]
    if raridade:
        items = [i for i in items if i["raridade"] == raridade]
    if tipo:
        items = [i for i in items if i["tipo"] == tipo]
    if sort == "nome":
        items = sorted(items, key=lambda i: norm(tr({"nome": i["nome"]}, lang)["nome"]), reverse=order == "desc")
    elif sort == "raridade":
        items = sorted(items, key=lambda i: RARITY_ORDER.index(i["raridade"]) if i["raridade"] else -1, reverse=order == "desc")
    elif sort:
        items = sorted(items, key=lambda i: i["stats"].get(sort, 0) or 0, reverse=order == "desc")
    return tr([summary(i, HIGHLIGHT[category]) for i in items], lang)


@api_router.get("/items/{category}/{item_id}")
async def get_item(category: str, item_id: str, lang: str = Lang):
    get_cat(category)
    item = INDEX.get((category, item_id))
    if not item:
        raise HTTPException(404, "Item não encontrado")
    return tr(item, lang)


@api_router.get("/search")
async def search(q: str = Query(..., min_length=1), limit: int = Query(30, ge=1, le=100), lang: str = Lang):
    nq = norm(q)
    hits = []
    for items in DATA.values():
        for i in items:
            n = norm(tr({"nome": i["nome"]}, lang)["nome"]) + " " + norm(i["nome"])
            if nq in n:
                hits.append((0 if n.startswith(nq) else 1, i))
            elif nq in norm(i["descricao"]) or nq in norm(i["subtitulo"]):
                hits.append((2, i))
    hits.sort(key=lambda x: x[0])
    return tr([summary(i, HIGHLIGHT[i["category"]]) for _, i in hits[:limit]], lang)


def top(category, stat, n=5):
    items = sorted(DATA[category], key=lambda i: i["stats"].get(stat, 0) or 0, reverse=True)[:n]
    return [summary(i, HIGHLIGHT[category]) for i in items]


@api_router.get("/dashboard")
async def dashboard(lang: str = Lang):
    rarity = Counter(i["raridade"] for items in DATA.values() for i in items if i["raridade"])
    total_skills = sum(len(s.get("skills", [])) for items in DATA.values() for i in items for s in i["sections"])
    return tr({
        "counts": {k: len(v) for k, v in DATA.items()},
        "total": sum(len(v) for v in DATA.values()),
        "totalSkills": total_skills,
        "rarity": [{"raridade": r, "count": rarity.get(r, 0)} for r in RARITY_ORDER],
        "tecnicaTipos": [{"tipo": t, "count": c} for t, c in Counter(i["tipo"] for i in DATA["tecnicas"]).most_common(8)],
        "topBosses": top("bosses", "vida"),
        "topEspadas": top("espadas", "dano"),
        "topTecnicas": top("tecnicas", "danoMax"),
    }, lang)


app.include_router(api_router)


@app.get("/", include_in_schema=False)
async def frontend_index():
    index_file = FRONTEND_BUILD_DIR / "index.html"
    if not index_file.is_file():
        return {"message": "Guia API online"}
    return FileResponse(index_file)


@app.get("/{frontend_path:path}", include_in_schema=False)
async def frontend_file(frontend_path: str):
    if frontend_path == "api" or frontend_path.startswith("api/"):
        raise HTTPException(404, "Não encontrado")

    build_root = FRONTEND_BUILD_DIR.resolve()
    requested_file = (build_root / frontend_path).resolve()
    if not requested_file.is_relative_to(build_root):
        raise HTTPException(404, "Não encontrado")
    if requested_file.is_file():
        return FileResponse(requested_file)

    index_file = build_root / "index.html"
    if index_file.is_file():
        return FileResponse(index_file)
    raise HTTPException(404, "Arquivo não encontrado")


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
