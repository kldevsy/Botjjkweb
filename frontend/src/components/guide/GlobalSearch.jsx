import { useEffect, useState } from "react";
import { Search, CornerDownLeft } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useGuide } from "@/context/GuideContext";
import { useI18n } from "@/i18n/I18nContext";
import { api } from "@/lib/api";
import { CATEGORY_META, itemColor } from "@/lib/meta";
import { RarityBadge } from "./RarityBadge";

export const GlobalSearch = () => {
  const { searchOpen, setSearchOpen, openDetail } = useGuide();
  const { t, cat } = useI18n();
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  useEffect(() => {
    if (!q.trim()) return setResults([]);
    const id = setTimeout(() => api.search(q.trim()).then((r) => { setResults(r); setActive(0); }), 180);
    return () => clearTimeout(id);
  }, [q]);

  const choose = (it) => {
    setSearchOpen(false);
    setQ("");
    openDetail(it.category, it.id);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === "Enter" && results[active]) choose(results[active]);
  };

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent data-testid="global-search-dialog" className="top-[15%] max-w-2xl translate-y-0 gap-0 border-white/10 bg-[#0f131d]/95 p-0 backdrop-blur-xl sm:rounded-2xl">
        <DialogTitle className="sr-only">{t("searchPlaceholder")}</DialogTitle>
        <DialogDescription className="sr-only">{t("typeToSearch")}</DialogDescription>
        <div className="flex items-center gap-3 border-b border-white/10 px-5">
          <Search className="h-5 w-5 text-purple-400" />
          <input
            autoFocus
            data-testid="global-search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("searchPlaceholder")}
            className="h-14 flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-500"
          />
        </div>
        <div className="scrollbar-thin max-h-[55vh] overflow-y-auto p-2">
          {!q.trim() && <p className="px-3 py-8 text-center text-sm text-slate-500">{t("typeToSearch")}</p>}
          {q.trim() && results.length === 0 && <p data-testid="global-search-empty" className="px-3 py-8 text-center text-sm text-slate-500">{t("noResults")}</p>}
          {results.map((it, i) => {
            const Icon = CATEGORY_META[it.category].icon;
            const c = itemColor(it);
            return (
              <button
                key={`${it.category}-${it.id}`}
                data-testid={`global-search-result-${it.category}-${it.id}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(it)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${i === active ? "bg-white/[0.07]" : ""}`}
              >
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg" style={{ background: `${c}1f`, color: c }}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{it.nome}</span>
                  <span className="font-mono-g block truncate text-[10px] uppercase tracking-widest text-slate-500">{cat(it.category)}{it.subtitulo ? ` · ${it.subtitulo}` : ""}</span>
                </span>
                <RarityBadge rarity={it.raridade} />
                {i === active && <CornerDownLeft className="h-3.5 w-3.5 text-slate-500" />}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
