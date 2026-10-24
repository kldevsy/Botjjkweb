import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Calculator, ChevronDown, Info, Hammer, ShieldOff, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n/I18nContext";
import { useGuide } from "@/context/GuideContext";
import { fmtNum, itemColor } from "@/lib/meta";
import { bossFactors, bossHp, skillResults, damageSkills } from "@/lib/calc";
import { useBuild, buildTotals, buildBonus } from "@/lib/build";
import { ItemPicker } from "@/components/guide/ItemPicker";
import { ItemVisual } from "@/components/guide/ItemVisual";

const PickerButton = ({ item, placeholder, label, onClick, testId }) => (
  <button data-testid={testId} onClick={onClick} className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-2 text-left transition-colors hover:border-purple-500/50">
    {item ? <ItemVisual item={item} className="h-12 w-12 flex-none rounded-lg" showKanji={false} /> : <span className="h-12 w-12 flex-none rounded-lg bg-white/5" />}
    <span className="min-w-0 flex-1">
      <span className="font-mono-g block text-[10px] uppercase tracking-widest text-slate-500">{label}</span>
      <span className="block truncate text-sm font-semibold text-white">{item?.nome || placeholder}</span>
    </span>
    <ChevronDown className="h-4 w-4 text-slate-500" />
  </button>
);

const Stat = ({ label, value, color, testId }) => (
  <div data-testid={testId} className="rounded-xl border border-white/5 bg-black/30 p-3">
    <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
    <p className="font-display text-xl font-bold" style={{ color }}>{value}</p>
  </div>
);

