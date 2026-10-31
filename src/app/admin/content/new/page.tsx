import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ContentForm } from "@/components/admin/content-form";
import type { ContentType } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "New Content", robots: { index: false } };
export const dynamic = "force-dynamic";

const VALID: ContentType[] = ["video", "audio", "book", "publication", "article"];

export default async function NewContentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; error?: string }>;
}) {
  const { type, error } = await searchParams;
  const d = await getDictionary();
  const defaultType: ContentType = VALID.includes(type as ContentType) ? (type as ContentType) : "video";

  let scholars: Array<{ id: string; name: string }> = [];
  let categories: Array<{ id: string; name: string }> = [];
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const [s, c] = await Promise.all([
        supabase.from("scholars").select("id, name").eq("status", "active").order("name"),
        supabase.from("categories").select("id, name").eq("is_active", true).order("sort_order"),
      ]);
      scholars = (s.data ?? []) as typeof scholars;
      categories = (c.data ?? []) as typeof categories;
    } catch { /* empty */ }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white mb-5">{d.t("admin.dash.newContent")}</h1>
      <ContentForm scholars={scholars} categories={categories} defaultType={defaultType} error={error} />
    </div>
  );
}
