import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useI18n } from "@/i18n/I18nContext";
import { fmtNum, itemColor } from "@/lib/meta";
import { ItemVisual } from "./ItemVisual";
import { RarityBadge } from "./RarityBadge";

const norm = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const ItemPicker = ({ open, onOpenChange, title, options, onPick, selectedId, testId = "item-picker" }) => {
  const { t, label } = useI18n();
  const [q, setQ] = useState("");
  const list = useMemo(() => options.filter((o) => norm(o.nome).includes(norm(q))), [options, q]);

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setQ(""); }}>
      <DialogContent data-testid={testId} className="max-w-2xl gap-0 border-white/10 bg-[#0f131d] p-0 sm:rounded-2xl">
        <div className="border-b border-white/10 p-5 pb-4">
          <DialogTitle className="font-display text-xl font-bold text-white">{title}</DialogTitle>
          <DialogDescription className="mt-1 text-xs text-slate-500">{list.length} {t("results")}</DialogDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input autoFocus data-testid={`${testId}-search`} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchHere")}
              className="h-10 w-full rounded-full border border-white/10 bg-white/[0.03] pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-purple-500/50" />
          </div>
        </div>
        <div className="scrollbar-thin max-h-[55vh] overflow-y-auto p-2">
          {list.length === 0 && <p className="py-10 text-center text-sm text-slate-500">{t("noResults")}</p>}
          {list.map((o) => {
            const c = itemColor(o);
            const sel = o.id === selectedId;
            return (
              <button key={o.id} data-testid={`${testId}-option-${o.id}`} onClick={() => { onPick(o); onOpenChange(false); setQ(""); }}
                className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/[0.05] ${sel ? "bg-white/[0.06] ring-1" : ""}`}
                style={{ "--tw-ring-color": c }}>
                <ItemVisual item={o} className="h-12 w-12 flex-none rounded-lg" showKanji={false} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{o.nome}</span>
                  <span className="font-mono-g mt-0.5 block truncate text-[10px] text-slate-500">
                    {o.highlight.map((k) => `${label(k)} ${fmtNum(o.stats[k])}`).join(" · ")}
                  </span>
                </span>
                <RarityBadge rarity={o.raridade} original={o.raridadeOriginal} />
                {sel && <X className="h-3.5 w-3.5 text-slate-500" />}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
