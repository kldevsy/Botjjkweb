import { AnimatePresence, motion } from "framer-motion";
import { X, GitCompareArrows } from "lucide-react";
import { useGuide } from "@/context/GuideContext";
import { useI18n } from "@/i18n/I18nContext";
import { itemColor } from "@/lib/meta";
import { ItemVisual } from "./ItemVisual";

export const CompareTray = () => {
  const { compare, toggleCompare, clearCompare, setCompareOpen } = useGuide();
  const { t, cat } = useI18n();

  return (
    <AnimatePresence>
      {compare.length > 0 && (
        <motion.div
          data-testid="compare-tray"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="fixed inset-x-3 bottom-4 z-40 mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#0b0e17]/90 p-3 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden sm:block">
              <p className="font-mono-g text-[10px] uppercase tracking-widest text-slate-500">{t("comparing")}</p>
              <p className="font-display text-sm font-bold text-white">{cat(compare[0].category)} · {compare.length}/3</p>
            </div>
            <div className="flex flex-1 gap-2 overflow-x-auto">
              {compare.map((it) => (
                <div key={it.id} className="flex min-w-0 items-center gap-2 rounded-xl border bg-black/40 py-1 pl-1 pr-2" style={{ borderColor: `${itemColor(it)}55` }}>
                  <ItemVisual item={it} className="h-9 w-9 flex-none rounded-lg" showKanji={false} />
                  <span className="max-w-[110px] truncate text-xs font-semibold text-slate-200">{it.nome}</span>
                  <button data-testid={`compare-tray-remove-${it.id}`} onClick={() => toggleCompare(it)} className="text-slate-500 hover:text-white">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button data-testid="compare-tray-clear-button" onClick={clearCompare} className="text-xs text-slate-400 hover:text-white">{t("clear")}</button>
            <button
              data-testid="compare-tray-open-button"
              disabled={compare.length < 2}
              onClick={() => setCompareOpen(true)}
              title={compare.length < 2 ? t("compareHint") : ""}
              className="inline-flex items-center gap-1.5 rounded-full bg-purple-500 px-4 py-2 text-xs font-bold text-white shadow-[0_0_24px_-4px_#a855f7] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              <GitCompareArrows className="h-4 w-4" /> {compare.length < 2 ? t("compareHint") : t("compareNow")}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
