import { Sparkles, Skull, Sword, Shield, Gem, BookOpen, Ghost, Swords, Zap } from "lucide-react";

export const CATEGORY_META = {
  tecnicas: { icon: Sparkles, kanji: "術", color: "#a855f7" },
  bosses: { icon: Skull, kanji: "鬼", color: "#ef4444" },
  espadas: { icon: Sword, kanji: "剣", color: "#06b6d4" },
  equipamentos: { icon: Shield, kanji: "鎧", color: "#10b981" },
  amuletos: { icon: Gem, kanji: "護", color: "#eab308" },
  grimorios: { icon: BookOpen, kanji: "魔", color: "#f472b6" },
  npcs: { icon: Ghost, kanji: "霊", color: "#94a3b8" },
  raids: { icon: Swords, kanji: "戦", color: "#f97316" },
  habilidades: { icon: Zap, kanji: "技", color: "#3b82f6" },
};

export const CATEGORY_ORDER = Object.keys(CATEGORY_META);

export const RARITY_COLORS = {
  comum: "#94a3b8",
  incomum: "#10b981",
  raro: "#3b82f6",
  epico: "#a855f7",
  lendario: "#f59e0b",
  mitico: "#ef4444",
  limitado: "#06b6d4",
  exclusivo: "#ec4899",
};

export const LOWER_BETTER = new Set(["custoMedio", "cooldownMedio", "custo", "preco", "nivelMinimo"]);

export const itemColor = (item) => RARITY_COLORS[item?.raridade] || CATEGORY_META[item?.category]?.color || "#a855f7";

export const fmtNum = (v) => {
  if (v === null || v === undefined) return "—";
  if (typeof v !== "number") return String(v);
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(v % 1e6 === 0 ? 0 : 1)}M`;
  if (Math.abs(v) >= 1e4) return `${(v / 1e3).toFixed(v % 1e3 === 0 ? 0 : 1)}k`;
  return Number.isInteger(v) ? v.toLocaleString() : v.toFixed(1);
};
