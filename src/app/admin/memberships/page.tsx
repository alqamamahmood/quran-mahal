import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { upsertPlan } from "../actions";
import type { MembershipPlan } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Memberships", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function MembershipsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; edit?: string }>;
}) {
  const { error, edit } = await searchParams;
  const d = await getDictionary();
  let plans: MembershipPlan[] = [];
  let subs: Array<{ id: string; status: string; expires_at: string | null; profiles: { email: string | null } | null; membership_plans: { name: string } | null }> = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const [p, s] = await Promise.all([
        supabase.from("membership_plans").select("*").order("sort_order"),
        supabase.from("subscriptions").select("id, status, expires_at, profiles(email), membership_plans(name)").order("created_at", { ascending: false }).limit(30),
      ]);
      plans = (p.data ?? []) as MembershipPlan[];
      subs = (s.data ?? []) as unknown as typeof subs;
    } catch { /* empty */ }
  }
  const editing = edit ? plans.find((p) => p.id === edit) : undefined;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{d.t("admin.plans.title")}</h1>
      {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!process.env.STRIPE_SECRET_KEY && (
        <p className="mt-3 rounded-xl border border-dashed border-gold-500/60 bg-gold-100/40 px-4 py-2 text-xs">
          {d.t("admin.plans.noStripe")}
        </p>
      )}

      <Card className="mt-4"><CardBody>
        <h2 className="font-bold mb-3">{editing ? d.t("admin.plans.edit") : d.t("admin.plans.new")}</h2>
        <form action={upsertPlan} className="grid sm:grid-cols-2 gap-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <Input name="name" label={`${d.t("admin.plans.name")} *`} required defaultValue={editing?.name ?? ""} />
          <Input name="slug" label={d.t("admin.plans.slug")} dir="ltr" defaultValue={editing?.slug ?? ""} />
          <Input name="price" label={`${d.t("admin.plans.price")} *`} type="number" min={0} step="0.01" required dir="ltr" defaultValue={editing?.price ?? 0} />
          <Input name="currency" label={d.t("admin.plans.currency")} dir="ltr" defaultValue={editing?.currency ?? "PKR"} />
          <Input name="duration_days" label={d.t("admin.plans.duration")} type="number" min={0} dir="ltr" defaultValue={editing?.duration_days ?? 30} />
          <Input name="trial_days" label={d.t("admin.plans.trial")} type="number" min={0} dir="ltr" defaultValue={editing?.trial_days ?? 0} />
          <Input name="sort_order" label={d.t("admin.plans.sortOrder")} type="number" dir="ltr" defaultValue={editing?.sort_order ?? 0} />
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold mb-1.5">{d.t("admin.plans.features")}
              <textarea name="features" rows={3} defaultValue={editing?.features.join("\n") ?? ""} className="mt-1 w-full rounded-xl border border-neutral-300 dark:border-white/15 bg-white dark:bg-neutral-900 px-3 py-2 text-sm" />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="is_active" defaultChecked={editing?.is_active ?? true} className="h-4 w-4" /> {d.t("admin.plans.active")}
          </label>
          <div className="sm:col-span-2"><Button type="submit">{editing ? d.t("common.update") : d.t("common.create")}</Button></div>
        </form>
      </CardBody></Card>

      <h2 className="mt-6 mb-2 font-bold">{d.t("admin.plans.listTitle")}</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        {plans.map((p) => (
          <Card key={p.id}><CardBody>
            <div className="flex justify-between items-start">
              <p className="font-bold">{p.name}</p>
              {!p.is_active && <Badge tone="neutral">{d.t("admin.plans.inactive")}</Badge>}
            </div>
            <p className="text-sm text-neutral-500">{p.currency} {Number(p.price).toLocaleString()} / {p.duration_days}d</p>
            <a href={`/admin/memberships?edit=${p.id}`} className="mt-2 inline-block rounded-lg border px-3 py-1.5 text-xs font-bold">{d.t("common.edit")}</a>
          </CardBody></Card>
        ))}
      </div>

      <h2 className="mt-6 mb-2 font-bold">{d.t("admin.plans.recentSubs")}</h2>
      <div className="space-y-2">
        {subs.map((s) => (
          <div key={s.id} className="flex justify-between items-center rounded-2xl border border-brand-100 dark:border-white/10 bg-white dark:bg-neutral-900 p-3 text-sm">
            <span dir="ltr" className="font-medium">{s.profiles?.email} · {s.membership_plans?.name}</span>
            <Badge tone={s.status === "active" ? "brand" : "neutral"}>{s.status}</Badge>
          </div>
        ))}
        {subs.length === 0 && <p className="text-sm text-neutral-500">{d.t("admin.dash.empty")}</p>}
      </div>
    </div>
  );
}
