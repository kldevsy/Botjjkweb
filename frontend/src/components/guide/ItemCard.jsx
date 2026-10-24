import { motion } from "framer-motion";
import { Eye, GitCompareArrows, Check, Layers } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { useGuide } from "@/context/GuideContext";
import { itemColor, fmtNum } from "@/lib/meta";
import { ItemVisual } from "./ItemVisual";
import { RarityBadge } from "./RarityBadge";

export const ItemCard = ({ item, index = 0 }) => {
  const { t, label } = useI18n();
  const { openDetail, toggleCompare, isComparing } = useGuide();
  const c = itemColor(item);
  const selected = isComparing(item);
  const tid = `${item.category}-${item.id}`;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: Math.min(index, 18) * 0.035, ease: [0.2, 0.8, 0.2, 1] }}
      data-testid={`item-card-${tid}`}
      className={`item-card group flex cursor-pointer flex-col overflow-hidden rounded-2xl ${selected ? "ring-2" : ""}`}
      style={{ "--c": c, "--tw-ring-color": c }}
      onClick={() => openDetail(item.category, item.id)}
    >
      <div className="sheen" />
      <ItemVisual item={item} className="h-40 w-full" />
      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
        <RarityBadge rarity={item.raridade} original={item.raridadeOriginal} />
      </div>
      {item.skillCount > 0 && (
        <span className="font-mono-g absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-slate-200 backdrop-blur">
          <Layers className="h-3 w-3" /> {item.skillCount}
        </span>
      )}

      <div className="relative -mt-6 flex flex-1 flex-col gap-3 p-4 pt-0">
        <div>
          {item.subtitulo && (
            <p className="font-mono-g truncate text-[10px] uppercase tracking-[0.2em]" style={{ color: c }}>
              {item.subtitulo}
            </p>
          )}
          <h3 className="font-display mt-1 line-clamp-2 text-base font-bold leading-tight text-white">{item.nome}</h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-400">{item.descricao}</p>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-1.5">
          {item.highlight.map((k) => (
            <div key={k} className="rounded-lg border border-white/5 bg-black/30 px-2 py-1.5">
              <p className="truncate text-[9px] uppercase tracking-wider text-slate-500">{label(k)}</p>
              <p className="font-mono-g text-sm font-bold text-slate-100">{fmtNum(item.stats[k])}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            data-testid={`item-card-detail-button-${tid}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white/5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              openDetail(item.category, item.id);
            }}
          >
            <Eye className="h-3.5 w-3.5" /> {t("details")}
          </button>
          <button
            data-testid={`item-card-compare-button-${tid}`}
            className="flex items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-colors"
            style={{ borderColor: `${c}66`, color: selected ? "#0b0e17" : c, background: selected ? c : "transparent" }}
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(item);
            }}
            aria-pressed={selected}
          >
            {selected ? <Check className="h-3.5 w-3.5" /> : <GitCompareArrows className="h-3.5 w-3.5" />}
            {t("compare")}
          </button>
        </div>
      </div>
    </motion.article>
  );
};
