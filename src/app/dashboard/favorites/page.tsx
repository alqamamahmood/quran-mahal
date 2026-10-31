import { createClient, getUser, isSupabaseConfigured } from "@/lib/supabase/server";
import { ContentGrid } from "@/components/content/content-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { ContentItem } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "My Favorites", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const d = await getDictionary();
  const user = await getUser();
  let items: ContentItem[] = [];

  if (isSupabaseConfigured() && user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("favorites")
      .select("content_items(*, scholar:scholars(name, slug), category:categories(name, slug))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    items = (
      (data ?? []) as unknown as Array<{ content_items: ContentItem }>
    ).map((f) => f.content_items).filter(Boolean);
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{d.t("dash.fav.title")}</h1>
      <div className="mt-4">
        {items.length === 0 ? (
          <EmptyState icon="❤️" title={d.t("dash.fav.empty.title")} description={d.t("dash.fav.empty.desc")} />
        ) : (
          <ContentGrid items={items} className="lg:grid-cols-3" />
        )}
      </div>
    </div>
  );
}
