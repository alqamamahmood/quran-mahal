import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Audit Logs", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const d = await getDictionary();
  let rows: Array<{
    id: string; action: string; entity_type: string | null; entity_id: string | null;
    details: unknown; created_at: string; profiles: { email: string | null } | null;
  }> = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("audit_logs")
        .select("id, action, entity_type, entity_id, details, created_at, profiles:actor_id(email)")
        .order("created_at", { ascending: false })
        .limit(100);
      rows = (data ?? []) as unknown as typeof rows;
    } catch { /* empty */ }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{d.t("admin.audit.title")}</h1>
      <p className="mt-1 text-sm text-neutral-500">{d.t("admin.audit.subtitle")}</p>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-brand-100 dark:border-white/10">
        <table className="w-full text-sm min-w-[640px]">
          <thead><tr className="bg-brand-50 dark:bg-white/5 text-start">
            <th className="p-3 text-start">{d.t("admin.audit.time")}</th><th className="p-3 text-start">{d.t("admin.audit.actor")}</th>
            <th className="p-3 text-start">{d.t("admin.audit.action")}</th><th className="p-3 text-start">{d.t("admin.audit.entity")}</th>
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-brand-100 dark:border-white/10">
                <td className="p-3 text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-3 text-xs" dir="ltr">{r.profiles?.email ?? d.t("admin.audit.system")}</td>
                <td className="p-3"><Badge tone="neutral" className="font-mono">{r.action}</Badge></td>
                <td className="p-3 text-xs" dir="ltr">{r.entity_type}{r.entity_id ? ` · ${r.entity_id.slice(0, 8)}…` : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-center text-sm text-neutral-500">{d.t("admin.audit.empty")}</p>}
      </div>
    </div>
  );
}
