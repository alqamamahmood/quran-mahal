"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { excerpt, formatDuration, formatViews, timeAgo } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/provider";
import type { ContentItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_HREF: Record<ContentItem["type"], string> = {
  video: "/bayanaat",
  audio: "/audio",
  book: "/books",
  publication: "/rasail",
  article: "/rasail",
};

const TYPE_ICON: Record<ContentItem["type"], string> = {
  video: "▶",
  audio: "🎧",
  book: "📖",
  publication: "📰",
  article: "📝",
};

export function ContentCard({ item }: { item: ContentItem }) {
  const { t, lang } = useLanguage();
  const href = `${TYPE_HREF[item.type]}/${item.slug}`;
  const isSample = item.title.startsWith("[SAMPLE]");

  const thumb =
    item.videos?.thumbnail_url ??
    item.audio_tracks?.cover_url ??
    item.books?.cover_url ??
    item.publications?.cover_url ??
    null;
  const dur =
    item.videos?.duration_seconds ?? item.audio_tracks?.duration_seconds ?? null;

  return (
    <Link
      href={href}
      className="group rounded-2xl border border-brand-100 dark:border-white/10 bg-white dark:bg-neutral-900 overflow-hidden shadow-card hover:shadow-lift hover:-translate-y-0.5 transition-all"
    >
      <div className="relative aspect-video bg-gradient-to-br from-brand-800 to-brand-950 grid place-items-center overflow-hidden">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <span className="text-5xl opacity-80" aria-hidden>
            {TYPE_ICON[item.type]}
          </span>
        )}
        {dur ? (
          <span className="absolute bottom-2 end-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            {formatDuration(dur)}
          </span>
        ) : null}
        {item.visibility === "premium" && (
          <Badge tone="gold" className="absolute top-2 start-2">Premium</Badge>
        )}
        {isSample && (
          <Badge tone="neutral" className="absolute top-2 end-2">{t("common.sampleBadge")}</Badge>
        )}
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-[15px] leading-snug line-clamp-2 text-neutral-900 dark:text-white group-hover:text-brand-800 dark:group-hover:text-brand-200">
          {item.title}
        </h3>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
          {[item.scholar?.name, item.category?.name].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
          {excerpt(item.description, 90)}
        </p>
        <p className="mt-2 text-[11px] font-medium text-neutral-400">
          {formatViews(item.view_count)} views · {timeAgo(item.published_at, lang)}
        </p>
      </div>
    </Link>
  );
}

export function ContentGrid({
  items,
  className,
}: {
  items: ContentItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
        className
      )}
    >
      {items.map((i) => (
        <ContentCard key={i.id} item={i} />
      ))}
    </div>
  );
}
