import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Payment Records", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PaymentsAdminPage() {
  const d = await getDictionary();
  let rows: Array<{
    id: string; amount: number | null; currency: string | null; provider: string | null;
    status: string; external_payment_id: string | null; created_at: string;
    profiles: { email: string | null } | null;
  }> = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("payment_records")
        .select("id, amount, currency, provider, status, external_payment_id, created_at, profiles(email)")
        .order("created_at", { ascending: false })
        .limit(100);
      rows = (data ?? []) as unknown as typeof rows;
    } catch { /* empty */ }
  }

  const totals = rows.filter((r) => r.status === "succeeded")
    .reduce((s, r) => s + Number(r.amount ?? 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{d.t("admin.pay.title")}</h1>
      <p className="mt-1 text-sm text-neutral-500">{d.t("admin.pay.subtitle")}</p>
      <Card className="mt-4"><CardBody>
        <p className="text-xs text-neutral-500">{d.t("admin.pay.total")}</p>
        <p className="text-2xl font-extrabold text-brand-800 dark:text-brand-200">{totals.toLocaleString()}</p>
      </CardBody></Card>
      <div className="mt-4 space-y-2">
        {rows.map((r) => (
          <Card key={r.id}><CardBody className="flex items-center justify-between gap-3">
            <div className="text-sm">
              <p className="font-bold" dir="ltr">{r.profiles?.email ?? "—"}</p>
              <p className="text-xs text-neutral-500" dir="ltr">{r.external_payment_id} · {new Date(r.created_at).toLocaleString()}</p>
            </div>
            <div className="text-end">
              <p className="font-bold">{r.currency} {Number(r.amount ?? 0).toLocaleString()}</p>
              <Badge tone={r.status === "succeeded" ? "brand" : r.status === "failed" ? "red" : "neutral"}>{r.status}</Badge>
            </div>
          </CardBody></Card>
        ))}
        {rows.length === 0 && <p className="text-sm text-neutral-500">{d.t("admin.pay.empty")}</p>}
      </div>
    </div>
  );
}
