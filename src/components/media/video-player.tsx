"use client";

import { useState } from "react";
import { youtubeId } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/provider";
import type { VideoDetail } from "@/lib/types";

/**
 * Provider-aware video player.
 * - youtube: official iframe embed (never treated as a downloadable file).
 * - upload/external: native <video> with the authorized direct URL.
 */
export function VideoPlayer({
  video,
  title,
  onProgress,
}: {
  video: VideoDetail;
  title: string;
  onProgress?: (seconds: number, duration: number) => void;
}) {
  const [error, setError] = useState(false);
  const { t } = useLanguage();
  const ytId = youtubeId(video.video_url);

  if (video.provider === "youtube" && ytId) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-card">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full"
          loading="lazy"
        />
      </div>
    );
  }

  if (!video.video_url || error) {
    return (
      <div className="aspect-video w-full rounded-2xl bg-neutral-900 text-white grid place-items-center p-6 text-center">
        <div>
          <p className="text-4xl mb-2">⚠️</p>
          <p className="font-semibold">{t("video.unavailable.title")}</p>
          <p className="text-sm text-neutral-400 mt-1">
            {t("video.unavailable.desc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-card">
      <video
        key={video.video_url}
        src={video.video_url}
        controls
        playsInline
        preload="metadata"
        poster={video.thumbnail_url ?? undefined}
        onError={() => setError(true)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          onProgress?.(v.currentTime, v.duration || 0);
        }}
        className="h-full w-full"
      >
        {video.captions_url && (
          <track kind="captions" src={video.captions_url} label="Captions" />
        )}
      </video>
    </div>
  );
}
