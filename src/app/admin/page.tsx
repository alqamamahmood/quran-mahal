import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDictionary } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const d = await getDictionary();
  let stats = {
    users: 0, videos: 0, audio: 0, books: 0, rasail: 0, views: 0,
    subscriptions: 0, reports: 0,
  };
  let recent: Array<{ id: string; title: string; type: string; status: string; created_at: string }> = [];
  let recentUsers: Array<{ id: string; email: string | null; created_at: string }> = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const [
        users, videos, audio, books, pubs, articles, subs, reps, viewsAgg, recentItems, newUsers,
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("content_items").select("*", { count: "exact", head: true }).eq("type", "video").eq("status", "published"),
        supabase.from("content_items").select("*", { count: "exact", head: true }).eq("type", "audio").eq("status", "published"),
        supabase.from("content_items").select("*", { count: "exact", head: true }).eq("type", "book").eq("status", "published"),
        supabase.from("content_items").select("*", { count: "exact", head: true }).eq("type", "publication").eq("status", "published"),
        supabase.from("content_items").select("*", { count: "exact", head: true }).eq("type", "article").eq("status", "published"),
        supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("content_items").select("view_count").eq("status", "published"),
        supabase.from("content_items").select("id, title, type, status, created_at").order("created_at", { ascending: false }).limit(8),
        supabase.from("profiles").select("id, email, created_at").order("created_at", { ascending: false }).limit(5),
      ]);
      stats = {
        users: users.count ?? 0,
        videos: videos.count ?? 0,
        audio: audio.count ?? 0,
        books: books.count ?? 0,
        rasail: (pubs.count ?? 0) + (articles.count ?? 0),
        views: (viewsAgg.data ?? []).reduce((s: number, r: { view_count: number | null }) => s + (r.view_count ?? 0), 0),
        subscriptions: subs.count ?? 0,
        reports: reps.count ?? 0,
      };
      recent = (recentItems.data ?? []) as typeof recent;
      recentUsers = (newUsers.data ?? []) as typeof recentUsers;
    } catch { /* show zeros in sample mode */ }
  }

  const cards = [
    { key: "admin.stats.users", value: stats.users, icon: "👥", href: "/admin/users" },
    { key: "admin.stats.videos", value: stats.videos, icon: "🎬", href: "/admin/videos" },
    { key: "admin.stats.audio", value: stats.audio, icon: "🎧", href: "/admin/audio" },
    { key: "admin.stats.books", value: stats.books, icon: "📚", href: "/admin/books" },
    { key: "admin.stats.rasail", value: stats.rasail, icon: "📰", href: "/admin/rasail" },
    { key: "admin.stats.views", value: stats.views, icon: "👁", href: "/admin/content" },
    { key: "admin.stats.subs", value: stats.subscriptions, icon: "⭐", href: "/admin/memberships" },
    { key: "admin.stats.reports", value: stats.reports, icon: "🚩", href: "/admin/reports" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{d.t("admin.dash.title")}</h1>
        <Link href="/admin/content/new" className="inline-flex h-11 items-center rounded-xl bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-800">
          {d.t("admin.dash.newContent")}
        </Link>
      </div>
      {!isSupabaseConfigured() && (
        <p className="mt-3 rounded-xl border border-dashed border-gold-500/60 bg-gold-100/40 px-4 py-2 text-xs">
          {d.t("admin.dash.sampleMode")}
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.key} href={c.href}>
            <Card className="hover:shadow-lift transition-shadow">
              <CardBody>
                <span className="text-2xl" aria-hidden>{c.icon}</span>
                <p className="mt-2 text-3xl font-extrabold text-brand-800 dark:text-brand-200">
                  {c.value.toLocaleString()}
                </p>
                <p className="text-xs font-semibold text-neutral-500">{d.t(c.key)}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardBody>
            <h2 className="font-bold mb-3">{d.t("admin.dash.recentContent")}</h2>
            <ul className="space-y-2 text-sm">
              {recent.length === 0 && <li className="text-neutral-500">{d.t("admin.dash.empty")}</li>}
              {recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">{r.title}</span>
                  <Badge tone={r.status === "published" ? "brand" : "neutral"}>{r.status}</Badge>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h2 className="font-bold mb-3">{d.t("admin.dash.recentUsers")}</h2>
            <ul className="space-y-2 text-sm">
              {recentUsers.length === 0 && <li className="text-neutral-500">{d.t("admin.dash.empty")}</li>}
              {recentUsers.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium" dir="ltr">{u.email}</span>
                  <span className="text-xs text-neutral-400">{new Date(u.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
