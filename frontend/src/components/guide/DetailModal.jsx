import { useEffect, useState } from "react";
import { GitCompareArrows, Check, Link2, Hammer } from "lucide-react";
import { slotForItem, addToBuild } from "@/lib/build";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useGuide } from "@/context/GuideContext";
import { useI18n } from "@/i18n/I18nContext";
import { api } from "@/lib/api";
import { itemColor, fmtNum, CATEGORY_META } from "@/lib/meta";
import { ItemVisual } from "./ItemVisual";
import { RarityBadge } from "./RarityBadge";
import { SectionBlock } from "./Sections";

const MECH_KEYS = new Set(["mecanicaEspecial", "formaAlternativa", "transformação", "passiva", "passivas", "sistemaVariacoes",
  "mecanicaPassiva", "debuffs", "efeitos", "ia", "resistencias", "fraquezas", "imunidades", "escudo", "areiaModos", "bonus", "stats", "multipliers", "special"]);
const EXTRA_KEYS = new Set(["drops", "recompensas", "recompensa", "falas", "fases", "rodadas", "custos", "outros", "tecnicaRelacionada", "terrenosDisponiveis", "balance"]);

const groupSections = (sections) => {
  const g = { skills: [], mech: [], extra: [] };
  sections.forEach((s) => {
    if (s.type === "skills") g.skills.push(s);
    else if (EXTRA_KEYS.has(s.key)) g.extra.push(s);
    else if (MECH_KEYS.has(s.key)) g.mech.push(s);
    else g.extra.push(s);
  });
  return g;
};

const StatGrid = ({ stats, color }) => {
  const { label } = useI18n();
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {Object.entries(stats).map(([k, v]) => (
        <div key={k} data-testid={`detail-stat-${k}`} className="rounded-xl border border-white/5 bg-black/30 p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">{label(k)}</p>
          <p className="font-display mt-0.5 text-xl font-bold" style={{ color }}>{fmtNum(v)}</p>
        </div>
      ))}
    </div>
  );
};

const TabPanel = ({ value, sections, color }) => (
  <TabsContent value={value} className="mt-5 space-y-7">
    {sections.map((s, i) => <SectionBlock key={`${s.key}-${i}`} section={s} color={color} />)}
  </TabsContent>
);

export const DetailModal = () => {
  const { detail, closeDetail, toggleCompare, isComparing } = useGuide();
  const { t, cat, lang } = useI18n();
  const [item, setItem] = useState(null);

  useEffect(() => {
    if (!detail) return;
    setItem(null);
    api.item(detail.category, detail.id).then(setItem).catch(() => closeDetail());
  }, [detail, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const color = item ? itemColor(item) : "#a855f7";
  const g = item ? groupSections(item.sections) : null;
  const skillCount = g ? g.skills.reduce((a, s) => a + s.skills.length, 0) : 0;
  const Icon = item ? CATEGORY_META[item.category].icon : null;
  const selected = item && isComparing(item);

  const copyLink = () => {
    const url = `${window.location.origin}/c/${item.category}?item=${encodeURIComponent(item.id)}`;
    navigator.clipboard?.writeText(url);
    toast.success(t("copied"));
  };

  return (
    <Dialog open={!!detail} onOpenChange={(o) => !o && closeDetail()}>
      <DialogContent data-testid="item-detail-modal" className="scrollbar-thin max-h-[92vh] max-w-4xl overflow-y-auto border-white/10 bg-[#121722] p-0 sm:rounded-2xl">
        {!item ? (
          <div className="space-y-4 p-6">
            <DialogTitle className="sr-only">{t("loading")}</DialogTitle>
            <DialogDescription className="sr-only">{t("loading")}</DialogDescription>
            <Skeleton className="h-56 w-full rounded-xl bg-white/5" />
            <Skeleton className="h-6 w-1/2 bg-white/5" />
            <Skeleton className="h-24 w-full bg-white/5" />
          </div>
        ) : (
          <div>
            <div className="relative">
              <ItemVisual item={item} className="h-56 w-full sm:h-72" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono-g inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] uppercase tracking-widest text-slate-200 backdrop-blur">
                    <Icon className="h-3 w-3" style={{ color }} /> {cat(item.category)}
                  </span>
                  <RarityBadge rarity={item.raridade} original={item.raridadeOriginal} testId="detail-rarity" />
                  {item.tipo && <span className="font-mono-g rounded-full bg-black/60 px-2.5 py-1 text-[10px] uppercase tracking-widest text-slate-300 backdrop-blur">{item.tipo}</span>}
                </div>
                <DialogTitle data-testid="detail-title" className="font-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  {item.nome}
                </DialogTitle>
                {item.subtitulo && item.subtitulo !== item.tipo && <p className="mt-1 text-sm font-medium" style={{ color }}>{item.subtitulo}</p>}
              </div>
            </div>

            <div className="p-6 pt-4">
              <div className="mb-5 flex flex-wrap gap-2">
                <button data-testid="detail-compare-button" onClick={() => toggleCompare(item)}
                  className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-colors"
                  style={{ borderColor: `${color}80`, color: selected ? "#0b0e17" : color, background: selected ? color : "transparent" }}>
                  {selected ? <Check className="h-3.5 w-3.5" /> : <GitCompareArrows className="h-3.5 w-3.5" />} {t("compare")}
                </button>
                <button data-testid="detail-copy-link-button" onClick={copyLink}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/10">
                  <Link2 className="h-3.5 w-3.5" /> {t("copyLink")}
                </button>
                {slotForItem(item) && (
                  <button data-testid="detail-add-build-button" onClick={() => { const s = addToBuild(item); toast.success(`${t("addedToBuild")}: ${t(`slot_${s}`)}`); }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/10">
                    <Hammer className="h-3.5 w-3.5" /> {t("addToBuild")}
                  </button>
                )}
              </div>

              <Tabs defaultValue="overview">
                <TabsList className="h-auto flex-wrap justify-start gap-1 bg-black/40 p-1">
                  <TabsTrigger data-testid="detail-tab-overview" value="overview" className="text-xs">{t("overview")}</TabsTrigger>
                  {g.skills.length > 0 && <TabsTrigger data-testid="detail-tab-skills" value="skills" className="text-xs">{t("skillsTab")} · {skillCount}</TabsTrigger>}
                  {g.mech.length > 0 && <TabsTrigger data-testid="detail-tab-mechanics" value="mech" className="text-xs">{t("mechanicsTab")}</TabsTrigger>}
                  {g.extra.length > 0 && <TabsTrigger data-testid="detail-tab-extra" value="extra" className="text-xs">{t("extraTab")}</TabsTrigger>}
                </TabsList>
                <TabsContent value="overview" className="mt-5 space-y-6">
                  <DialogDescription data-testid="detail-description" className="text-sm leading-relaxed text-slate-300">{item.descricao}</DialogDescription>
                  <StatGrid stats={item.stats} color={color} />
                  <p className="font-mono-g text-[10px] uppercase tracking-widest text-slate-600">{t("dataNote")} · id: {item.id}</p>
                </TabsContent>
                <TabPanel value="skills" sections={g.skills} color={color} />
                <TabPanel value="mech" sections={g.mech} color={color} />
                <TabPanel value="extra" sections={g.extra} color={color} />
              </Tabs>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
