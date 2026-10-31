import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ContentTable, NewContentButton } from "@/components/admin/content-table";
import { getDictionary } from "@/lib/i18n/server";
import type { ContentItem, ContentType } from "@/lib/types";

export const dynamic = "force-dynamic";

const TITLE_KEYS: Record<string, string> = {
  all: "admin.content.title",
  video: "admin.content.videos",
  audio: "admin.content.audio",
  book: "admin.content.books",
  publication: "admin.content.rasail",
  article: "admin.content.rasail",
};

export async function AdminContentList({
  type,
  searchParams,
}: {
  type?: ContentType;
  searchParams?: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = (await searchParams) ?? {};
  const d = await getDictionary();
  let items: ContentItem[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("content_items")
        .select("*, scholar:scholars(name, slug), category:categories(name, slug)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (type) query = query.eq("type", type);
      if (status) query = query.eq("status", status);
      if (q) query = query.ilike("title", `%${q}%`);
      const { data } = await query;
      items = (data ?? []) as ContentItem[];
    } catch { /* empty */ }
  }

  const title = d.t(TITLE_KEYS[type ?? "all"]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{title}</h1>
        <NewContentButton type={type} />
      </div>

      <form method="get" className="mt-4 flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder={d.t("admin.list.searchPh")}
          className="h-10 rounded-xl border border-brand-200 dark:border-white/15 bg-white dark:bg-neutral-900 px-3 text-sm"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-10 rounded-xl border border-brand-200 dark:border-white/15 bg-white dark:bg-neutral-900 px-3 text-sm"
        >
          <option value="">{d.t("admin.list.statusAll")}</option>
          <option value="draft">{d.t("admin.list.draft")}</option>
          <option value="published">{d.t("admin.list.published")}</option>
          <option value="archived">{d.t("admin.list.archived")}</option>
        </select>
        <button type="submit" className="h-10 rounded-xl bg-brand-700 px-4 text-sm font-bold text-white">{d.t("common.filter")}</button>
        {(status || q) && (
          <Link href="." className="h-10 inline-flex items-center rounded-xl border px-4 text-sm font-bold">{d.t("common.clear")}</Link>
        )}
      </form>

      <div className="mt-4">
        <ContentTable items={items} />
      </div>
    </div>
  );
}
