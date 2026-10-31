import { createClient, getUser, isSupabaseConfigured } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardBody } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Reading Progress", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ReadingProgressPage() {
  const d = await getDictionary();
  const user = await getUser();
  let rows: Array<{ percent: number; current_page: number; content_items: { title: string; slug: string } | null }> = [];

  if (isSupabaseConfigured() && user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("reading_progress")
      .select("percent, current_page, content_items(title, slug)")
      .eq("user_id", user.id)
      .order("last_read_at", { ascending: false });
    rows = (data ?? []) as unknown as typeof rows;
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{d.t("dash.reading.title")}</h1>
      <div className="mt-4 space-y-3">
        {rows.length === 0 && <EmptyState icon="📖" title={d.t("dash.reading.empty.title")} description={d.t("dash.reading.empty.desc")} />}
        {rows.map((r, i) => (
          <Card key={i}>
            <CardBody>
              <p className="font-bold text-sm">{r.content_items?.title ?? "—"}</p>
              <div className="mt-2 h-2 rounded-full bg-brand-100 dark:bg-white/10">
                <div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.round(Number(r.percent))}%` }} />
              </div>
              <p className="mt-1 text-xs text-neutral-500">{d.t("dash.reading.page")} {r.current_page} · {Math.round(Number(r.percent))}%</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
