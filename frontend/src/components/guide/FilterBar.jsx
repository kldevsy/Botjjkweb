import { Search, X, ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/i18n/I18nContext";
import { RARITY_COLORS } from "@/lib/meta";

const ALL = "__all";

export const FilterBar = ({ meta, filters, setFilters, total }) => {
  const { t, rarity, label } = useI18n();
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v === ALL ? "" : v }));
  const active = filters.q || filters.raridade || filters.tipo || filters.sort;

  return (
    <div className="sticky top-16 z-20 -mx-4 mb-6 border-b border-white/5 bg-[#080a0f]/85 px-4 py-3 backdrop-blur-md sm:-mx-8 sm:px-8">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            data-testid="category-search-input"
            value={filters.q}
            onChange={(e) => set("q", e.target.value)}
            placeholder={t("searchHere")}
            className="h-10 w-full rounded-full border border-white/10 bg-white/[0.03] pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-purple-500/50"
          />
        </div>

        {meta?.raridades?.length > 0 && (
          <Select value={filters.raridade || ALL} onValueChange={(v) => set("raridade", v)}>
            <SelectTrigger data-testid="rarity-filter-select" className="h-10 w-[170px] rounded-full border-white/10 bg-white/[0.03] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#121722]">
              <SelectItem value={ALL}>{t("allRarities")}</SelectItem>
              {meta.raridades.map((r) => (
                <SelectItem key={r} value={r} data-testid={`rarity-option-${r}`}>
                  <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: RARITY_COLORS[r] }} />{rarity(r)}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {meta?.tipos?.length > 1 && (
          <Select value={filters.tipo || ALL} onValueChange={(v) => set("tipo", v)}>
            <SelectTrigger data-testid="type-filter-select" className="h-10 w-[170px] rounded-full border-white/10 bg-white/[0.03] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#121722]">
              <SelectItem value={ALL}>{t("allTypes")}</SelectItem>
              {meta.tipos.map((tp) => <SelectItem key={tp} value={tp} data-testid={`type-option-${tp}`}>{tp}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        <Select value={filters.sort || ALL} onValueChange={(v) => set("sort", v)}>
          <SelectTrigger data-testid="sort-select" className="h-10 w-[170px] rounded-full border-white/10 bg-white/[0.03] text-xs">
            <SelectValue placeholder={t("sortBy")} />
          </SelectTrigger>
          <SelectContent className="max-h-72 border-white/10 bg-[#121722]">
            <SelectItem value={ALL}>{t("sortDefault")}</SelectItem>
            <SelectItem value="nome">{t("sortName")}</SelectItem>
            {meta?.raridades?.length > 0 && <SelectItem value="raridade">{t("sortRarity")}</SelectItem>}
            {meta?.statKeys?.map((k) => <SelectItem key={k} value={k} data-testid={`sort-option-${k}`}>{label(k)}</SelectItem>)}
          </SelectContent>
        </Select>

        <button
          data-testid="sort-order-toggle"
          onClick={() => set("order", filters.order === "desc" ? "asc" : "desc")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-300 hover:bg-white/5"
        >
          {filters.order === "desc" ? <ArrowDownWideNarrow className="h-4 w-4" /> : <ArrowUpWideNarrow className="h-4 w-4" />}
        </button>

        {active && (
          <button data-testid="clear-filters-button" onClick={() => setFilters({ q: "", raridade: "", tipo: "", sort: "", order: "desc" })}
            className="flex h-10 items-center gap-1 rounded-full px-3 text-xs text-slate-400 hover:text-white">
            <X className="h-3.5 w-3.5" /> {t("clear")}
          </button>
        )}
        <span data-testid="results-count" className="font-mono-g ml-auto text-[11px] text-slate-500">{total} {t("results")}</span>
      </div>
    </div>
  );
};
