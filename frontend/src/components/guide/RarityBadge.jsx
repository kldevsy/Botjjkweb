import { useI18n } from "@/i18n/I18nContext";
import { RARITY_COLORS } from "@/lib/meta";

export const RarityBadge = ({ rarity, original, testId }) => {
  const { rarity: tr, t } = useI18n();
  const c = RARITY_COLORS[rarity];
  if (!rarity) {
    return original ? (
      <span data-testid={testId} className="font-mono-g rounded-full border border-slate-600/60 bg-slate-900/70 px-2 py-0.5 text-[10px] uppercase tracking-widest text-slate-300">
        {original}
      </span>
    ) : null;
  }
  const premium = ["mitico", "limitado", "exclusivo"].includes(rarity);
  return (
    <span
      data-testid={testId}
      className={`font-mono-g inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${premium ? "rarity-shimmer" : ""}`}
      style={{
        color: c,
        borderColor: `${c}80`,
        backgroundColor: `${c}1f`,
        backgroundImage: premium ? `linear-gradient(90deg, transparent, ${c}40, transparent)` : undefined,
      }}
      title={t("sortRarity")}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
      {tr(rarity)}
    </span>
  );
};
