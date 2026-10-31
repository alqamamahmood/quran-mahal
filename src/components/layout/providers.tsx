"use client";

import { LanguageProvider } from "@/lib/i18n/provider";
import { ThemeProvider } from "@/lib/theme/provider";
import { AudioPlayerProvider } from "@/lib/audio/player-context";
import type { UiLanguage } from "@/lib/types";

export function Providers({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: UiLanguage;
}) {
  return (
    <LanguageProvider initialLang={initialLang}>
      <ThemeProvider>
        <AudioPlayerProvider>{children}</AudioPlayerProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
