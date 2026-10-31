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
import { excerpt, timeAgo } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n/server";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDictionary();
  const item = await getContentBySlug(slug);
  if (!item || (item.type !== "article" && item.type !== "publication")) return { title: "Not found" };
  return { title: item.seo_title || item.title, description: item.seo_description || excerpt(item.description ?? item.articles?.excerpt, 160) };
}

/** Article reader + publication (risala) viewer. Sanitized HTML is rendered;
 *  admins must paste clean HTML from the rich-text editor (server-sanitized on save). */
export default async function RasailDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = await getDictionary();
  const item = await getContentBySlug(slug);
  if (!item || (item.type !== "article" && item.type !== "publication")) notFound();
  const related = await getRelated(item, 4);

  return (
    <div className="pt-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-neutral-500">
        <Link href="/" className="hover:text-brand-700">{d.t("detail.home")}</Link> /{" "}
        <Link href="/rasail" className="hover:text-brand-700">{d.t("nav.rasail")}</Link> /{" "}
        <span className="text-neutral-700 dark:text-neutral-300">{item.title}</span>
      </nav>

      <article className="mx-auto max-w-3xl">
        <div className="flex flex-wrap gap-2">
          {item.title.startsWith("[SAMPLE]") && <Badge tone="neutral">{d.t("common.sampleBadge")}</Badge>}
          {item.category && <Badge>{item.category.name}</Badge>}
          <Badge tone="neutral">{item.type === "article" ? d.t("detail.article.type") : `${d.t("detail.risala.type")}${item.publications?.issue_no ? ` #${item.publications.issue_no}` : ""}`}</Badge>
        </div>
        <h1 className="mt-2 text-3xl font-extrabold text-brand-950 dark:text-white">{item.title}</h1>
        <p className="mt-2 text-sm text-neutral-500">
          {timeAgo(item.published_at, d.lang)}
          {item.scholar && (
            <> · <Link href={`/scholars/${item.scholar.slug}`} className="font-semibold text-brand-700 hover:underline">{item.scholar.name}</Link></>
          )}
        </p>

        {item.type === "article" && item.articles?.body_html && (
          <div
            className="article-body mt-6 rounded-2xl border border-brand-100 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 sm:p-8"
            dangerouslySetInnerHTML={{ __html: item.articles.body_html }}
          />
        )}

        {item.type === "publication" && item.publications?.pdf_url && (
          <iframe
            src={item.publications.pdf_url}
            title={`${item.title} — PDF`}
            className="mt-6 h-[75vh] w-full rounded-2xl border border-brand-100 dark:border-white/10 bg-white"
          />
        )}

        {item.type === "publication" && !item.publications?.pdf_url && (
          <p className="mt-6 rounded-2xl border border-dashed p-6 text-sm text-neutral-500">
            {d.t("detail.risala.noFile")}
          </p>
        )}

        {item.description && item.type === "publication" && (
          <p className="mt-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-line">{item.description}</p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <FavoriteButton contentId={item.id} />
          <ShareButton title={item.title} />
          {item.type === "publication" && item.publications?.allow_download && item.publications.pdf_url && (
            <a href={item.publications.pdf_url} download className="inline-flex h-11 items-center gap-2 rounded-xl border border-brand-200 px-4 text-sm font-bold hover:bg-brand-50">
              ⬇ {d.t("common.download")}
            </a>
          )}
        </div>
        <div className="mt-4"><ReportButton contentId={item.id} /></div>
      </article>

      {related.length > 0 && (
        <Section title={d.t("detail.related.rasail")}>
          <ContentGrid items={related} />
        </Section>
      )}
    </div>
  );
}
