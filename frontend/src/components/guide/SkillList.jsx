import { Flame, Timer, Droplets, Shield, HeartPulse, Zap, Crosshair } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

const Pill = ({ icon: Icon, value, label, color }) => (
  <span className="font-mono-g inline-flex items-center gap-1 rounded-md bg-black/40 px-2 py-1 text-[11px] text-slate-200" title={label}>
    <Icon className="h-3 w-3" style={{ color }} /> {value}
  </span>
);

const SkillCard = ({ skill, index, maxDano, color, testId }) => {
  const { t } = useI18n();
  const pct = maxDano > 0 ? Math.max(4, (skill.dano / maxDano) * 100) : 0;
  return (
    <div data-testid={testId} className="group relative overflow-hidden rounded-xl border border-white/5 bg-[#0d111a] p-4 transition-colors hover:border-white/15">
      <div className="flex gap-4">
        {skill.imagem && (
          <img src={skill.imagem} alt="" referrerPolicy="no-referrer" loading="lazy" onError={(e) => (e.currentTarget.style.display = "none")}
            className="hidden h-20 w-28 flex-none rounded-lg object-cover sm:block" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono-g text-[10px] text-slate-500">{String(index + 1).padStart(2, "0")}</span>
            <h4 className="font-display text-sm font-bold text-white">{skill.nome}</h4>
            {skill.tipo && (
              <span className="font-mono-g rounded border px-1.5 py-px text-[9px] uppercase tracking-widest" style={{ color, borderColor: `${color}55` }}>
                {skill.tipo}
              </span>
            )}
            {skill.nivel != null && <span className="font-mono-g text-[10px] text-slate-400">{t("level")} {skill.nivel}</span>}
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{skill.descricao}</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {skill.dano > 0 && <Pill icon={Flame} value={skill.dano} label={t("damage")} color="#ef4444" />}
            {skill.cura > 0 && <Pill icon={HeartPulse} value={skill.cura} label={t("heal")} color="#10b981" />}
            {skill.defesa > 0 && <Pill icon={Shield} value={skill.defesa} label={t("defense")} color="#3b82f6" />}
            {skill.custoStamina != null && <Pill icon={Droplets} value={skill.custoStamina} label={t("stamina")} color="#06b6d4" />}
            {skill.cooldown != null && <Pill icon={Timer} value={`${skill.cooldown}t`} label={t("cooldown")} color="#eab308" />}
            {skill.stun && <Pill icon={Zap} value={t("stun")} label={t("stun")} color="#f472b6" />}
            {skill.tipoAlvo && <Pill icon={Crosshair} value={skill.tipoAlvo} label={t("target")} color="#a855f7" />}
          </div>
          {(skill.tags.length > 0 || skill.debuff) && (
            <div className="mt-2 flex flex-wrap gap-1">
              {skill.tags.map((tag) => (
                <span key={tag} className="font-mono-g rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400">{tag}</span>
              ))}
              {skill.debuff && Object.entries(skill.debuff).map(([k, v]) => (
                <span key={k} className="font-mono-g rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-300">debuff.{k}: {v}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      {skill.dano > 0 && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/5">
          <div className="stat-bar-fill h-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, #ef4444)` }} />
        </div>
      )}
    </div>
  );
};

export const SkillList = ({ skills, color, prefix }) => {
  const { t } = useI18n();
  if (!skills?.length) return <p className="text-sm text-slate-500">{t("noSkills")}</p>;
  const maxDano = Math.max(...skills.map((s) => s.dano || 0));
  return (
    <div className="grid gap-2.5">
      {skills.map((s, i) => (
        <SkillCard key={`${s.nome}-${i}`} skill={s} index={i} maxDano={maxDano} color={color} testId={`${prefix}-skill-${i}`} />
      ))}
    </div>
  );
};
