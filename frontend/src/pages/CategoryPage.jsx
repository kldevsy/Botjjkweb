import { useEffect, useState } from "react";
import { useParams, useOutletContext, useSearchParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { CATEGORY_META } from "@/lib/meta";
import { useI18n } from "@/i18n/I18nContext";
import { useGuide } from "@/context/GuideContext";
import { ItemCard } from "@/components/guide/ItemCard";
import { FilterBar } from "@/components/guide/FilterBar";

const EMPTY = { q: "", raridade: "", tipo: "", sort: "", order: "desc" };

export default function CategoryPage() {
  const { category } = useParams();
  const { cats } = useOutletContext();
  const { cat, catDesc, t, lang } = useI18n();
  const { openDetail } = useGuide();
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState(EMPTY);
  const [items, setItems] = useState(null);

  useEffect(() => { setFilters(EMPTY); }, [category]);

  useEffect(() => {
    const id = params.get("item");
    if (id && CATEGORY_META[category]) {
      openDetail(category, id);
      setParams({}, { replace: true });
    }
  }, [params, category]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!CATEGORY_META[category]) return;
    const h = setTimeout(() => {
      const p = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      api.items(category, p).then(setItems);
    }, filters.q ? 200 : 0);
    return () => clearTimeout(h);
  }, [category, filters, lang]);

  if (!CATEGORY_META[category]) return <Navigate to="/" replace />;
  const meta = cats.find((c) => c.key === category);
  const { icon: Icon, color, kanji } = CATEGORY_META[category];

  return (
    <div data-testid={`category-page-${category}`}>
      <motion.div key={category} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative mb-6 overflow-hidden">
        <span className="font-kanji pointer-events-none absolute -top-6 right-0 select-none text-[9rem] font-black leading-none opacity-[0.06]" style={{ color }}>{kanji}</span>
        <p className="font-mono-g flex items-center gap-2 text-[11px] uppercase tracking-[0.25em]" style={{ color }}>
          <Icon className="h-3.5 w-3.5" /> {meta?.count ?? "…"} {t("items")}
        </p>
        <h1 data-testid="category-title" className="font-display mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">{cat(category)}</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-400 sm:text-base">{catDesc(category)}</p>
      </motion.div>

      <FilterBar meta={meta} filters={filters} setFilters={setFilters} total={items?.length ?? 0} />

      {!items ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl bg-white/5" />)}
        </div>
      ) : items.length === 0 ? (
        <div data-testid="empty-state" className="rounded-2xl border border-dashed border-white/10 py-24 text-center">
          <p className="font-kanji text-5xl opacity-20">無</p>
          <p className="mt-3 text-sm text-slate-500">{t("noResults")}</p>
        </div>
      ) : (
        <div data-testid="items-grid" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {items.map((it, i) => <ItemCard key={`${it.category}-${it.id}`} item={it} index={i} />)}
        </div>
      )}
    </div>
  );
}
