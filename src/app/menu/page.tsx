"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/provider";

const LINKS = [
  { href: "/quran", key: "nav.quran", icon: "📖" },
  { href: "/duas", key: "nav.duas", icon: "🤲" },
  { href: "/scholars", key: "nav.scholars", icon: "👳" },
  { href: "/rasail", key: "nav.rasail", icon: "📰" },
  { href: "/dashboard/favorites", key: "nav.favorites", icon: "❤️" },
  { href: "/dashboard/library", key: "nav.library", icon: "📚" },
  { href: "/pricing", key: "common.premium", icon: "⭐" },
  { href: "/about", key: "common.about", icon: "ℹ️" },
  { href: "/contact", key: "common.contact", icon: "✉️" },
];

/** Overflow menu for the mobile bottom-nav "More" tab. */
export default function MenuPage() {
  const { t } = useLanguage();
  return (
    <div className="pt-6">
      <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{t("nav.more")}</h1>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center gap-3 rounded-2xl border border-brand-100 dark:border-white/10 bg-white dark:bg-neutral-900 p-4 shadow-card min-h-[64px]"
          >
            <span className="text-2xl" aria-hidden>{l.icon}</span>
            <span className="font-bold text-sm">{t(l.key)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
