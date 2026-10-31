import { createClient, getUser, isSupabaseConfigured } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Payment History", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const d = await getDictionary();
  const user = await getUser();
  let rows: Array<{ id: string; amount: number | null; currency: string | null; provider: string | null; status: string; created_at: string }> = [];

  if (isSupabaseConfigured() && user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("payment_records")
      .select("id, amount, currency, provider, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    rows = (data ?? []) as typeof rows;
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{d.t("dash.payments.title")}</h1>
      <div className="mt-4 space-y-3">
        {rows.length === 0 && <EmptyState icon="🧾" title={d.t("dash.payments.empty.title")} description={d.t("dash.payments.empty.desc")} />}
        {rows.map((r) => (
          <Card key={r.id}>
            <CardBody className="flex items-center justify-between">
              <div>
                <p className="font-bold">{r.currency} {Number(r.amount ?? 0).toLocaleString()} <span className="text-xs font-medium text-neutral-500">via {r.provider}</span></p>
                <p className="text-xs text-neutral-500">{new Date(r.created_at).toLocaleString()}</p>
              </div>
              <Badge tone={r.status === "succeeded" ? "brand" : r.status === "failed" ? "red" : "neutral"}>{r.status}</Badge>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
