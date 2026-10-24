import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n/I18nContext";

const EXTRA = ["Especial", "Combate", "PvP"];
export const SLOTS = [
  { key: "tecnica", category: "tecnicas", group: "groupCore" },
  { key: "espada", category: "espadas", group: "groupCore" },
  { key: "armadura", category: "equipamentos", tipos: ["Armadura"], group: "groupEquip" },
  { key: "capacete", category: "equipamentos", tipos: ["Capacete"], group: "groupEquip" },
  { key: "luvas", category: "equipamentos", tipos: ["Luvas"], group: "groupEquip" },
  { key: "botas", category: "equipamentos", tipos: ["Botas"], group: "groupEquip" },
  { key: "manto", category: "equipamentos", tipos: ["Manto"], group: "groupEquip" },
  { key: "acessorio", category: "equipamentos", tipos: ["Acessório"], group: "groupEquip" },
  { key: "arma", category: "equipamentos", tipos: ["Arma"], group: "groupEquip" },
  { key: "amuleto_tecnica", category: "amuletos", tipos: ["Técnica"], group: "groupAmulet" },
  { key: "amuleto_espada", category: "amuletos", tipos: ["Espada"], group: "groupAmulet" },
  { key: "amuleto_extra_1", category: "amuletos", tipos: EXTRA, group: "groupAmulet" },
  { key: "amuleto_extra_2", category: "amuletos", tipos: EXTRA, group: "groupAmulet" },
];

const SKIP = new Set(["preco", "durabilidadeMax", "nivelMax", "maxUpgrade", "habilidades", "custo", "danoMax", "danoTotal", "custoMedio", "cooldownMedio", "chance", "despertar", "dano"]);
const KEY = "guide-build";
const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
};

export const useBuild = () => {
  const { lang } = useI18n();
  const [ids, setIds] = useState(read);
  const [pool, setPool] = useState(null);

  useEffect(() => {
    Promise.all(["tecnicas", "espadas", "equipamentos", "amuletos"].map((c) => api.items(c))).then(([tecnicas, espadas, equipamentos, amuletos]) =>
      setPool({ tecnicas, espadas, equipamentos, amuletos })
    );
  }, [lang]);

  useEffect(() => {
    const sync = () => setIds(read());
    window.addEventListener(KEY, sync);
    return () => window.removeEventListener(KEY, sync);
  }, []);

  const save = useCallback((next) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    setIds(next);
  }, []);

  const setSlot = (slot, id) => {
    const next = { ...ids };
    if (id) next[slot] = id; else delete next[slot];
    save(next);
  };

  const items = {};
  if (pool) SLOTS.forEach((s) => {
    const it = ids[s.key] && pool[s.category].find((x) => x.id === ids[s.key]);
    if (it) items[s.key] = it;
  });

  return { ids, items, pool, setSlot, clear: () => save({}) };
};

export const optionsFor = (slot, pool, ids) => {
  if (!pool) return [];
  const list = pool[slot.category];
  if (!slot.tipos) return list;
  const taken = slot.key.startsWith("amuleto_extra") ? Object.entries(ids).filter(([k]) => k.startsWith("amuleto_extra") && k !== slot.key).map(([, v]) => v) : [];
  return list.filter((x) => slot.tipos.includes(x.tipo) && !taken.includes(x.id));
};

export const buildTotals = (items) => {
  const totals = {};
  const add = (k, v) => { if (typeof v === "number" && v) totals[k] = Math.round(((totals[k] || 0) + v) * 10) / 10; };
  Object.entries(items).forEach(([slot, it]) => {
    if (slot === "tecnica") return add("danoTecnica", it.stats.danoMax);
    if (slot === "espada") return add("danoEspada", it.stats.dano);
    Object.entries(it.stats).forEach(([k, v]) => !SKIP.has(k) && add(k, v));
  });
  const cost = Object.values(items).reduce((a, it) => a + (it.stats.preco || 0), 0);
  return { totals, cost };
};

export const slotForItem = (item) => {
  const current = read();
  const matches = SLOTS.filter((s) => s.category === item.category && (!s.tipos || s.tipos.includes(item.tipo)));
  return (matches.find((s) => !current[s.key]) || matches[0])?.key || null;
};

export const addToBuild = (item) => {
  const slot = slotForItem(item);
  if (!slot) return null;
  localStorage.setItem(KEY, JSON.stringify({ ...read(), [slot]: item.id }));
  window.dispatchEvent(new Event(KEY));
  return slot;
};

export const buildBonus = (totals, category) =>
  (totals.bonusDano || 0) + (category === "espadas" ? (totals.swordDamage || 0) + (totals.bonusDanoEspada || 0) : totals.frutaDamage || 0);
