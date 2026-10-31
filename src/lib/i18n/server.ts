import { cookies } from "next/headers";
import { dictionaries, rtlLanguages, t as translate, LANG_COOKIE } from "./dictionaries";
import type { UiLanguage } from "@/lib/types";

export const DEFAULT_LANG: UiLanguage = "roman";

function parseLang(v: string | undefined): UiLanguage {
  return v === "en" || v === "ur" || v === "roman" ? v : DEFAULT_LANG;
}

/** Server-side: read the UI language from the cookie (set by the language selector). */
export async function getServerLang(): Promise<UiLanguage> {
  const store = await cookies();
  return parseLang(store.get(LANG_COOKIE)?.value);
}

export interface Dictionary {
  lang: UiLanguage;
  dir: "ltr" | "rtl";
  t: (key: string) => string;
}

/** Server-side dictionary for Server Components. */
export async function getDictionary(): Promise<Dictionary> {
  const lang = await getServerLang();
  return {
    lang,
    dir: rtlLanguages.includes(lang) ? "rtl" : "ltr",
    t: (key: string) => translate(lang, key),
  };
}

export { dictionaries };
