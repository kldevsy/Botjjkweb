import { createContext, useContext, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/I18nContext";

const GuideCtx = createContext(null);

export const GuideProvider = ({ children }) => {
  const { t } = useI18n();
  const [detail, setDetail] = useState(null);
  const [compare, setCompare] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleCompare = useCallback(
    (item) => {
      const same = (c) => c.id === item.id && c.category === item.category;
      if (compare.some(same)) return setCompare(compare.filter((c) => !same(c)));
      if (compare.length && compare[0].category !== item.category) {
        toast(t("compareSameCat"));
        return setCompare([item]);
      }
      if (compare.length >= 3) return toast.error(t("compareLimit"));
      setCompare([...compare, item]);
    },
    [t, compare]
  );

  const value = useMemo(
    () => ({
      detail,
      openDetail: (category, id) => setDetail({ category, id }),
      closeDetail: () => setDetail(null),
      compare,
      toggleCompare,
      isComparing: (item) => compare.some((c) => c.id === item.id && c.category === item.category),
      clearCompare: () => setCompare([]),
      compareOpen,
      setCompareOpen,
      searchOpen,
      setSearchOpen,
    }),
    [detail, compare, toggleCompare, compareOpen, searchOpen]
  );

  return <GuideCtx.Provider value={value}>{children}</GuideCtx.Provider>;
};

export const useGuide = () => useContext(GuideCtx);
