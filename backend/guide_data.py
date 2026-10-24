import json
import re
import unicodedata
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"

SKILL_BASE = {"nome", "id", "tipo", "dano", "custoStamina", "cooldown", "stun", "descricao", "imagem", "nivel", "tipoAlvo", "cura", "defesa"}
RARITY_MAP = {
    "comum": "comum", "incomum": "incomum", "raro": "raro", "rara": "raro",
    "epico": "epico", "epica": "epico", "lendario": "lendario", "lendaria": "lendario",
    "mitico": "mitico", "mitica": "mitico", "limitado": "limitado", "limitada": "limitado",
    "exclusivo": "exclusivo", "exclusiva": "exclusivo",
}
RARITY_ORDER = ["comum", "incomum", "raro", "epico", "lendario", "mitico", "limitado", "exclusivo"]
TYPE_FIX = {"Respiracao": "Respiração", "acessorio": "acessório", "tecnica": "Técnica"}


def strip_accents(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def norm_rarity(r):
    if not r:
        return None
    return RARITY_MAP.get(strip_accents(str(r)).lower().strip(), None)


def norm_type(t):
    if t is None:
        return None
    t = str(t).strip()
    return TYPE_FIX.get(t, t[:1].upper() + t[1:])


def num(v):
    if isinstance(v, bool):
        return None
    if isinstance(v, (int, float)):
        return v
    if isinstance(v, str):
        m = re.match(r"^\s*(-?\d+(?:\.\d+)?)\s*%?\s*$", v)
        if m:
            return float(m.group(1))
    return None


def fmt(v):
    if isinstance(v, bool):
        return "✓" if v else "✗"
    if isinstance(v, float):
        return str(round(v, 3))
    return str(v)


def flatten(obj, prefix="", out=None, limit=80):
    out = {} if out is None else out
    if len(out) >= limit:
        return out
    if isinstance(obj, dict):
        for k, v in obj.items():
            flatten(v, f"{prefix}.{k}" if prefix else str(k), out, limit)
    elif isinstance(obj, list):
        if all(not isinstance(x, (dict, list)) for x in obj):
            if obj:
                out[prefix] = ", ".join(fmt(x) for x in obj)
        else:
            for i, x in enumerate(obj):
                flatten(x, f"{prefix}.{i + 1}", out, limit)
    elif obj is not None and obj != "":
        out[prefix] = fmt(obj)
    return out


def norm_skill(h):
    tags = []
    for k, v in h.items():
        if k in SKILL_BASE or isinstance(v, (dict, list)) or v in (None, False, 0, ""):
            continue
        tags.append(k if v is True else f"{k}: {fmt(v)}")
    return {
        "nome": h.get("nome", "—"),
        "tipo": h.get("tipo"),
        "dano": num(h.get("dano")) or 0,
        "cura": num(h.get("cura")) or 0,
        "defesa": num(h.get("defesa")) or 0,
        "custoStamina": num(h.get("custoStamina")),
        "cooldown": num(h.get("cooldown")),
        "stun": bool(h.get("stun")),
        "nivel": h.get("nivel"),
        "tipoAlvo": h.get("tipoAlvo"),
        "descricao": h.get("descricao", ""),
        "imagem": h.get("imagem") if isinstance(h.get("imagem"), str) and h.get("imagem", "").startswith("http") else None,
        "tags": tags[:10],
        "debuff": flatten(h["debuff"]) if isinstance(h.get("debuff"), dict) else None,
    }


def is_skill_list(v):
    return isinstance(v, list) and v and all(isinstance(x, dict) for x in v) and any(
        ("dano" in x or "custoStamina" in x or "cooldown" in x) and "nome" in x for x in v)


def auto_section(key, value, resolver=None):
    if value in (None, "", [], {}):
        return None
    if isinstance(value, str):
        return {"key": key, "type": "text", "text": value}
    if is_skill_list(value):
        return {"key": key, "type": "skills", "skills": [norm_skill(x) for x in value]}
    if isinstance(value, list):
        if all(not isinstance(x, (dict, list)) for x in value):
            return {"key": key, "type": "tags", "tags": [fmt(x) for x in value]}
        entries = []
        for i, x in enumerate(value):
            if not isinstance(x, dict):
                continue
            title = x.get("nome") or (x.get("inimigo") or {}).get("nome") if isinstance(x.get("inimigo"), dict) else x.get("nome")
            title = title or x.get("titulo") or (f"#{x['numero']}" if "numero" in x else f"#{i + 1}")
            rest = {k: v for k, v in x.items() if k not in ("nome", "descricao", "imagem")}
            skills = []
            if is_skill_list(x.get("habilidades")):
                skills = [norm_skill(s) for s in x["habilidades"]]
                rest.pop("habilidades")
            entries.append({"title": title, "descricao": x.get("descricao", ""), "kv": flatten(rest, limit=30), "skills": skills})
        return {"key": key, "type": "list", "entries": entries}
    if isinstance(value, dict):
        rest = {k: v for k, v in value.items() if k not in ("nome", "descricao", "habilidades", "imagem")}
        skills = [norm_skill(s) for s in value.get("habilidades", [])] if is_skill_list(value.get("habilidades")) else []
        return {"key": key, "type": "group", "title": value.get("nome"), "text": value.get("descricao", ""),
                "kv": flatten(rest), "skills": skills}
    return {"key": key, "type": "text", "text": fmt(value)}


def skills_stats(hab):
    danos = [num(h.get("dano")) or 0 for h in hab if isinstance(h, dict)]
    custos = [num(h.get("custoStamina")) for h in hab if isinstance(h, dict) and num(h.get("custoStamina")) is not None]
    cds = [num(h.get("cooldown")) for h in hab if isinstance(h, dict) and num(h.get("cooldown")) is not None]
    return {
        "habilidades": len(hab),
        "danoMax": max(danos) if danos else 0,
        "danoTotal": round(sum(danos), 1),
        "custoMedio": round(sum(custos) / len(custos), 1) if custos else 0,
        "cooldownMedio": round(sum(cds) / len(cds), 1) if cds else 0,
    }


def quotes(item, keys=("falaInicio", "falaAtaque", "falaDerrota")):
    q = [{"key": k, "text": item[k]} for k in keys if item.get(k)]
    return {"key": "falas", "type": "quotes", "quotes": q} if q else None


def build_item(category, raw, base, consumed, extra_sections=None, resolver=None):
    sections = [s for s in (extra_sections or []) if s]
    misc = {}
    for k, v in raw.items():
        if k in consumed or v in (None, "", [], {}):
            continue
        if not isinstance(v, (dict, list)) and (not isinstance(v, str) or len(v) < 40):
            misc[k] = fmt(v)
            continue
        s = auto_section(k, v, resolver)
        if s:
            sections.append(s)
    if misc:
        sections.append({"key": "outros", "type": "group", "title": None, "text": "", "kv": misc, "skills": []})
    item = {
        "id": str(raw.get("id")),
        "category": category,
        "nome": raw.get("nome", raw.get("id")),
        "subtitulo": None,
        "raridade": norm_rarity(raw.get("raridade")),
        "raridadeOriginal": raw.get("raridade"),
        "tipo": None,
        "descricao": raw.get("descricao", ""),
        "imagem": None,
        "stats": {},
        "sections": sections,
    }
    item.update(base)
    item["stats"] = {k: v for k, v in item["stats"].items() if v is not None}
    return item


COMMON_SKIP = {"id", "nome", "raridade", "descricao", "imagem", "emoji", "keysDatabase", "corEmbed", "balanceVersion", "desvioUrl"}


def tecnica(raw):
    hab = raw.get("habilidades", [])
    st = skills_stats(hab)
    st["chance"] = num(raw.get("chance"))
    st["despertar"] = len(raw.get("habilidades_despertar", []) or [])
    mec = raw.get("mecanicaEspecial")
    sec = [auto_section("mecanicaEspecial", mec), auto_section("habilidades", hab)]
    img = raw.get("imagem") if str(raw.get("imagem", "")).startswith("http") else None
    return build_item("tecnicas", raw, {"tipo": norm_type(raw.get("tipo")), "subtitulo": norm_type(raw.get("tipo")),
                                         "imagem": img, "stats": st},
                      COMMON_SKIP | {"tipo", "chance", "mecanicaEspecial", "habilidades", "buildRole"}, sec)


def boss(raw, resolver):
    tipo = "Global" if raw.get("isGlobal") else ("Oni" if raw.get("oni") else "Boss")
    st = {"vida": num(raw.get("vida")), "dano": num(raw.get("dano")), "defesa": num(raw.get("defesa")),
          "resistencia": round((num(raw.get("resistencia")) or 0) * 100, 1),
          "tempoLimite": round((num(raw.get("tempoLimite")) or 0) / 60),
          "habilidades": len(raw.get("habilidades", []))}
    fa = raw.get("formaAlternativa")
    if fa:
        st["vidaExtra"] = num(fa.get("vidaExtra"))
    sec = [auto_section("habilidades", raw.get("habilidades")), auto_section("formaAlternativa", fa),
           drops_section("drops", raw.get("drops"), resolver), quotes(raw)]
    global_rewards = {k: raw[k] for k in ("tecnicas", "espadas", "equipamentos", "berries", "xp", "xpfruit", "tokens_cacador") if k in raw}
    if global_rewards:
        sec.append(drops_section("recompensas", global_rewards, resolver))
    return build_item("bosses", raw, {"tipo": tipo, "subtitulo": raw.get("titulo"), "imagem": raw.get("thumbnail"), "stats": st},
                      COMMON_SKIP | {"titulo", "thumbnail", "vida", "dano", "defesa", "resistencia", "tempoLimite", "habilidades",
                                     "formaAlternativa", "drops", "falaInicio", "falaDerrota", "isGlobal", "oni", "notificavel",
                                     "tecnicas", "espadas", "equipamentos", "berries", "xp", "xpfruit", "tokens_cacador"}, sec)


def drops_section(key, d, resolver):
    if not d:
        return None
    kv = {}
    for k, v in d.items():
        if isinstance(v, dict) and "min" in v:
            kv[k] = f"{fmt(v.get('min'))} – {fmt(v.get('max'))}"
        elif isinstance(v, list):
            parts = []
            for x in v:
                if isinstance(x, dict):
                    name = resolver(x.get("id")) if x.get("id") else fmt(x)
                    ch = num(x.get("chance"))
                    parts.append(f"{name} ({round(ch * 100, 3)}%)" if ch is not None and ch <= 1 else name)
                else:
                    parts.append(resolver(x))
            kv[k] = ", ".join(parts)
        else:
            kv[k] = fmt(v) if not isinstance(v, dict) else ", ".join(f"{a}: {fmt(b)}" for a, b in flatten(v).items())
    return {"key": key, "type": "group", "title": None, "text": "", "kv": kv, "skills": []}


def espada(raw):
    hab = raw.get("habilidades", [])
    s = skills_stats(hab)
    st = {"dano": num(raw.get("dano")), "danoMax": s["danoMax"], "habilidades": s["habilidades"], "preco": num(raw.get("preco")),
          "durabilidadeMax": num(raw.get("durabilidadeMax")), "nivelMax": num(raw.get("nivelMax") or raw.get("nivelmax")),
          "custo": num(raw.get("custo"))}
    rank = raw.get("rank")
    sec = [auto_section("habilidades", hab)]
    if raw.get("mecanicaPassiva"):
        sec.append({"key": "mecanicaPassiva", "type": "tags", "tags": [raw["mecanicaPassiva"]]})
    return build_item("espadas", raw, {"tipo": f"Rank {rank}" if rank else None, "subtitulo": f"Rank {rank}" if rank else None, "stats": st},
                      COMMON_SKIP | {"categoria", "rank", "dano", "habilidades", "preco", "durabilidade", "durabilidadeMax", "nivel",
                                     "nivelMax", "nivelmax", "custo", "mecanicaPassiva", "weaponType", "tipo", "loja", "buildRole"}, sec)


def equipamento(raw):
    st = {"preco": num(raw.get("preco")), "durabilidadeMax": num(raw.get("durabilidadeMax")), "nivelMax": num(raw.get("nivelMax"))}
    for grp in ("stats", "multipliers"):
        for k, v in (raw.get(grp) or {}).items():
            if num(v):
                st[k] = num(v)
    sec = []
    for grp in ("stats", "multipliers", "special"):
        kv = {k: fmt(v) for k, v in flatten(raw.get(grp) or {}).items() if v not in ("0", "0.0")}
        if kv:
            sec.append({"key": grp, "type": "group", "title": None, "text": "", "kv": kv, "skills": []})
    t = norm_type(raw.get("categoria"))
    return build_item("equipamentos", raw, {"tipo": t, "subtitulo": t, "stats": st},
                      COMMON_SKIP | {"categoria", "stats", "multipliers", "special", "preco", "durabilidade", "durabilidadeMax",
                                     "nivel", "nivelMax", "loja"}, sec)


def amuleto(raw):
    ef = raw.get("efeitos") or {}
    st = {"maxUpgrade": num(raw.get("maxUpgrade"))}
    if ef:
        last = ef[sorted(ef.keys(), key=lambda x: num(x) or 0)[-1]]
        for k, v in (last or {}).items():
            if num(v) is not None:
                st[k] = num(v)
    def levels(key, d):
        if not d:
            return None
        return {"key": key, "type": "list", "entries": [{"title": f"Lv {lv}", "descricao": "", "kv": flatten(v), "skills": []} for lv, v in d.items()]}
    t = norm_type(raw.get("tipo"))
    return build_item("amuletos", raw, {"tipo": t, "subtitulo": t, "stats": st},
                      COMMON_SKIP | {"tipo", "efeitos", "custos", "upgrade", "maxUpgrade"}, [levels("efeitos", ef), levels("custos", raw.get("custos"))])


def grimorio(raw):
    p = raw.get("passivas", [])
    st = {"passivas": len(p), "nivelMax": max([num(x.get("nivel")) or 0 for x in p] or [0])}
    sec = [{"key": "passivas", "type": "list", "entries": [{"title": x.get("nome"), "descricao": x.get("descricao", ""), "kv": {"nivel": fmt(x.get("nivel"))}, "skills": []} for x in p]}]
    return build_item("grimorios", raw, {"tipo": "Grimório", "subtitulo": "Grimório", "stats": st}, COMMON_SKIP | {"tipo", "passivas"}, sec)


def habilidade(raw):
    hab = raw.get("hab", [])
    st = skills_stats(hab)
    t = norm_type(raw.get("categoria"))
    return build_item("habilidades", raw, {"tipo": t, "subtitulo": t, "stats": st}, COMMON_SKIP | {"categoria", "hab", "nivel"},
                      [auto_section("habilidades", hab)])


def npc(raw):
    st = {"vida": num(raw.get("vida")), "dano": num(raw.get("dano")), "defesa": num(raw.get("defesa")),
          "velocidadeAtaque": num(raw.get("velocidadeAtaque")), "xpfruit": num(raw.get("xpfruit")),
          "habilidades": len(raw.get("habilidades", []))}
    t = norm_type((raw.get("ia") or {}).get("tipo")) or "NPC"
    sec = [auto_section("habilidades", raw.get("habilidades")), auto_section("passivas", raw.get("passivas")),
           auto_section("debuffs", raw.get("debuffs")), quotes(raw)]
    return build_item("npcs", raw, {"tipo": t, "subtitulo": f"IA Lv {(raw.get('ia') or {}).get('nivel', '?')}", "stats": st},
                      COMMON_SKIP | {"vida", "dano", "defesa", "velocidadeAtaque", "xpfruit", "habilidades", "passivas", "debuffs",
                                     "falaInicio", "falaAtaque", "falaDerrota", "questId", "anti"}, sec)


def raid(raw, resolver):
    rec = raw.get("recompensas") or {}
    st = {"nivelMinimo": num(raw.get("nivelMinimo")), "maxParticipantes": num(raw.get("maxParticipantes")),
          "rodadas": len(raw.get("rodadas", []))}
    for k, v in rec.items():
        if num(v) is not None:
            st[k] = num(v)
    t = norm_type(raw.get("tipoEspecial")) or "Raid"
    sec = [drops_section("recompensas", rec, resolver)]
    if raw.get("frutaId"):
        sec.append({"key": "tecnicaRelacionada", "type": "tags", "tags": [resolver(raw["frutaId"])]})
    return build_item("raids", raw, {"tipo": t, "subtitulo": raw.get("ticketNome"), "stats": st},
                      COMMON_SKIP | {"recompensas", "nivelMinimo", "maxParticipantes", "frutaId", "tipoEspecial", "ticketId", "ticketNome", "terrenos"}, sec)


CATEGORIES = [
    {"key": "tecnicas", "file": "frutas.json", "root": "frutas", "highlight": ["danoMax", "habilidades", "despertar"]},
    {"key": "bosses", "file": "bosses.json", "root": "bosses", "highlight": ["vida", "dano", "defesa"]},
    {"key": "espadas", "file": "espadas.json", "root": "espadas", "highlight": ["dano", "danoMax", "durabilidadeMax"]},
    {"key": "equipamentos", "file": "equipamentos.json", "root": "equipamentos", "highlight": ["vida", "defesa", "forca"]},
    {"key": "amuletos", "file": "amuletos.json", "root": "amuletos", "highlight": ["maxUpgrade"]},
    {"key": "grimorios", "file": "grimorios.json", "root": "grimorios", "highlight": ["passivas", "nivelMax"]},
    {"key": "npcs", "file": "npcs.json", "root": "npcs", "highlight": ["vida", "dano", "defesa"]},
    {"key": "raids", "file": "raids.json", "root": "raids", "highlight": ["nivelMinimo", "maxParticipantes", "rodadas"]},
    {"key": "habilidades", "file": "Habilidades.json", "root": "habilidades", "highlight": ["danoMax", "habilidades"]},
]


def load_all():
    raw = {c["key"]: json.load(open(DATA_DIR / c["file"], encoding="utf-8"))[c["root"]] for c in CATEGORIES}
    names = {}
    for items in raw.values():
        for it in items:
            if isinstance(it, dict) and it.get("id"):
                names.setdefault(str(it["id"]), it.get("nome", it["id"]))
    resolver = lambda i: names.get(str(i), str(i))
    builders = {"tecnicas": tecnica, "bosses": lambda r: boss(r, resolver), "espadas": espada, "equipamentos": equipamento,
                "amuletos": amuleto, "grimorios": grimorio, "npcs": npc, "raids": lambda r: raid(r, resolver), "habilidades": habilidade}
    data = {}
    for c in CATEGORIES:
        seen = set()
        items = []
        for r in raw[c["key"]]:
            if not isinstance(r, dict) or not r.get("id") or r["id"] in seen:
                continue
            seen.add(r["id"])
            items.append(builders[c["key"]](r))
        data[c["key"]] = items
    return data


def summary(item, highlight):
    keys = [k for k in highlight if k in item["stats"]]
    keys += [k for k in item["stats"] if k not in keys][: max(0, 3 - len(keys))]
    return {k: item[k] for k in ("id", "category", "nome", "subtitulo", "raridade", "raridadeOriginal", "tipo", "imagem", "stats")} | {
        "descricao": item["descricao"][:220], "highlight": keys[:3],
        "skillCount": sum(len(s.get("skills", [])) for s in item["sections"])}
