import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Hammer, Trash2, Crosshair } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { SLOTS, useBuild, optionsFor, buildTotals } from "@/lib/build";
import { fmtNum } from "@/lib/meta";
import { BuildSlot } from "@/components/guide/BuildSlot";
import { ItemPicker } from "@/components/guide/ItemPicker";

const GROUPS = ["groupCore", "groupEquip", "groupAmulet"];

const Totals = ({ totals, cost, filled }) => {
  const { t, label } = useI18n();
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, v]) => Math.abs(v)), 1);
  return (
    <div data-testid="build-totals" className="rounded-2xl border border-white/5 bg-[#10141e]/90 p-5 backdrop-blur">
      <h2 className="font-mono-g text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">{t("totalStats")}</h2>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-black/30 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">{t("equippedSlots")}</p><p data-testid="build-filled-count" className="font-display text-2xl font-bold text-white">{filled}/{SLOTS.length}</p></div>
        <div className="rounded-xl bg-black/30 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">{t("totalCost")}</p><p data-testid="build-total-cost" className="font-display text-2xl font-bold text-amber-400">{fmtNum(cost)}</p></div>
      </div>
      {entries.length === 0 ? (
        <p className="mt-6 text-center text-sm text-slate-500">{t("emptyBuild")}</p>
      ) : (
        <div className="mt-5 space-y-2.5">
          {entries.map(([k, v]) => (
            <div key={k} data-testid={`build-total-${k}`}>
              <div className="flex justify-between text-xs"><span className="text-slate-300">{label(k)}</span><span className="font-mono-g font-bold text-white">{fmtNum(v)}</span></div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400" initial={{ width: 0 }} animate={{ width: `${(Math.abs(v) / max) * 100}%` }} transition={{ duration: 0.6 }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function BuildPage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const { ids, items, pool, setSlot, clear } = useBuild();
  const [picking, setPicking] = useState(null);
  const { totals, cost } = buildTotals(items);
  const filled = Object.keys(items).length;

  return (
    <div data-testid="build-page">
      <div className="relative mb-8">
        <span className="font-kanji pointer-events-none absolute -top-6 right-0 select-none text-[9rem] font-black leading-none text-purple-500/[0.06]">構</span>
        <p className="font-mono-g flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-purple-400"><Hammer className="h-3.5 w-3.5" /> {t("navTools")}</p>
        <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">{t("buildTitle")}</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-400 sm:text-base">{t("buildDesc")}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button data-testid="build-test-calc-button" disabled={!items.tecnica && !items.espada} onClick={() => nav("/calc?build=1")}
            className="inline-flex items-center gap-2 rounded-full bg-purple-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_28px_-6px_#a855f7] transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100">
            <Crosshair className="h-4 w-4" /> {t("testInCalc")}
          </button>
          <button data-testid="build-clear-button" onClick={clear} disabled={!filled}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-40">
            <Trash2 className="h-4 w-4" /> {t("clearBuild")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 [&>*]:min-w-0">
        <div className="space-y-8 xl:col-span-8">
          {GROUPS.map((g) => (
            <section key={g}>
              <h2 className="font-mono-g mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">{t(g)}</h2>
              <div className={`grid gap-3 ${g === "groupCore" ? "sm:grid-cols-2" : "sm:grid-cols-2 2xl:grid-cols-3"}`}>
                {SLOTS.filter((s) => s.group === g).map((s) => (
                  <BuildSlot key={s.key} slot={s} item={items[s.key]} large={g === "groupCore"} onChoose={() => pool && setPicking(s)} onRemove={() => setSlot(s.key, null)} />
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="xl:col-span-4"><div className="xl:sticky xl:top-24"><Totals totals={totals} cost={cost} filled={filled} /></div></div>
      </div>

      {picking && (
        <ItemPicker open={!!picking} onOpenChange={(o) => !o && setPicking(null)} title={t(`slot_${picking.key}`)}
          options={optionsFor(picking, pool, ids)} selectedId={ids[picking.key]} testId="build-picker"
          onPick={(o) => setSlot(picking.key, o.id)} />
      )}
    </div>
  );
}
