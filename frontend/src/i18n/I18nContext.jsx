import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { UI, CATS, CAT_DESC, RARITY, LABELS } from "./translations";

const LANGS = ["pt", "en", "es"];
const I18nCtx = createContext(null);

const prettify = (k) =>
  String(k)
    .replace(/[_.]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => localStorage.getItem("guide-lang") || "pt");
  const setLang = (l) => {
    localStorage.setItem("guide-lang", l);
    setLangState(l);
  };
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => {
    const i = LANGS.indexOf(lang);
    const pick = (dict, k, fallback) => (dict[k] ? dict[k][i] : fallback);
    return {
      lang,
      setLang,
      t: (k) => pick(UI, k, k),
      cat: (k) => pick(CATS, k, prettify(k)),
      catDesc: (k) => pick(CAT_DESC, k, ""),
      rarity: (k) => pick(RARITY, k, k),
      label: (k) => {
        const parts = String(k).split(".");
        return parts.map((p) => pick(LABELS, p, prettify(p))).join(" › ");
      },
    };
  }, [lang]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
};

export const useI18n = () => useContext(I18nCtx);
export const LANG_OPTIONS = [
  { code: "pt", label: "Português", short: "PT" },
  { code: "en", label: "English", short: "EN" },
  { code: "es", label: "Español", short: "ES" },
];
