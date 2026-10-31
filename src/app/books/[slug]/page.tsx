import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContentBySlug, getRelated } from "@/lib/content";
import { ContentGrid } from "@/components/content/content-card";
import { FavoriteButton } from "@/components/content/favorite-button";
import { ShareButton } from "@/components/content/share-button";
import { ReportButton } from "@/components/content/report-button";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { excerpt } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n/server";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getContentBySlug(slug);
  if (!item || item.type !== "book") return { title: "Not found" };
  return { title: item.seo_title || item.title, description: item.seo_description || excerpt(item.description, 160) };
}

/** Online reader: PDF embed, EPUB/HTML note, download only when authorized. */
export default async function BookReaderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = await getDictionary();
  const item = await getContentBySlug(slug);
  if (!item || item.type !== "book" || !item.books) notFound();
  const related = await getRelated(item, 4);
  const book = item.books;

  return (
    <div className="pt-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-neutral-500">
        <Link href="/" className="hover:text-brand-700">{d.t("detail.home")}</Link> /{" "}
        <Link href="/books" className="hover:text-brand-700">{d.t("nav.books")}</Link> /{" "}
        <span className="text-neutral-700 dark:text-neutral-300">{item.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div>
          <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-brand-800 to-brand-950 grid place-items-center text-6xl shadow-card overflow-hidden">
            {book.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={book.cover_url} alt={`${item.title} cover`} className="h-full w-full object-cover" />
            ) : (
              <span aria-hidden>📖</span>
            )}
          </div>
          <dl className="mt-4 space-y-1.5 text-sm">
            {book.author && <div className="flex justify-between"><dt className="text-neutral-500">{d.t("detail.meta.author")}</dt><dd className="font-semibold">{book.author}</dd></div>}
            {book.pages && <div className="flex justify-between"><dt className="text-neutral-500">{d.t("detail.meta.pages")}</dt><dd className="font-semibold">{book.pages}</dd></div>}
            {book.publisher && <div className="flex justify-between"><dt className="text-neutral-500">{d.t("detail.meta.publisher")}</dt><dd className="font-semibold">{book.publisher}</dd></div>}
            {book.file_format && <div className="flex justify-between"><dt className="text-neutral-500">{d.t("detail.meta.format")}</dt><dd className="font-semibold uppercase">{book.file_format}</dd></div>}
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <FavoriteButton contentId={item.id} />
            <ShareButton title={item.title} />
          </div>
          {book.allow_download && book.file_url && (
            <a href={book.file_url} download className="mt-2 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-bold text-white hover:bg-brand-800">
              ⬇ {d.t("common.download")}
            </a>
          )}
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {item.title.startsWith("[SAMPLE]") && <Badge tone="neutral">{d.t("common.sampleBadge")}</Badge>}
            {item.category && <Badge>{item.category.name}</Badge>}
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-brand-950 dark:text-white">{item.title}</h1>
          {item.description && (
            <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-line">{item.description}</p>
          )}
          {book.license_note && (
            <p className="mt-3 rounded-xl bg-brand-50 dark:bg-brand-950/40 p-3 text-xs text-brand-900 dark:text-brand-200">
              {d.t("detail.license")} {book.license_note}
            </p>
          )}

          <h2 className="mt-6 mb-2 font-bold">{d.t("detail.readOnline")}</h2>
          {book.file_url && book.file_format === "pdf" ? (
            <iframe
              src={book.file_url}
              title={`${item.title} — PDF reader`}
              className="h-[70vh] w-full rounded-2xl border border-brand-100 dark:border-white/10 bg-white"
            />
          ) : book.file_url ? (
            <p className="rounded-2xl border border-dashed p-6 text-sm text-neutral-500">
              {d.t("detail.book.epubNote")}
            </p>
          ) : (
            <p className="rounded-2xl border border-dashed p-6 text-sm text-neutral-500">
              {d.t("detail.book.noFile")}
            </p>
          )}

          <div className="mt-4"><ReportButton contentId={item.id} /></div>
        </div>
      </div>

      {related.length > 0 && (
        <Section title={d.t("detail.related.book")}>
          <ContentGrid items={related} />
        </Section>
      )}
    </div>
  );
}
