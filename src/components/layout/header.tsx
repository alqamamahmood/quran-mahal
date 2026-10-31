"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/provider";
import { useTheme } from "@/lib/theme/provider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { key: "nav.home", href: "/" },
  { key: "nav.bayanaat", href: "/bayanaat" },
  { key: "nav.audio", href: "/audio" },
  { key: "nav.books", href: "/books" },
  { key: "nav.rasail", href: "/rasail" },
  { key: "nav.quran", href: "/quran" },
  { key: "nav.scholars", href: "/scholars" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Quran Mahal home">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 text-gold-300 shadow-card">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
          <path d="M12 2c.7 4.8 4.2 8.3 9 9-4.8.7-8.3 4.2-9 9-.7-4.8-4.2-8.3-9-9 4.8-.7 8.3-4.2 9-9Z" />
          <circle cx="18.5" cy="5.5" r="1.6" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-extrabold text-brand-900 dark:text-white">
          Quran Mahal
        </span>
        <span className="block text-[11px] font-medium text-gold-600 dark:text-gold-400">
          قرآن محل
        </span>
      </span>
    </Link>
  );
}

export function Header({ userEmail }: { userEmail: string | null }) {
  const { t, lang, setLang } = useLanguage();
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const signOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      /* not configured */
    }
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100/80 dark:border-white/10 bg-ivory/90 dark:bg-neutral-950/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Logo />

        <nav className="hidden lg:flex items-center gap-1 ms-4" aria-label="Primary">
          {NAV.map((n) => (
            <Link
              key={n.key}
              href={n.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                pathname === n.href
                  ? "bg-brand-100 text-brand-900 dark:bg-brand-950 dark:text-brand-100"
                  : "text-neutral-600 hover:text-brand-800 hover:bg-brand-50 dark:text-neutral-300 dark:hover:bg-white/5"
              )}
            >
              {t(n.key)}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-sm ms-auto" role="search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search.placeholder")}
            aria-label={t("nav.search")}
            className="h-10 w-full rounded-full border border-brand-200 dark:border-white/15 bg-white dark:bg-neutral-900 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </form>

        <div className="ms-auto md:ms-0 flex items-center gap-1.5">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as "en" | "ur" | "roman")}
            aria-label="Language"
            className="h-10 rounded-full border border-brand-200 dark:border-white/15 bg-white dark:bg-neutral-900 px-2 text-sm font-semibold"
          >
            <option value="ur">اردو</option>
            <option value="roman">Roman</option>
            <option value="en">EN</option>
          </select>

          <button
            onClick={toggle}
            aria-label={theme === "light" ? "Dark mode" : "Light mode"}
            className="grid h-10 w-10 place-items-center rounded-full border border-brand-200 dark:border-white/15 text-lg"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {userEmail ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="grid h-10 w-10 place-items-center rounded-full bg-brand-700 text-white font-bold"
              >
                {userEmail[0]?.toUpperCase()}
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute end-0 mt-2 w-52 rounded-2xl border border-brand-100 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-lift p-2"
                >
                  <p className="px-3 py-2 text-xs text-neutral-500 truncate">{userEmail}</p>
                  {[
                    { href: "/dashboard", label: t("nav.profile") },
                    { href: "/dashboard/favorites", label: t("nav.favorites") },
                    { href: "/dashboard/library", label: t("nav.library") },
                  ].map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-brand-50 dark:hover:bg-white/5"
                    >
                      {l.label}
                    </Link>
                  ))}
                  <button
                    role="menuitem"
                    onClick={signOut}
                    className="w-full text-start rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    {t("auth.logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex h-10 items-center rounded-full bg-brand-700 px-4 text-sm font-bold text-white hover:bg-brand-800"
            >
              {t("auth.login")}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile search row */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={submitSearch} role="search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search.placeholder")}
            aria-label={t("nav.search")}
            className="h-10 w-full rounded-full border border-brand-200 dark:border-white/15 bg-white dark:bg-neutral-900 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </form>
      </div>
    </header>
  );
}
