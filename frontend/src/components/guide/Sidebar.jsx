import { NavLink } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/meta";

const linkCls = ({ isActive }) =>
  `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive ? "bg-white/[0.06] text-white" : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
  }`;

export const SidebarNav = ({ counts = {}, onNavigate }) => {
  const { t, cat } = useI18n();
  return (
    <nav className="flex flex-col gap-1">
      <NavLink to="/" end className={linkCls} onClick={onNavigate} data-testid="nav-dashboard">
        <LayoutDashboard className="h-4 w-4" /> {t("dashboard")}
      </NavLink>
      <p className="font-mono-g mb-1 mt-5 px-3 text-[10px] uppercase tracking-[0.25em] text-slate-600">{t("navGuide")}</p>
      {CATEGORY_ORDER.map((k) => {
        const { icon: Icon, color, kanji } = CATEGORY_META[k];
        return (
          <NavLink key={k} to={`/c/${k}`} className={linkCls} onClick={onNavigate} data-testid={`nav-${k}`}>
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full" style={{ background: color, boxShadow: `0 0 12px ${color}` }} />}
                <Icon className="h-4 w-4" style={{ color: isActive ? color : undefined }} />
                <span className="flex-1">{cat(k)}</span>
                <span className="font-kanji text-xs opacity-0 transition-opacity group-hover:opacity-40">{kanji}</span>
                <span className="font-mono-g rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] text-slate-500">{counts[k] ?? "·"}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export const Brand = () => {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/40 bg-purple-500/10">
        <span className="font-kanji text-xl font-black text-purple-300">呪</span>
        <span className="aura absolute inset-0 rounded-xl bg-purple-500/20 blur-md" />
      </div>
      <div>
        <p className="font-display text-sm font-extrabold leading-tight text-white">{t("appName")}</p>
        <p className="font-mono-g text-[10px] uppercase tracking-widest text-slate-500">{t("appTag")}</p>
      </div>
    </div>
  );
};
