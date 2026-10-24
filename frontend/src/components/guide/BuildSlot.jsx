import { Plus, X, Sparkles, Sword, HardHat, Hand, Footprints, Shirt, Gem, Crosshair, Shield, Wind } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nContext";
import { itemColor } from "@/lib/meta";
import { ItemVisual } from "./ItemVisual";
import { RarityBadge } from "./RarityBadge";

const ICONS = { tecnica: Sparkles, espada: Sword, armadura: Shirt, capacete: HardHat, luvas: Hand, botas: Footprints, manto: Wind, acessorio: Gem, arma: Crosshair };

export const BuildSlot = ({ slot, item, onChoose, onRemove, large }) => {
  const { t } = useI18n();
  const Icon = ICONS[slot.key] || Shield;
  const c = item ? itemColor(item) : "#334155";
  const tid = `build-slot-${slot.key}`;

  if (!item) {
    return (
      <button data-testid={tid} onClick={onChoose}
        className={`group flex w-full items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-4 text-left transition-colors hover:border-purple-500/50 hover:bg-purple-500/[0.04] ${large ? "min-h-[120px]" : ""}`}>
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white/[0.04] text-slate-500 transition-colors group-hover:text-purple-300">
          <Icon className="h-5 w-5" />
        </span>
        <span className="flex-1">
          <span className="font-mono-g block text-[10px] uppercase tracking-widest text-slate-500">{t(`slot_${slot.key}`)}</span>
          <span className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-slate-300"><Plus className="h-3.5 w-3.5" /> {t("choose")}</span>
        </span>
      </button>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} data-testid={`${tid}-filled`}
      className="item-card group flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl p-3" style={{ "--c": c }} onClick={onChoose}>
      <div className="sheen" />
      <ItemVisual item={item} className={`${large ? "h-24 w-24" : "h-14 w-14"} flex-none rounded-xl`} showKanji={false} />
      <div className="min-w-0 flex-1">
        <p className="font-mono-g text-[10px] uppercase tracking-widest" style={{ color: c }}>{t(`slot_${slot.key}`)}</p>
        <p className={`font-display truncate font-bold text-white ${large ? "text-lg" : "text-sm"}`}>{item.nome}</p>
        <div className="mt-1"><RarityBadge rarity={item.raridade} original={item.raridadeOriginal} /></div>
      </div>
      <button data-testid={`${tid}-remove`} title={t("remove")} onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="relative z-10 rounded-full p-1.5 text-slate-500 transition-colors hover:bg-white/10 hover:text-white">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};
