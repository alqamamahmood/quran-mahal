"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const ICONS: Record<string, string> = {
  home: "⌂",
  bayanaat: "▶",
  audio: "♪",
  books: "📚",
  more: "⋯",
};

const TABS = [
  { key: "nav.home", href: "/", icon: "home" },
  { key: "nav.bayanaat", href: "/bayanaat", icon: "bayanaat" },
  { key: "nav.audio", href: "/audio", icon: "audio" },
  { key: "nav.books", href: "/books", icon: "books" },
  { key: "nav.more", href: "/menu", icon: "more" },
];

export function BottomNav() {
  const { t } = useLanguage();
  const pathname = usePathname();
  return (
    <nav
      aria-label="Mobile"
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-brand-100 dark:border-white/10 bg-ivory/95 dark:bg-neutral-950/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold min-h-[60px] justify-center",
                active ? "text-brand-700 dark:text-brand-300" : "text-neutral-500 dark:text-neutral-400"
              )}
            >
              <span className={cn("text-xl leading-none", active && "scale-110")} aria-hidden>
                {ICONS[tab.icon]}
              </span>
              {t(tab.key)}
              {active && <span className="h-1 w-6 rounded-full bg-gold-500" aria-hidden />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
