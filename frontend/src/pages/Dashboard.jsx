import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Search } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { api } from "@/lib/api";
import { CATEGORY_META, CATEGORY_ORDER, RARITY_COLORS, fmtNum, itemColor } from "@/lib/meta";
import { useI18n } from "@/i18n/I18nContext";
import { useGuide } from "@/context/GuideContext";
import { ItemVisual } from "@/components/guide/ItemVisual";

const fade = (i) => ({ initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06, duration: 0.5 } });
const Panel = ({ children, className = "", i = 0, testId }) => (
  <motion.div {...fade(i)} data-testid={testId} className={`rounded-2xl border border-white/5 bg-[#10141e]/80 p-5 backdrop-blur ${className}`}>{children}</motion.div>
);
const PanelTitle = ({ children }) => <h2 className="font-mono-g mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">{children}</h2>;

const TopList = ({ items, stat, testId }) => {
  const { openDetail } = useGuide();
  const { label } = useI18n();
  const max = Math.max(...items.map((i) => i.stats[stat] || 0), 1);
  return (
    <ol className="space-y-2">
      {items.map((it, i) => (
        <li key={it.id}>
          <button data-testid={`${testId}-${it.id}`} onClick={() => openDetail(it.category, it.id)} className="group flex w-full items-center gap-3 rounded-xl p-1.5 text-left transition-colors hover:bg-white/[0.04]">
            <span className="font-mono-g w-5 text-xs text-slate-600">{i + 1}</span>
            <ItemVisual item={it} className="h-10 w-10 flex-none rounded-lg" showKanji={false} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-slate-100 group-hover:text-white">{it.nome}</span>
              <span className="mt-1 block h-1 overflow-hidden rounded-full bg-white/5">
                <span className="stat-bar-fill block h-full rounded-full" style={{ width: `${((it.stats[stat] || 0) / max) * 100}%`, background: itemColor(it) }} />
              </span>
            </span>
            <span className="font-mono-g text-right text-xs font-bold text-slate-300" title={label(stat)}>{fmtNum(it.stats[stat])}</span>
          </button>
        </li>
      ))}
    </ol>
  );
};

const ChartTip = ({ active, payload }) =>
  active && payload?.length ? (
    <div className="rounded-lg border border-white/10 bg-[#121722] px-3 py-1.5 text-xs text-white">{payload[0].payload.name}: <b>{payload[0].value}</b></div>
  ) : null;

export default function Dashboard() {
  const { t, cat, catDesc, rarity } = useI18n();
  const { setSearchOpen } = useGuide();
  const [d, setD] = useState(null);
  useEffect(() => { api.dashboard().then(setD); }, []);
  if (!d) return <div className="py-32 text-center text-sm text-slate-500">{t("loading")}</div>;

  const rarityData = d.rarity.filter((r) => r.count).map((r) => ({ name: rarity(r.raridade), value: r.count, color: RARITY_COLORS[r.raridade] }));
  const typeData = d.tecnicaTipos.map((r) => ({ name: r.tipo, value: r.count }));

  return (
    <div data-testid="dashboard-page" className="space-y-5">
      <motion.section {...fade(0)} className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0d1018] p-8 sm:p-12">
        <img src="https://images.unsplash.com/photo-1778250503977-4331644a82cf?crop=entropy&cs=srgb&fm=jpg&q=70&w=1600" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080a0f] via-[#080a0f]/85 to-transparent" />
        <span className="font-kanji pointer-events-none absolute -bottom-10 right-6 select-none text-[12rem] font-black leading-none text-purple-500/10">呪術</span>
        <div className="relative max-w-2xl">
          <p className="font-mono-g text-[11px] uppercase tracking-[0.3em] text-cyan-400">{d.total} {t("totalEntries")} · {d.totalSkills} {t("totalSkills")}</p>
          <h1 className="font-display mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t("heroTitle")}<br /><span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-red-400 bg-clip-text text-transparent">{t("heroTitle2")}</span>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">{t("heroText")}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button data-testid="hero-search-button" onClick={() => setSearchOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-purple-500 px-5 py-3 text-sm font-bold text-white shadow-[0_0_32px_-6px_#a855f7] transition-transform hover:scale-105">
              <Search className="h-4 w-4" /> {t("searchPlaceholder").split(" ")[0]}
            </button>
            <Link data-testid="hero-explore-link" to="/c/tecnicas" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/5">
              {t("explore")} {cat("tecnicas")} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-9">
        {CATEGORY_ORDER.map((k, i) => {
          const { icon: Icon, color, kanji } = CATEGORY_META[k];
          return (
            <motion.div key={k} {...fade(i + 1)}>
              <Link to={`/c/${k}`} data-testid={`dashboard-category-card-${k}`} className="item-card group block h-full overflow-hidden rounded-2xl p-4" style={{ "--c": color }}>
                <div className="sheen" />
                <span className="font-kanji absolute -bottom-3 -right-1 text-6xl font-black opacity-[0.07]" style={{ color }}>{kanji}</span>
                <Icon className="h-5 w-5" style={{ color }} />
                <p className="font-display mt-3 text-3xl font-extrabold text-white">{d.counts[k]}</p>
                <p className="text-sm font-semibold text-slate-200">{cat(k)}</p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">{catDesc(k)}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 [&>*]:min-w-0">
        <Panel i={3} className="lg:col-span-7" testId="rarity-chart">
          <PanelTitle>{t("rarityDist")}</PanelTitle>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rarityData} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="value" radius={[8, 8, 2, 2]}>{rarityData.map((r) => <Cell key={r.name} fill={r.color} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel i={4} className="lg:col-span-5" testId="tech-types-chart">
          <PanelTitle>{t("techTypes")}</PanelTitle>
          <div className="space-y-2.5">
            {typeData.map((r) => (
              <div key={r.name}>
                <div className="flex justify-between text-xs"><span className="text-slate-300">{r.name}</span><span className="font-mono-g text-slate-500">{r.value}</span></div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div className="stat-bar-fill h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400" style={{ width: `${(r.value / typeData[0].value) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel i={5} className="lg:col-span-4" testId="top-bosses-panel"><PanelTitle>{t("topBosses")}</PanelTitle><TopList items={d.topBosses} stat="vida" testId="top-boss" /></Panel>
        <Panel i={6} className="lg:col-span-4" testId="top-swords-panel"><PanelTitle>{t("topSwords")}</PanelTitle><TopList items={d.topEspadas} stat="dano" testId="top-sword" /></Panel>
        <Panel i={7} className="lg:col-span-4" testId="top-techs-panel"><PanelTitle>{t("topTechs")}</PanelTitle><TopList items={d.topTecnicas} stat="danoMax" testId="top-tech" /></Panel>
      </div>
    </div>
  );
}
