import Link from "next/link";
import { createClient, getUser, isSupabaseConfigured } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Dashboard", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const d = await getDictionary();
  const user = await getUser();
  let stats = { favorites: 0, watching: 0, listening: 0, reading: 0 };
  let subscription: { status: string; expires_at: string | null; plan_name: string | null } | null = null;

  if (isSupabaseConfigured() && user) {
    try {
      const supabase = await createClient();
      const [fav, wh, lh, rp, sub] = await Promise.all([
        supabase.from("favorites").select("content_item_id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("watch_history").select("content_item_id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("listening_history").select("content_item_id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("reading_progress").select("content_item_id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("subscriptions").select("status, expires_at, membership_plans(name)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      stats = {
        favorites: fav.count ?? 0,
        watching: wh.count ?? 0,
        listening: lh.count ?? 0,
        reading: rp.count ?? 0,
      };
      if (sub.data) {
        subscription = {
          status: sub.data.status,
          expires_at: sub.data.expires_at,
          plan_name: (sub.data.membership_plans as unknown as { name: string } | null)?.name ?? null,
        };
      }
    } catch { /* show zeros */ }
  }

  const cards = [
    { key: "dash.library.fav", value: stats.favorites, href: "/dashboard/favorites", icon: "❤️" },
    { key: "dash.library.watch", value: stats.watching, href: "/dashboard/continue-watching", icon: "▶" },
    { key: "dash.library.listen", value: stats.listening, href: "/dashboard/continue-listening", icon: "🎧" },
    { key: "dash.library.reading", value: stats.reading, href: "/dashboard/reading-progress", icon: "📖" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">
        {d.t("dash.greeting")}{user?.user_metadata?.display_name ? `, ${user.user_metadata.display_name}` : ""}!
      </h1>
      <p className="mt-1 text-sm text-neutral-500">{user?.email}</p>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.href} href={c.href}>
            <Card className="hover:shadow-lift transition-shadow">
              <CardBody>
                <span className="text-2xl" aria-hidden>{c.icon}</span>
                <p className="mt-2 text-3xl font-extrabold text-brand-800 dark:text-brand-200">{c.value}</p>
                <p className="text-sm font-semibold text-neutral-500">{d.t(c.key)}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-6">
        <CardBody>
          <h2 className="font-bold">{d.t("dash.membership.title")}</h2>
          {subscription ? (
            <p className="mt-2 text-sm">
              <strong>{subscription.plan_name}</strong> — {subscription.status}
              {subscription.expires_at && <> · {d.t("dash.membership.expiresAt")}: {new Date(subscription.expires_at).toLocaleDateString()}</>}
            </p>
          ) : (
            <p className="mt-2 text-sm text-neutral-500">{d.t("dash.membership.free")}</p>
          )}
          <Link href="/pricing" className="mt-3 inline-flex h-10 items-center rounded-xl bg-brand-700 px-4 text-sm font-bold text-white">
            {d.t("dash.membership.viewPlans")}
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
