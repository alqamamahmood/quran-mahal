"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/provider";

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-brand-100 dark:border-white/10 bg-sand dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-extrabold text-brand-900 dark:text-white">Quran Mahal</p>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{t("footer.tagline")}</p>
        </div>
        <nav aria-label="Library">
          <p className="font-bold text-sm mb-3 text-brand-900 dark:text-brand-100">{t("nav.library")}</p>
          <ul className="space-y-2 text-sm">
            {[
              ["/bayanaat", t("nav.bayanaat")],
              ["/audio", t("nav.audio")],
              ["/books", t("nav.books")],
              ["/rasail", t("nav.rasail")],
              ["/quran", t("nav.quran")],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-neutral-600 hover:text-brand-700 dark:text-neutral-400">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Learn">
          <p className="font-bold text-sm mb-3 text-brand-900 dark:text-brand-100">{t("nav.more")}</p>
          <ul className="space-y-2 text-sm">
            {[
              ["/duas", t("nav.duas")],
              ["/scholars", t("nav.scholars")],
              ["/about", t("common.about")],
              ["/pricing", t("common.premium")],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-neutral-600 hover:text-brand-700 dark:text-neutral-400">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Legal">
          <p className="font-bold text-sm mb-3 text-brand-900 dark:text-brand-100">Legal</p>
          <ul className="space-y-2 text-sm">
            {[
              ["/privacy", t("static.privacy.title")],
              ["/terms", t("static.terms.title")],
              ["/copyright", t("static.copyright.title")],
              ["/contact", t("static.contact.title")],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-neutral-600 hover:text-brand-700 dark:text-neutral-400">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-brand-100 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between text-xs text-neutral-500">
          <p>
            © {year} Quran Mahal. {t("footer.rights")}
          </p>
          <Link href="/login?next=%2Fadmin" className="font-semibold hover:text-brand-700 dark:hover:text-brand-300">
            🔐 {t("footer.admin")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