const SkillTable = ({ rows, color }) => {
  const { t } = useI18n();
  const best = Math.max(...rows.map((r) => r.final));
  return (
    <div className="overflow-x-auto">
      <table data-testid="calc-skill-table" className="w-full min-w-[620px] text-left text-sm">
        <thead className="font-mono-g text-[10px] uppercase tracking-widest text-slate-500">
          <tr><th className="py-2 pr-3">{t("skill")}</th><th className="px-3">{t("cooldown")}</th><th className="px-3">{t("rawDmg")}</th><th className="px-3">{t("finalDmg")}</th><th className="px-3">{t("hpPerHit")}</th><th className="pl-3 text-right">{t("hitsToKill")}</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.nome}-${i}`} data-testid={`calc-skill-row-${i}`} className="border-t border-white/5">
              <td className="py-3 pr-3">
                <div className="flex items-center gap-2">
                  {r.final === best && <Trophy className="h-3.5 w-3.5 flex-none text-amber-400" />}
                  <span className="font-semibold text-white">{r.nome}</span>
                  {r.ignoraDefesa && <span title={t("ignoresDef")} className="inline-flex items-center gap-1 rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] text-cyan-300"><ShieldOff className="h-3 w-3" />{t("ignoresDef")}</span>}
                </div>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/5">
                  <div className="stat-bar-fill h-full rounded-full" style={{ width: `${Math.min(100, r.pct * 4)}%`, background: color }} />
                </div>
              </td>
              <td className="font-mono-g px-3 text-slate-400">{r.cooldown ? `${r.cooldown}t` : "—"}</td>
              <td className="font-mono-g px-3 text-slate-400">{fmtNum(r.dano)}</td>
              <td className="font-mono-g px-3 font-bold text-white">{fmtNum(r.final)}</td>
              <td className="font-mono-g px-3 text-slate-300">{r.pct < 0.01 ? "<0.01" : r.pct.toFixed(2)}%</td>
              <td className="font-mono-g pl-3 text-right font-bold" style={{ color }}>{r.hits.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Ranking = ({ bosses, skills, bonus, withForm, activeId, onPick }) => {
  const { t } = useI18n();
  const rows = bosses
    .map((b) => {
      const r = skillResults(skills, bonus, b, withForm).sort((x, y) => y.final - x.final)[0];
      return { boss: b, best: r };
    })
    .sort((a, b) => a.best.hits - b.best.hits);
  const maxHits = Math.max(...rows.map((r) => r.best.hits), 1);
  return (
    <div data-testid="calc-ranking" className="rounded-2xl border border-white/5 bg-[#10141e]/90 p-5">
      <h2 className="font-mono-g text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">{t("rankingAll")}</h2>
      <p className="mt-1 text-xs text-slate-500">{t("rankingHint")}</p>
      <ol className="scrollbar-thin mt-4 max-h-[640px] space-y-1 overflow-y-auto pr-1">
        {rows.map(({ boss, best }) => (
          <li key={boss.id}>
            <button data-testid={`calc-ranking-${boss.id}`} onClick={() => onPick(boss.id)}
              className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/[0.04] ${boss.id === activeId ? "bg-white/[0.06]" : ""}`}>
              <ItemVisual item={boss} className="h-9 w-9 flex-none rounded-lg" showKanji={false} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-slate-100">{boss.nome}</span>
                <span className="mt-1 block h-1 overflow-hidden rounded-full bg-white/5">
                  <span className="stat-bar-fill block h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500" style={{ width: `${(best.hits / maxHits) * 100}%` }} />
                </span>
              </span>
              <span className="font-mono-g text-right text-xs font-bold text-white">{best.hits.toLocaleString()}<span className="block text-[9px] font-normal text-slate-500">{t("hitsToKill")}</span></span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default function CalculatorPage() {
  const { t, lang } = useI18n();
  const { openDetail } = useGuide();
  const [params, setParams] = useSearchParams();
  const build = useBuild();
  const [lists, setLists] = useState(null);
  const [type, setType] = useState("tecnicas");
  const [attackerId, setAttackerId] = useState(null);
  const [bossId, setBossId] = useState(null);
  const [bonus, setBonus] = useState(0);
  const [withForm, setWithForm] = useState(true);
  const [detail, setDetail] = useState(null);
  const [picker, setPicker] = useState(null);

  useEffect(() => {
    Promise.all(["tecnicas", "espadas", "bosses"].map((c) => api.items(c))).then(([tecnicas, espadas, bosses]) => {
      setLists({ tecnicas, espadas, bosses });
      setAttackerId((a) => a || tecnicas[0]?.id);
      setBossId((b) => b || bosses[0]?.id);
    });
  }, [lang]);

  useEffect(() => {
    if (!attackerId) return;
    api.item(type, attackerId).then(setDetail).catch(() => setDetail(null));
  }, [type, attackerId, lang]);

  const applyBuild = (silent) => {
    const { items } = build;
    const cat = items.tecnica && (type === "tecnicas" || !items.espada) ? "tecnicas" : items.espada ? "espadas" : null;
    if (!cat) return;
    const it = cat === "tecnicas" ? items.tecnica : items.espada;
    setType(cat);
    setAttackerId(it.id);
    setBonus(buildBonus(buildTotals(items).totals, cat));
    if (!silent) toast.success(t("buildApplied"));
  };

  useEffect(() => {
    if (params.get("build") && build.pool) {
      applyBuild(false);
      setParams({}, { replace: true });
    }
  }, [params, build.pool]); // eslint-disable-line react-hooks/exhaustive-deps

  const boss = lists?.bosses.find((b) => b.id === bossId);
  const attacker = lists?.[type].find((x) => x.id === attackerId);
  const skills = useMemo(() => (detail && detail.id === attackerId ? damageSkills(detail, t("basicAttack")) : []), [detail, attackerId, t]);
  const rows = boss ? skillResults(skills, bonus, boss, withForm) : [];
  const f = boss ? bossFactors(boss) : null;
  const color = attacker ? itemColor(attacker) : "#a855f7";
  const hasBuild = build.items.tecnica || build.items.espada;

  const switchType = (tp) => {
    setType(tp);
    setDetail(null);
    setAttackerId(lists?.[tp][0]?.id);
  };

  return (
    <div data-testid="calc-page">
      <div className="relative mb-8">
        <span className="font-kanji pointer-events-none absolute -top-6 right-0 select-none text-[9rem] font-black leading-none text-red-500/[0.06]">撃</span>
        <p className="font-mono-g flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-red-400"><Calculator className="h-3.5 w-3.5" /> {t("navTools")}</p>
        <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">{t("calcTitle")}</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-400 sm:text-base">{t("calcDesc")}</p>
      </div>

      {!lists ? <p className="py-20 text-center text-sm text-slate-500">{t("loading")}</p> : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 [&>*]:min-w-0">
          <div className="space-y-5 xl:col-span-8">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/5 bg-[#10141e]/90 p-5">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-full bg-black/40 p-1">
                  {["tecnicas", "espadas"].map((tp) => (
                    <button key={tp} data-testid={`calc-type-${tp}`} onClick={() => switchType(tp)}
                      className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${type === tp ? "bg-purple-500 text-white" : "text-slate-400 hover:text-white"}`}>
                      {t(tp === "tecnicas" ? "slot_tecnica" : "slot_espada")}
                    </button>
                  ))}
                </div>
                {hasBuild && (
                  <button data-testid="calc-use-build-button" onClick={() => applyBuild(false)} className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 px-4 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/10">
                    <Hammer className="h-3.5 w-3.5" /> {t("useBuild")}
                  </button>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <PickerButton testId="calc-attacker-picker" item={attacker} label={t("attacker")} placeholder={t("selectAttacker")} onClick={() => setPicker("attacker")} />
                <PickerButton testId="calc-boss-picker" item={boss} label={t("boss")} placeholder={t("selectBoss")} onClick={() => setPicker("boss")} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <span className="font-mono-g block text-[10px] uppercase tracking-widest text-slate-500">{t("bonusPct")}</span>
                  <input data-testid="calc-bonus-input" type="number" value={bonus} onChange={(e) => setBonus(Number(e.target.value) || 0)}
                    className="font-mono-g mt-1 w-full bg-transparent text-lg font-bold text-white outline-none" />
                  <span className="text-[10px] text-slate-500">{t("bonusHint")}</span>
                </label>
                <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-3">
                  <span className="text-xs text-slate-300">{t("includeForm")}</span>
                  <Switch data-testid="calc-form-switch" checked={withForm} onCheckedChange={setWithForm} disabled={!boss?.stats.vidaExtra} />
                </label>
              </div>
            </motion.div>

            {boss && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat testId="calc-boss-hp" label={t("hpTotal")} value={fmtNum(bossHp(boss, withForm))} color="#ef4444" />
                <Stat testId="calc-boss-def" label={t("effDefense")} value={f.def} color="#3b82f6" />
                <Stat testId="calc-boss-res" label={t("effResist")} value={`${(f.res * 100).toFixed(1)}%`} color="#06b6d4" />
                <Stat testId="calc-boss-red" label={t("dmgReduction")} value={`${(f.red * 100).toFixed(1)}%`} color="#eab308" />
              </div>
            )}

            <div className="rounded-2xl border border-white/5 bg-[#10141e]/90 p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-mono-g text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">{t("skillsTab")} · {rows.length}</h2>
                {attacker && <button data-testid="calc-open-attacker-detail" onClick={() => openDetail(type, attacker.id)} className="text-xs text-purple-300 hover:underline">{t("details")}</button>}
              </div>
              {!detail ? <p className="py-8 text-center text-sm text-slate-500">{t("loading")}</p>
                : rows.length === 0 ? <p data-testid="calc-no-skills" className="py-8 text-center text-sm text-slate-500">{t("noDamageSkills")}</p>
                : <SkillTable rows={rows} color={color} />}
            </div>

            <div className="flex gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4">
              <Info className="mt-0.5 h-4 w-4 flex-none text-cyan-400" />
              <div><p className="text-sm font-semibold text-cyan-200">{t("formulaTitle")}</p><p data-testid="calc-formula" className="mt-1 text-xs leading-relaxed text-slate-400">{t("formulaText")}</p></div>
            </div>
          </div>

          <div className="xl:col-span-4">
            {skills.length > 0 && <Ranking bosses={lists.bosses} skills={skills} bonus={bonus} withForm={withForm} activeId={bossId} onPick={setBossId} />}
          </div>
        </div>
      )}

      {lists && picker && (
        <ItemPicker open={!!picker} onOpenChange={(o) => !o && setPicker(null)}
          title={picker === "boss" ? t("selectBoss") : t("selectAttacker")}
          options={picker === "boss" ? lists.bosses : lists[type]}
          selectedId={picker === "boss" ? bossId : attackerId}
          testId={picker === "boss" ? "calc-boss-list" : "calc-attacker-list"}
          onPick={(o) => (picker === "boss" ? setBossId(o.id) : (setDetail(null), setAttackerId(o.id)))} />
      )}
    </div>
  );
}
