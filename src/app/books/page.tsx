import { getLibrary } from "@/lib/content";
import { ContentGrid } from "@/components/content/content-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Books — Islamic Library" };
export const revalidate = 300;

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const d = await getDictionary();
  const { q, page } = await searchParams;
  const { items, total } = await getLibrary("book", { q, page: Number(page ?? 1) });

  return (
    <div className="pt-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 dark:text-white">{d.t("lib.books.title")}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {total} {d.t("lib.books.subtitle")}
      </p>
      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState icon="📚" title={d.t("lib.empty.book.title")} description={d.t("lib.empty.book.desc")} />
        ) : (
          <ContentGrid items={items} />
        )}
      </div>
    </div>
  );
}
