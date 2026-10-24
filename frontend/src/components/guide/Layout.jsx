import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n/I18nContext";
import { Header } from "./Header";
import { SidebarNav, Brand } from "./Sidebar";
import { DetailModal } from "./DetailModal";
import { CompareTray } from "./CompareTray";
import { CompareDialog } from "./CompareDialog";
import { GlobalSearch } from "./GlobalSearch";

export const Layout = () => {
  const { t } = useI18n();
  const [cats, setCats] = useState([]);
  useEffect(() => { api.categories().then(setCats); }, []);
  const counts = Object.fromEntries(cats.map((c) => [c.key, c.count]));

  return (
    <div className="cursed-bg grain min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-white/5 bg-[#0b0e17]/95 p-5 lg:flex">
        <Brand />
        <div className="scrollbar-thin mt-8 flex-1 overflow-y-auto"><SidebarNav counts={counts} /></div>
        <p className="font-mono-g text-[10px] uppercase tracking-widest text-slate-600">{t("dataNote")}</p>
      </aside>
      <div className="relative z-10 lg:pl-64">
        <Header counts={counts} />
        <main className="px-4 pb-40 pt-8 sm:px-8">
          <Outlet context={{ cats }} />
        </main>
      </div>
      <DetailModal />
      <CompareDialog />
      <CompareTray />
      <GlobalSearch />
    </div>
  );
};
