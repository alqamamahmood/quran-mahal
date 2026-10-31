import Link from "next/link";
import { requireStaff } from "@/lib/auth/roles";
import { getDictionary } from "@/lib/i18n/server";

const NAV = [
  { href: "/admin", key: "admin.nav.overview", icon: "📊" },
  { href: "/admin/content", key: "admin.nav.content", icon: "🗂" },
  { href: "/admin/videos", key: "admin.nav.videos", icon: "🎬" },
  { href: "/admin/audio", key: "admin.nav.audio", icon: "🎧" },
  { href: "/admin/books", key: "admin.nav.books", icon: "📚" },
  { href: "/admin/rasail", key: "admin.nav.rasail", icon: "📰" },
  { href: "/admin/scholars", key: "admin.nav.scholars", icon: "👳" },
  { href: "/admin/categories", key: "admin.nav.categories", icon: "🏷" },
  { href: "/admin/users", key: "admin.nav.users", icon: "👥" },
  { href: "/admin/memberships", key: "admin.nav.memberships", icon: "⭐" },
  { href: "/admin/payments", key: "admin.nav.payments", icon: "🧾" },
  { href: "/admin/reports", key: "admin.nav.reports", icon: "🚩" },
  { href: "/admin/media", key: "admin.nav.media", icon: "🖼" },
  { href: "/admin/seo", key: "admin.nav.seo", icon: "🔍" },
  { href: "/admin/settings", key: "admin.nav.settings", icon: "⚙️" },
  { href: "/admin/audit-logs", key: "admin.nav.audit", icon: "📝" },
];

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireStaff();
  const d = await getDictionary();
  return (
    <div className="pt-6 grid gap-6 lg:grid-cols-[250px_1fr]">
      <aside className="lg:sticky lg:top-24 h-fit">
        <nav aria-label="Admin" className="rounded-2xl border border-brand-100 dark:border-white/10 bg-white dark:bg-neutral-900 p-2">
          <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-neutral-400">{d.t("admin.panel")}</p>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-brand-50 dark:hover:bg-white/5"
              >
                <span aria-hidden>{n.icon}</span>{d.t(n.key)}
              </Link>
            ))}
          </div>
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
