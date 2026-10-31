import { getLibrary } from "@/lib/content";
import { ContentGrid } from "@/components/content/content-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Rasail — Islamic Publications & Articles" };
export const revalidate = 300;

export default async function RasailPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const d = await getDictionary();
  const { q, page } = await searchParams;
  const [pubs, articles] = await Promise.all([
    getLibrary("publication", { q, page: Number(page ?? 1), perPage: 8 }),
    getLibrary("article", { q, page: 1, perPage: 8 }),
  ]);

  return (
    <div className="pt-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 dark:text-white">{d.t("lib.rasail.title")}</h1>
      <p className="mt-1 text-sm text-neutral-500">{d.t("lib.rasail.subtitle")}</p>

      <h2 className="mt-8 mb-3 text-xl font-extrabold">{d.t("lib.pubs")} ({pubs.total})</h2>
      {pubs.items.length === 0 ? (
        <EmptyState icon="📰" title={d.t("lib.empty.risala.title")} description={d.t("lib.empty.risala.desc")} />
      ) : (
        <ContentGrid items={pubs.items} />
      )}

      <h2 className="mt-10 mb-3 text-xl font-extrabold">{d.t("lib.articles")} ({articles.total})</h2>
      {articles.items.length === 0 ? (
        <EmptyState icon="📝" title={d.t("lib.empty.article.title")} description={d.t("lib.empty.article.desc")} />
      ) : (
        <ContentGrid items={articles.items} />
      )}
    </div>
  );
}
