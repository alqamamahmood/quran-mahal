import Link from "next/link";
import { createClient, getUser, isSupabaseConfigured } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cancelSubscription } from "./actions";
import { getDictionary } from "@/lib/i18n/server";

export default async function MembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string; plan?: string }>;
}) {
  const { cancelled, plan } = await searchParams;
  const d = await getDictionary();
  const user = await getUser();
  let sub: { id: string; status: string; expires_at: string | null; plan_name: string | null } | null = null;

  if (isSupabaseConfigured() && user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("subscriptions")
      .select("id, status, expires_at, membership_plans(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) sub = { id: data.id, status: data.status, expires_at: data.expires_at, plan_name: (data.membership_plans as unknown as { name: string } | null)?.name ?? null };
  }

  const active = sub && ["active", "trialing"].includes(sub.status);

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{d.t("dash.membership.title")}</h1>
      {cancelled && <p className="mt-3 rounded-xl bg-brand-50 p-3 text-sm font-semibold text-brand-800">{d.t("dash.membership.cancelled")}</p>}
      {plan && <p className="mt-3 rounded-xl bg-gold-100/60 p-3 text-sm">{d.t("dash.membership.planSoon").replace("{plan}", plan)}</p>}
      <Card className="mt-4">
        <CardBody>
          {active ? (
            <>
              <p className="text-sm text-neutral-500">{d.t("dash.membership.currentPlan")}</p>
              <p className="text-2xl font-extrabold">{sub!.plan_name}</p>
              <p className="mt-1 text-sm">{d.t("dash.membership.status")} <strong>{sub!.status}</strong>
                {sub!.expires_at && <> · {d.t("dash.membership.expiresAt")}: {new Date(sub!.expires_at).toLocaleDateString()}</>}
              </p>
              <form action={cancelSubscription} className="mt-4">
                <input type="hidden" name="sub_id" value={sub!.id} />
                <Button type="submit" variant="danger" size="sm">{d.t("dash.membership.cancelBtn")}</Button>
              </form>
            </>
          ) : (
            <>
              <p className="text-sm text-neutral-500">{d.t("dash.membership.free")}</p>
              <Link href="/pricing" className="mt-4 inline-flex h-11 items-center rounded-xl bg-brand-700 px-5 font-bold text-white">{d.t("pricing.upgrade")}</Link>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
