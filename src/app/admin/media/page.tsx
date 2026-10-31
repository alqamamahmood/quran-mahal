import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Media Library", robots: { index: false } };
export const dynamic = "force-dynamic";

function fmt(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
}

export default async function MediaPage() {
  const d = await getDictionary();
  let assets: Array<{
    id: string; bucket: string; path: string; file_name: string | null;
    mime_type: string | null; size_bytes: number | null; created_at: string;
  }> = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("media_assets")
        .select("id, bucket, path, file_name, mime_type, size_bytes, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      assets = (data ?? []) as typeof assets;
    } catch { /* empty */ }
  }

  const total = assets.reduce((s, a) => s + (a.size_bytes ?? 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{d.t("admin.media.title")}</h1>
      <Card className="mt-4"><CardBody>
        <p className="text-xs text-neutral-500">{d.t("admin.media.tracked")}</p>
        <p className="text-2xl font-extrabold">{fmt(total)}</p>
        <p className="mt-2 text-xs text-neutral-500">{d.t("admin.media.bucketsNote")}</p>
      </CardBody></Card>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-brand-100 dark:border-white/10">
        <table className="w-full text-sm min-w-[640px]">
          <thead><tr className="bg-brand-50 dark:bg-white/5 text-start">
            <th className="p-3 text-start">{d.t("admin.media.file")}</th><th className="p-3 text-start">{d.t("admin.media.bucket")}</th>
            <th className="p-3 text-start">{d.t("admin.media.type")}</th><th className="p-3 text-start">{d.t("admin.media.size")}</th><th className="p-3 text-start">{d.t("admin.media.uploaded")}</th>
          </tr></thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.id} className="border-t border-brand-100 dark:border-white/10">
                <td className="p-3 font-medium truncate max-w-[240px]" dir="ltr">{a.file_name ?? a.path}</td>
                <td className="p-3"><code dir="ltr" className="text-xs">{a.bucket}</code></td>
                <td className="p-3 text-xs" dir="ltr">{a.mime_type ?? "—"}</td>
                <td className="p-3">{fmt(a.size_bytes)}</td>
                <td className="p-3 text-xs">{new Date(a.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {assets.length === 0 && <p className="p-6 text-center text-sm text-neutral-500">{d.t("admin.media.empty")}</p>}
      </div>
      <p className="mt-3 text-xs text-neutral-500">{d.t("admin.media.validNote")}</p>
    </div>
  );
}
