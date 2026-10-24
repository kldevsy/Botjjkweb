import { Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useGuide } from "@/context/GuideContext";
import { useI18n } from "@/i18n/I18nContext";
import { itemColor, fmtNum, LOWER_BETTER } from "@/lib/meta";
import { ItemVisual } from "./ItemVisual";
import { RarityBadge } from "./RarityBadge";

const Row = ({ statKey, items }) => {
  const { label, t } = useI18n();
  const vals = items.map((i) => (typeof i.stats[statKey] === "number" ? i.stats[statKey] : 0));
  const max = Math.max(...vals.map(Math.abs), 1);
  const lower = LOWER_BETTER.has(statKey);
  const bestVal = lower ? Math.min(...vals) : Math.max(...vals);
  const allSame = vals.every((v) => v === vals[0]);

  return (
    <div data-testid={`compare-row-${statKey}`} className="grid items-center gap-3 border-b border-white/5 py-2.5" style={{ gridTemplateColumns: `140px repeat(${items.length}, minmax(0,1fr))` }}>
      <span className="text-xs text-slate-400">{label(statKey)}</span>
      {items.map((it, idx) => {
        const v = vals[idx];
        const best = !allSame && v === bestVal;
        const c = itemColor(it);
        return (
          <div key={it.id} className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`font-mono-g text-sm font-bold ${best ? "text-white" : "text-slate-400"}`}>{fmtNum(it.stats[statKey] ?? 0)}</span>
              {best && <Trophy className="h-3 w-3 text-amber-400" aria-label={t("best")} />}
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div className="stat-bar-fill h-full rounded-full" style={{ width: `${(Math.abs(v) / max) * 100}%`, background: c, opacity: best ? 1 : 0.45 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const CompareDialog = () => {
  const { compare, compareOpen, setCompareOpen, openDetail } = useGuide();
  const { t } = useI18n();
  const keys = [...new Set(compare.flatMap((i) => Object.keys(i.stats)))].filter((k) => compare.some((i) => i.stats[k]));

  return (
    <Dialog open={compareOpen && compare.length > 1} onOpenChange={setCompareOpen}>
      <DialogContent data-testid="compare-dialog" className="scrollbar-thin max-h-[90vh] max-w-5xl overflow-y-auto border-white/10 bg-[#121722] p-6 sm:rounded-2xl">
        <DialogTitle className="font-display text-2xl font-extrabold text-white">{t("compareTitle")}</DialogTitle>
        <DialogDescription className="text-xs text-slate-500">{t("dataNote")}</DialogDescription>
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid gap-3 pb-4" style={{ gridTemplateColumns: `140px repeat(${compare.length}, minmax(0,1fr))` }}>
              <span />
              {compare.map((it) => (
                <button key={it.id} data-testid={`compare-col-${it.id}`} onClick={() => { setCompareOpen(false); openDetail(it.category, it.id); }}
                  className="group overflow-hidden rounded-xl border text-left transition-transform hover:-translate-y-1" style={{ borderColor: `${itemColor(it)}55` }}>
                  <ItemVisual item={it} className="h-24 w-full" showKanji={false} />
                  <div className="space-y-1 p-2.5">
                    <RarityBadge rarity={it.raridade} original={it.raridadeOriginal} />
                    <p className="font-display line-clamp-2 text-sm font-bold text-white">{it.nome}</p>
                  </div>
                </button>
              ))}
            </div>
            {keys.map((k) => <Row key={k} statKey={k} items={compare} />)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
