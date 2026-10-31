import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContentBySlug, getRelated, recordView } from "@/lib/content";
import { VideoPlayerWithTracking } from "@/components/media/video-player-client";
import { WatchTracker } from "@/components/media/watch-tracker";
import { ContentGrid } from "@/components/content/content-card";
import { FavoriteButton } from "@/components/content/favorite-button";
import { ReportButton } from "@/components/content/report-button";
import { ShareButton } from "@/components/content/share-button";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { excerpt, formatViews, timeAgo } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n/server";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getContentBySlug(slug);
  if (!item || item.type !== "video") return { title: "Not found" };
  const title = item.seo_title || item.title;
  const description = item.seo_description || excerpt(item.description, 160);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "video.other",
      images: item.videos?.thumbnail_url ? [item.videos.thumbnail_url] : [],
    },
  };
}

export default async function BayanDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = await getDictionary();
  const item = await getContentBySlug(slug);
  if (!item || item.type !== "video" || !item.videos) notFound();
  const related = await getRelated(item, 8);
  recordView(item.id);

  return (
    <div className="pt-6">
      <WatchTracker contentId={item.id} slug={item.slug} />
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-neutral-500">
        <Link href="/" className="hover:text-brand-700">{d.t("detail.home")}</Link> /{" "}
        <Link href="/bayanaat" className="hover:text-brand-700">{d.t("nav.bayanaat")}</Link> /{" "}
        <span className="text-neutral-700 dark:text-neutral-300">{item.title}</span>
      </nav>

      <VideoPlayerWithTracking video={item.videos} title={item.title} slug={item.slug} />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {item.visibility === "premium" && <Badge tone="gold">{d.t("common.premium")}</Badge>}
        {item.title.startsWith("[SAMPLE]") && <Badge tone="neutral">{d.t("common.sampleBadge")}</Badge>}
        {item.category && <Badge>{item.category.name}</Badge>}
      </div>

      <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-brand-950 dark:text-white">
        {item.title}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        {formatViews(item.view_count)} {d.t("common.views")} · {timeAgo(item.published_at, d.lang)}
        {item.scholar && (
          <> · <Link href={`/scholars/${item.scholar.slug}`} className="font-semibold text-brand-700 hover:underline">{item.scholar.name}</Link></>
        )}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <FavoriteButton contentId={item.id} />
        <ShareButton title={item.title} />
      </div>

      {item.description && (
        <div className="mt-6 rounded-2xl bg-white dark:bg-neutral-900 border border-brand-100 dark:border-white/10 p-5">
          <h2 className="font-bold mb-2">{d.t("detail.description")}</h2>
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
            {item.description}
          </p>
          {item.copyright_note && (
            <p className="mt-3 text-xs text-neutral-500">© {item.copyright_note}</p>
          )}
        </div>
      )}

      <div className="mt-4">
        <ReportButton contentId={item.id} />
      </div>

      {related.length > 0 && (
        <Section title={d.t("detail.related.video")}>
          <ContentGrid items={related} />
        </Section>
      )}
    </div>
  );
}
