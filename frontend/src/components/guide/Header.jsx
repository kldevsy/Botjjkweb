import { useState } from "react";
import { Search, Languages, Menu, GitCompareArrows } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useI18n, LANG_OPTIONS } from "@/i18n/I18nContext";
import { useGuide } from "@/context/GuideContext";
import { SidebarNav, Brand } from "./Sidebar";

export const Header = ({ counts }) => {
  const { t, lang, setLang } = useI18n();
  const { setSearchOpen, compare, setCompareOpen } = useGuide();
  const [menu, setMenu] = useState(false);
  const current = LANG_OPTIONS.find((l) => l.code === lang);

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-8">
        <button data-testid="mobile-menu-button" className="rounded-lg p-2 text-slate-300 hover:bg-white/5 lg:hidden" onClick={() => setMenu(true)}>
          <Menu className="h-5 w-5" />
        </button>
        <div className="lg:hidden"><Brand /></div>

        <button
          data-testid="global-search-trigger"
          onClick={() => setSearchOpen(true)}
          className="ml-auto flex h-10 flex-1 items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm text-slate-500 transition-colors hover:border-purple-500/40 hover:text-slate-300 lg:ml-0 lg:max-w-md"
        >
          <Search className="h-4 w-4" />
          <span className="hidden truncate sm:inline">{t("searchPlaceholder")}</span>
          <kbd className="font-mono-g ml-auto hidden rounded border border-white/10 px-1.5 py-0.5 text-[10px] sm:inline">Ctrl K</kbd>
        </button>

        <div className="flex items-center gap-2 lg:ml-auto">
          {compare.length > 0 && (
            <button data-testid="header-compare-button" onClick={() => setCompareOpen(true)} disabled={compare.length < 2}
              className="relative hidden items-center gap-1.5 rounded-full border border-purple-500/40 px-3 py-2 text-xs font-semibold text-purple-300 disabled:opacity-50 sm:flex">
              <GitCompareArrows className="h-4 w-4" /> {compare.length}
            </button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button data-testid="language-switcher" className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/5">
                <Languages className="h-4 w-4 text-cyan-400" /> {current.short}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-white/10 bg-[#121722]">
              {LANG_OPTIONS.map((l) => (
                <DropdownMenuItem key={l.code} data-testid={`language-option-${l.code}`} onClick={() => setLang(l.code)}
                  className={lang === l.code ? "text-purple-300" : ""}>
                  <span className="font-mono-g mr-2 text-[10px] text-slate-500">{l.short}</span> {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="left" className="w-72 border-white/10 bg-[#0b0e17] p-5">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">{t("navGuide")}</SheetDescription>
          <Brand />
          <div className="mt-8"><SidebarNav counts={counts} onNavigate={() => setMenu(false)} /></div>
        </SheetContent>
      </Sheet>
    </header>
  );
};
