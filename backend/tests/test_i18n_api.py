# i18n (?lang=pt|en|es) tests for guide API - iteration 2
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")


@pytest.fixture(scope="module")
def s():
    return requests.Session()


# --- lang param validation on every endpoint
@pytest.mark.parametrize("path", ["/api/items/tecnicas", "/api/items/bosses/ichigo", "/api/search?q=a", "/api/dashboard"])
def test_invalid_lang_422(s, path):
    sep = "&" if "?" in path else "?"
    assert s.get(f"{BASE_URL}{path}{sep}lang=fr").status_code == 422


@pytest.mark.parametrize("lang", ["pt", "en", "es"])
def test_valid_lang_ok(s, lang):
    for p in ["/api/items/tecnicas", "/api/items/bosses/ichigo", "/api/dashboard"]:
        r = s.get(f"{BASE_URL}{p}", params={"lang": lang})
        assert r.status_code == 200, p


def test_categories_ignores_lang(s):
    # /categories has no lang param; extra query just ignored
    assert s.get(f"{BASE_URL}/api/categories?lang=en").status_code == 200


# --- list translation; default == pt
@pytest.mark.parametrize("cat", ["tecnicas", "espadas", "equipamentos", "amuletos", "bosses"])
def test_list_translated(s, cat):
    pt = s.get(f"{BASE_URL}/api/items/{cat}").json()
    pt2 = s.get(f"{BASE_URL}/api/items/{cat}?lang=pt").json()
    en = s.get(f"{BASE_URL}/api/items/{cat}?lang=en").json()
    es = s.get(f"{BASE_URL}/api/items/{cat}?lang=es").json()
    assert pt == pt2
    assert len(pt) == len(en) == len(es)
    assert [i["id"] for i in pt] == [i["id"] for i in en]
    # tipo stays Portuguese
    assert [i["tipo"] for i in pt] == [i["tipo"] for i in en]
    changed = sum(1 for a, b in zip(pt, en) if a["descricao"] and a["descricao"] != b["descricao"])
    with_desc = sum(1 for a in pt if a["descricao"])
    assert with_desc == 0 or changed / with_desc > 0.8, f"{cat}: only {changed}/{with_desc} translated EN"
    changed_es = sum(1 for a, b in zip(pt, es) if a["descricao"] and a["descricao"] != b["descricao"])
    assert with_desc == 0 or changed_es / with_desc > 0.8


def test_boss_detail_es_skills(s):
    pt = s.get(f"{BASE_URL}/api/items/bosses/ichigo").json()
    es = s.get(f"{BASE_URL}/api/items/bosses/ichigo?lang=es").json()
    assert es["id"] == "ichigo" and es["stats"] == pt["stats"]
    assert es["descricao"] != pt["descricao"]
    pts = [sk for sec in pt["sections"] for sk in sec.get("skills", [])]
    ess = [sk for sec in es["sections"] for sk in sec.get("skills", [])]
    assert len(pts) == len(ess) > 0
    assert any(a["descricao"] != b["descricao"] for a, b in zip(pts, ess) if a["descricao"])
    assert [a["dano"] for a in pts] == [b["dano"] for b in ess]


def test_search_translated_name(s):
    r = s.get(f"{BASE_URL}/api/search", params={"q": "armor", "lang": "en"})
    assert r.status_code == 200
    data = r.json()
    eq = [i for i in data if i["category"] == "equipamentos"]
    assert eq, "no equipment found for 'armor' in EN"
    assert any("armor" in i["nome"].lower() for i in eq)


def test_search_pt_still_works_with_en(s):
    # original PT name still searchable in EN mode
    r = s.get(f"{BASE_URL}/api/search", params={"q": "gojo", "lang": "en"}).json()
    assert len(r) > 0


def test_dashboard_en_translated(s):
    pt = s.get(f"{BASE_URL}/api/dashboard").json()
    en = s.get(f"{BASE_URL}/api/dashboard?lang=en").json()
    assert pt["counts"] == en["counts"] and pt["total"] == en["total"]
    for k in ("topBosses", "topEspadas", "topTecnicas"):
        assert [i["id"] for i in pt[k]] == [i["id"] for i in en[k]]
    assert any(a["descricao"] != b["descricao"] for a, b in zip(pt["topTecnicas"], en["topTecnicas"]) if a["descricao"])


def test_list_q_matches_translated_name(s):
    r = s.get(f"{BASE_URL}/api/items/equipamentos", params={"q": "armor", "lang": "en"}).json()
    assert len(r) > 0


def test_sort_nome_translated(s):
    r = s.get(f"{BASE_URL}/api/items/tecnicas", params={"sort": "nome", "order": "asc", "lang": "en"}).json()
    names = [i["nome"] for i in r]
    assert len(names) > 1


# --- ignoraDefesa flag present on skills (calc depends on it)
def test_ignora_defesa_flag(s):
    d = s.get(f"{BASE_URL}/api/items/tecnicas/madara_edo").json()
    sk = [k for sec in d["sections"] for k in sec.get("skills", [])]
    assert all("ignoraDefesa" in k for k in sk)
    assert any(k["ignoraDefesa"] for k in sk)


def test_alucard_skill_and_ichigo_formula(s):
    t = s.get(f"{BASE_URL}/api/items/tecnicas/alucard_rei_mortos").json()
    b = s.get(f"{BASE_URL}/api/items/bosses/ichigo").json()["stats"]
    sk = [k for sec in t["sections"] for k in sec.get("skills", []) if k["dano"] == 1200]
    assert sk
    import math
    eff_def = math.floor(b["defesa"] * 0.5)
    eff_res = min(0.95, (b["resistencia"] / 100 or 0.05) * 0.5)
    red = min(0.8, eff_def / (eff_def + 100))
    final = max(1, math.floor(math.floor(1200 * (1 - eff_res)) * (1 - red)))
    assert (eff_def, final, math.ceil((b["vida"] + b["vidaExtra"]) / final)) == (22, 860, 1047)
