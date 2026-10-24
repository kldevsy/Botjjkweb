import { Quote } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { SkillList } from "./SkillList";

const KV = ({ kv }) => {
  const { label } = useI18n();
  const entries = Object.entries(kv || {});
  if (!entries.length) return null;
  return (
    <dl className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
      {entries.map(([k, v]) => (
        <div key={k} className="flex items-start justify-between gap-3 rounded-lg bg-black/30 px-3 py-2">
          <dt className="text-[11px] text-slate-500">{label(k)}</dt>
          <dd className="font-mono-g max-w-[60%] break-words text-right text-[11px] font-medium text-slate-200">{v}</dd>
        </div>
      ))}
    </dl>
  );
};

const Body = ({ s, color, prefix }) => {
  const { label } = useI18n();
  switch (s.type) {
    case "text":
      return <p className="text-sm leading-relaxed text-slate-300">{s.text}</p>;
    case "tags":
      return (
        <div className="flex flex-wrap gap-1.5">
          {s.tags.map((tg) => (
            <span key={tg} className="font-mono-g rounded-full border px-2.5 py-1 text-[11px]" style={{ borderColor: `${color}55`, color }}>{tg}</span>
          ))}
        </div>
      );
    case "skills":
      return <SkillList skills={s.skills} color={color} prefix={prefix} />;
    case "quotes":
      return (
        <div className="grid gap-2">
          {s.quotes.map((q) => (
            <blockquote key={q.key} className="relative rounded-xl border-l-2 bg-black/30 py-3 pl-10 pr-4 text-sm italic text-slate-300" style={{ borderColor: color }}>
              <Quote className="absolute left-3 top-3 h-4 w-4 opacity-50" style={{ color }} />
              <span className="font-mono-g mb-1 block text-[10px] not-italic uppercase tracking-widest text-slate-500">{label(q.key)}</span>
              “{q.text}”
            </blockquote>
          ))}
        </div>
      );
    case "list":
      return (
        <div className="grid gap-2">
          {s.entries.map((e, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-[#0d111a] p-3">
              <h5 className="font-display text-sm font-semibold text-white">{e.title}</h5>
              {e.descricao && <p className="mt-1 text-xs leading-relaxed text-slate-400">{e.descricao}</p>}
              {Object.keys(e.kv).length > 0 && <div className="mt-2"><KV kv={e.kv} /></div>}
              {e.skills?.length > 0 && <div className="mt-2"><SkillList skills={e.skills} color={color} prefix={`${prefix}-${i}`} /></div>}
            </div>
          ))}
        </div>
      );
    default:
      return (
        <div className="grid gap-3">
          {s.title && <h5 className="font-display text-sm font-semibold" style={{ color }}>{s.title}</h5>}
          {s.text && <p className="text-sm leading-relaxed text-slate-300">{s.text}</p>}
          <KV kv={s.kv} />
          {s.skills?.length > 0 && <SkillList skills={s.skills} color={color} prefix={prefix} />}
        </div>
      );
  }
};

export const SectionBlock = ({ section, color }) => {
  const { label } = useI18n();
  const prefix = `section-${section.key}`;
  return (
    <section data-testid={prefix} className="space-y-3">
      <h4 className="font-mono-g flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
        <span className="h-px w-6" style={{ background: color }} />
        {label(section.key)}
      </h4>
      <Body s={section} color={color} prefix={prefix} />
    </section>
  );
};
