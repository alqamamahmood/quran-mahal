import Link from "next/link";
import { requireUser } from "@/lib/auth/roles";
import { getDictionary } from "@/lib/i18n/server";

const LINKS = [
  { href: "/dashboard", key: "nav.profile", exact: true },
  { href: "/dashboard/favorites", key: "nav.favorites" },
  { href: "/dashboard/library", key: "nav.library" },
  { href: "/dashboard/continue-watching", key: "dash.library.watch" },
  { href: "/dashboard/continue-listening", key: "dash.library.listen" },
  { href: "/dashboard/reading-progress", key: "dash.library.reading" },
  { href: "/dashboard/membership", key: "dash.library.membership" },
  { href: "/dashboard/payments", key: "dash.library.payments" },
  { href: "/dashboard/settings", key: "dash.settings.title" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  const d = await getDictionary();
  return (
    <div className="pt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-24 h-fit">
        <nav aria-label="Dashboard" className="flex lg:flex-col gap-1.5 overflow-x-auto rounded-2xl border border-brand-100 dark:border-white/10 bg-white dark:bg-neutral-900 p-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-brand-50 dark:hover:bg-white/5 whitespace-nowrap"
            >
              {d.t(l.key)}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
