import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { reviewReport } from "../actions";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Reports", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const d = await getDictionary();
  let rows: Array<{
    id: string; reason: string; details: string | null; status: string; created_at: string;
    content_items: { title: string; slug: string } | null;
    profiles: { email: string | null } | null;
  }> = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("reports")
        .select("id, reason, details, status, created_at, content_items(title, slug), profiles:reporter_id(email)")
        .order("created_at", { ascending: false })
        .limit(100);
      rows = (data ?? []) as unknown as typeof rows;
    } catch { /* empty */ }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{d.t("admin.rep.title")}</h1>
      <div className="mt-4 space-y-3">
        {rows.map((r) => (
          <Card key={r.id}><CardBody>
            <div className="flex justify-between gap-3 flex-wrap">
              <div className="text-sm">
                <p className="font-bold">{r.reason}</p>
                <p className="text-neutral-600 dark:text-neutral-400">{r.content_items?.title ?? "—"}</p>
                {r.details && <p className="mt-1 text-xs text-neutral-500">{r.details}</p>}
                <p className="mt-1 text-xs text-neutral-400" dir="ltr">
                  {r.profiles?.email ?? "anonymous"} · {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
              <Badge tone={r.status === "open" ? "red" : "neutral"}>{r.status}</Badge>
            </div>
            {r.status === "open" && (
              <form action={reviewReport} className="mt-3 flex gap-2">
                <input type="hidden" name="id" value={r.id} />
                {["reviewed", "resolved", "dismissed"].map((s) => (
                  <button key={s} name="status" value={s} className="rounded-lg border px-3 py-1.5 text-xs font-bold hover:bg-brand-50">
                    {s}
                  </button>
                ))}
              </form>
            )}
          </CardBody></Card>
        ))}
        {rows.length === 0 && <p className="text-sm text-neutral-500">{d.t("admin.rep.empty")}</p>}
      </div>
    </div>
  );
}
