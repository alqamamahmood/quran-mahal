import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { upsertScholar, deleteScholar } from "../actions";
import type { Scholar } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Scholars", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ScholarsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; edit?: string }>;
}) {
  const { error, edit } = await searchParams;
  const d = await getDictionary();
  let scholars: Scholar[] = [];
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.from("scholars").select("*").order("name");
      scholars = (data ?? []) as Scholar[];
    } catch { /* empty */ }
  }
  const editing = edit ? scholars.find((s) => s.id === edit) : undefined;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{d.t("admin.sch.title")}</h1>
      {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <Card className="mt-4"><CardBody>
        <h2 className="font-bold mb-3">{editing ? d.t("admin.sch.edit") : d.t("admin.sch.new")}</h2>
        <form action={upsertScholar} className="grid sm:grid-cols-2 gap-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <Input name="name" label={`${d.t("admin.sch.name")} *`} required defaultValue={editing?.name ?? ""} />
          <Input name="name_ur" label={d.t("admin.sch.nameUr")} defaultValue={editing?.name_ur ?? ""} />
          <Input name="photo_url" label={d.t("admin.sch.photo")} dir="ltr" defaultValue={editing?.photo_url ?? ""} />
          <Input name="photo_permission_note" label="Photo permission note" defaultValue={editing?.photo_permission_note ?? ""} />
          <Input name="languages" label={d.t("admin.sch.languages")} defaultValue={editing?.languages.join(", ") ?? ""} />
          <Input name="subjects" label={d.t("admin.sch.subjects")} defaultValue={editing?.subjects.join(", ") ?? ""} />
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold mb-1.5">{d.t("admin.sch.bio")}
              <textarea name="bio" rows={4} defaultValue={editing?.bio ?? ""} className="mt-1 w-full rounded-xl border border-neutral-300 dark:border-white/15 bg-white dark:bg-neutral-900 px-3 py-2 text-sm" />
            </label>
          </div>
          <label className="block text-sm font-semibold">{d.t("admin.sch.status")}
            <select name="status" defaultValue={editing?.status ?? "active"} className="mt-1 h-11 w-full rounded-xl border border-neutral-300 dark:border-white/15 bg-white dark:bg-neutral-900 px-3 text-sm">
              <option value="active">{d.t("admin.sch.active")}</option>
              <option value="hidden">{d.t("admin.sch.hidden")}</option>
            </select>
          </label>
          <div className="sm:col-span-2"><Button type="submit">{editing ? d.t("common.update") : d.t("common.create")}</Button></div>
        </form>
      </CardBody></Card>

      <div className="mt-5 grid sm:grid-cols-2 gap-3">
        {scholars.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3 rounded-2xl border border-brand-100 dark:border-white/10 bg-white dark:bg-neutral-900 p-3">
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{s.name}</p>
              <p className="text-xs text-neutral-500 truncate">{s.subjects.join(" · ")}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {s.status === "hidden" && <Badge tone="neutral">{d.t("admin.sch.hidden")}</Badge>}
              <a href={`/admin/scholars?edit=${s.id}`} className="rounded-lg border px-3 py-1.5 text-xs font-bold">{d.t("common.edit")}</a>
              <form action={deleteScholar}>
                <input type="hidden" name="id" value={s.id} />
                <button className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600">{d.t("common.delete")}</button>
              </form>
            </div>
          </div>
        ))}
        {scholars.length === 0 && <p className="text-sm text-neutral-500">{d.t("admin.dash.empty")}</p>}
      </div>
    </div>
  );
}
