import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { upsertCategory, deleteCategory } from "../actions";
import type { Category } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Categories", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; edit?: string }>;
}) {
  const { error, edit } = await searchParams;
  const d = await getDictionary();
  let categories: Category[] = [];
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      categories = (data ?? []) as Category[];
    } catch { /* empty */ }
  }
  const editing = edit ? categories.find((c) => c.id === edit) : undefined;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{d.t("admin.cat.title")}</h1>
      {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <Card className="mt-4"><CardBody>
        <h2 className="font-bold mb-3">{editing ? d.t("admin.cat.edit") : d.t("admin.cat.new")}</h2>
        <form action={upsertCategory} className="grid sm:grid-cols-2 gap-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <Input name="name" label={`${d.t("admin.cat.name")} *`} required defaultValue={editing?.name ?? ""} />
          <Input name="name_ur" label={d.t("admin.cat.nameUr")} defaultValue={editing?.name_ur ?? ""} />
          <Input name="slug" label={d.t("admin.cat.slug")} dir="ltr" defaultValue={editing?.slug ?? ""} />
          <Input name="sort_order" label={d.t("admin.cat.sortOrder")} type="number" defaultValue={editing?.sort_order ?? 0} dir="ltr" />
          <div className="sm:col-span-2">
            <Input name="description" label={d.t("admin.cat.description")} defaultValue={editing?.description ?? ""} />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="is_active" defaultChecked={editing?.is_active ?? true} className="h-4 w-4" /> {d.t("admin.cat.active")}
          </label>
          <div className="sm:col-span-2"><Button type="submit">{editing ? d.t("common.update") : d.t("common.create")}</Button></div>
        </form>
      </CardBody></Card>

      <div className="mt-5 space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-3 rounded-2xl border border-brand-100 dark:border-white/10 bg-white dark:bg-neutral-900 p-3">
            <div>
              <p className="font-bold text-sm">{c.name} <span className="font-normal text-neutral-500">{c.name_ur}</span></p>
              <p className="text-xs text-neutral-500" dir="ltr">/{c.slug} · order {c.sort_order}</p>
            </div>
            <div className="flex items-center gap-2">
              {!c.is_active && <Badge tone="neutral">{d.t("admin.cat.hidden")}</Badge>}
              <a href={`/admin/categories?edit=${c.id}`} className="rounded-lg border px-3 py-1.5 text-xs font-bold">{d.t("common.edit")}</a>
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={c.id} />
                <button className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600">{d.t("common.delete")}</button>
              </form>
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="text-sm text-neutral-500">{d.t("admin.dash.empty")}</p>}
      </div>
    </div>
  );
}
