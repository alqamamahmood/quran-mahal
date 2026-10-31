import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MiniPlayer } from "@/components/media/mini-player";
import { PwaManager } from "@/components/pwa/pwa-manager";
import { getUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getServerLang } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: { default: "Quran Mahal — Islamic Media & Learning", template: "%s | Quran Mahal" },
  description:
    "Video bayanaat, audio lectures, Islamic books, rasail, Quran, duas and scholar profiles — in Urdu, Roman Urdu and English.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    siteName: "Quran Mahal",
    type: "website",
    locale: "ur_PK",
  },
};

export const viewport: Viewport = {
  themeColor: "#064e3b",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let email: string | null = null;
  if (isSupabaseConfigured()) {
    try {
      const user = await getUser();
      email = user?.email ?? null;
    } catch {
      /* sample mode */
    }
  }
  const lang = await getServerLang();
  const dir = lang === "ur" ? "rtl" : "ltr";
  return (
    <html lang={lang === "ur" ? "ur" : "en"} dir={dir} suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-180.png" />
      </head>
      <body className="min-h-screen bg-ivory dark:bg-neutral-950">
        <Providers initialLang={lang}>
          <Header userEmail={email} />
          <main className="mx-auto max-w-7xl px-4 pb-28 lg:pb-10 min-h-[70vh]">
            {children}
          </main>
          <Footer />
          <BottomNav />
          <MiniPlayer />
          <PwaManager />
        </Providers>
      </body>
    </html>
  );
}
