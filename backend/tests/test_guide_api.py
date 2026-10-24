# Guide API regression tests: categories, items list/filter/sort, item detail, search, dashboard
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
EXPECTED = {"tecnicas": 78, "bosses": 31, "espadas": 53, "equipamentos": 84, "amuletos": 22,
            "grimorios": 10, "npcs": 11, "raids": 13, "habilidades": 3}
RARITY_ORDER = ["comum", "incomum", "raro", "epico", "lendario", "mitico", "limitado", "exclusivo"]


@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def cats(s):
    r = s.get(f"{BASE_URL}/api/categories")
    assert r.status_code == 200
    return r.json()


# Categories
def test_categories_counts(cats):
    assert {c["key"]: c["count"] for c in cats} == EXPECTED
    for c in cats:
        assert isinstance(c["tipos"], list) and isinstance(c["raridades"], list) and isinstance(c["statKeys"], list)


# Items list for every category
@pytest.mark.parametrize("cat", list(EXPECTED))
def test_list_all_categories(s, cat):
    r = s.get(f"{BASE_URL}/api/items/{cat}")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == EXPECTED[cat]
    for it in data:
        assert it["category"] == cat and "_id" not in it and isinstance(it["stats"], dict)


def test_unknown_category_404(s):
    assert s.get(f"{BASE_URL}/api/items/foo").status_code == 404
    assert s.get(f"{BASE_URL}/api/items/foo/bar").status_code == 404


def test_filters_q_rarity_tipo(s, cats):
    r = s.get(f"{BASE_URL}/api/items/bosses", params={"q": "ichigo"}).json()
    assert len(r) >= 1 and any("ichigo" in i["nome"].lower() or "ichigo" in i["descricao"].lower() for i in r)
    tec = next(c for c in cats if c["key"] == "tecnicas")
    rar = tec["raridades"][0]
    rr = s.get(f"{BASE_URL}/api/items/tecnicas", params={"raridade": rar}).json()
    assert rr and all(i["raridade"] == rar for i in rr)
    tp = tec["tipos"][0]
    rt = s.get(f"{BASE_URL}/api/items/tecnicas", params={"tipo": tp}).json()
    assert rt and all(i["tipo"] == tp for i in rt)
    # combined
    rc = s.get(f"{BASE_URL}/api/items/tecnicas", params={"tipo": tp, "raridade": rar}).json()
    assert all(i["tipo"] == tp and i["raridade"] == rar for i in rc)


def test_q_accent_insensitive(s):
    a = s.get(f"{BASE_URL}/api/items/tecnicas", params={"q": "respiracao"}).json()
    b = s.get(f"{BASE_URL}/api/items/tecnicas", params={"q": "Respiração"}).json()
    assert len(a) == len(b)


def test_sort_stat_desc_asc(s):
    d = s.get(f"{BASE_URL}/api/items/bosses", params={"sort": "vida", "order": "desc"}).json()
    v = [i["stats"].get("vida", 0) for i in d]
    assert v == sorted(v, reverse=True)
    a = s.get(f"{BASE_URL}/api/items/bosses", params={"sort": "vida", "order": "asc"}).json()
    v = [i["stats"].get("vida", 0) for i in a]
    assert v == sorted(v)


def test_sort_nome_and_raridade(s):
    a = s.get(f"{BASE_URL}/api/items/espadas", params={"sort": "nome", "order": "asc"}).json()
    assert len(a) == 53
    r = s.get(f"{BASE_URL}/api/items/tecnicas", params={"sort": "raridade", "order": "desc"}).json()
    idx = [RARITY_ORDER.index(i["raridade"]) if i["raridade"] else -1 for i in r]
    assert idx == sorted(idx, reverse=True)


def test_invalid_order_422(s):
    assert s.get(f"{BASE_URL}/api/items/bosses", params={"order": "xyz"}).status_code == 422


# Detail
@pytest.mark.parametrize("cat", list(EXPECTED))
def test_detail_every_item(s, cat):
    items = s.get(f"{BASE_URL}/api/items/{cat}").json()
    fails = []
    for it in items:
        r = s.get(f"{BASE_URL}/api/items/{cat}/{requests.utils.quote(it['id'], safe='')}")
        if r.status_code != 200:
            fails.append((it["id"], r.status_code))
            continue
        d = r.json()
        assert d["id"] == it["id"] and isinstance(d["sections"], list)
        for sec in d["sections"]:
            assert sec["type"] in {"text", "skills", "group", "list", "tags", "quotes"}
    assert not fails, fails


def test_detail_ichigo_skills(s):
    r = s.get(f"{BASE_URL}/api/items/bosses/ichigo")
    assert r.status_code == 200
    d = r.json()
    sk = [x for x in d["sections"] if x["type"] == "skills"]
    assert sk and "dano" in sk[0]["skills"][0] and "cooldown" in sk[0]["skills"][0]


def test_detail_unknown_404(s):
    assert s.get(f"{BASE_URL}/api/items/bosses/nope_xyz").status_code == 404


# Search
def test_search_gojo(s):
    r = s.get(f"{BASE_URL}/api/search", params={"q": "gojo"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 1
    assert all("gojo" in (i["nome"] + i["descricao"] + (i["subtitulo"] or "")).lower() for i in data)


def test_search_empty_422(s):
    assert s.get(f"{BASE_URL}/api/search", params={"q": ""}).status_code == 422


# Dashboard
def test_dashboard(s):
    d = s.get(f"{BASE_URL}/api/dashboard").json()
    assert d["counts"] == EXPECTED and d["total"] == sum(EXPECTED.values())
    assert len(d["rarity"]) == 8
    assert len(d["topBosses"]) == 5 and len(d["topEspadas"]) == 5 and len(d["topTecnicas"]) == 5
    v = [i["stats"].get("vida", 0) for i in d["topBosses"]]
    assert v == sorted(v, reverse=True)
