import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContentBySlug, getRecent } from "@/lib/content";
import { PlayAudioButton } from "@/components/media/play-audio-button";
import { FavoriteButton } from "@/components/content/favorite-button";
import { ShareButton } from "@/components/content/share-button";
import { ReportButton } from "@/components/content/report-button";
import { Badge } from "@/components/ui/badge";
import { excerpt, formatDuration } from "@/lib/utils";
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
  if (!item || item.type !== "audio") return { title: "Not found" };
  return { title: item.seo_title || item.title, description: item.seo_description || excerpt(item.description, 160) };
}

export default async function AudioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = await getDictionary();
  const item = await getContentBySlug(slug);
  if (!item || item.type !== "audio" || !item.audio_tracks) notFound();
  const more = await getRecent("audio", 10);
  const queue = more.filter((m) => m.audio_tracks?.audio_url);

  return (
    <div className="pt-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-neutral-500">
        <Link href="/" className="hover:text-brand-700">{d.t("detail.home")}</Link> /{" "}
        <Link href="/audio" className="hover:text-brand-700">{d.t("nav.audio")}</Link> /{" "}
        <span className="text-neutral-700 dark:text-neutral-300">{item.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-3xl bg-gradient-to-br from-brand-800 to-brand-950 aspect-square grid place-items-center text-7xl shadow-card overflow-hidden">
          {item.audio_tracks.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.audio_tracks.cover_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden>🎧</span>
          )}
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            {item.title.startsWith("[SAMPLE]") && <Badge tone="neutral">{d.t("common.sampleBadge")}</Badge>}
            {item.category && <Badge>{item.category.name}</Badge>}
            {item.audio_tracks.duration_seconds && (
              <Badge tone="neutral">{formatDuration(item.audio_tracks.duration_seconds)}</Badge>
            )}
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-brand-950 dark:text-white">{item.title}</h1>
          {item.scholar && (
            <p className="mt-1">
              <Link href={`/scholars/${item.scholar.slug}`} className="font-semibold text-brand-700 hover:underline">
                {item.scholar.name}
              </Link>
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <PlayAudioButton item={item} queue={queue} />
            <FavoriteButton contentId={item.id} />
            <ShareButton title={item.title} />
          </div>
          {item.description && (
            <p className="mt-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
              {item.description}
            </p>
          )}
          {item.audio_tracks.allow_download && item.audio_tracks.audio_url && (
            <a
              href={item.audio_tracks.audio_url}
              download
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl border border-brand-200 px-4 text-sm font-bold hover:bg-brand-50"
            >
              ⬇ {d.t("detail.downloadOffline")}
            </a>
          )}
          <div className="mt-4"><ReportButton contentId={item.id} /></div>
        </div>
      </div>

      {queue.length > 1 && (
        <section className="mt-10" aria-label="More audio">
          <h2 className="text-xl font-extrabold text-brand-950 dark:text-white mb-3">{d.t("detail.moreAudio")}</h2>
          <div className="space-y-2">
            {queue.filter((q) => q.id !== item.id).slice(0, 8).map((q) => (
              <Link key={q.id} href={`/audio/${q.slug}`} className="flex items-center gap-3 rounded-2xl border border-brand-100 dark:border-white/10 bg-white dark:bg-neutral-900 p-3 hover:shadow-card">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 dark:bg-brand-950">🎧</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{q.title}</p>
                  <p className="text-xs text-neutral-500">{q.scholar?.name} · {formatDuration(q.audio_tracks?.duration_seconds)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
