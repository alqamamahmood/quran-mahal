"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dictionaries, rtlLanguages, t as translate, LANG_COOKIE } from "./dictionaries";
import type { UiLanguage } from "@/lib/types";

interface LangCtx {
  lang: UiLanguage;
  setLang: (l: UiLanguage) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LangCtx>({
  lang: "roman",
  setLang: () => {},
  t: (k) => k,
  dir: "ltr",
});

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: UiLanguage;
}) {
  const [lang, setLangState] = useState<UiLanguage>(initialLang);
  const router = useRouter();

  useEffect(() => {
    const dir = rtlLanguages.includes(lang) ? "rtl" : "ltr";
    document.documentElement.lang = lang === "ur" ? "ur" : "en";
    document.documentElement.dir = dir;
  }, [lang]);

  const setLang = (l: UiLanguage) => {
    if (!dictionaries[l] || l === lang) return;
    setLangState(l);
    // Persist for SSR: cookie (server reads) + localStorage (client fallback)
    document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; SameSite=Lax`;
    try {
      localStorage.setItem("qm-lang", l);
    } catch {
      /* ignore */
    }
    router.refresh();
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t: (key: string) => translate(lang, key),
        dir: rtlLanguages.includes(lang) ? "rtl" : "ltr",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
