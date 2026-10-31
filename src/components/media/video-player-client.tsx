"use client";

import { VideoPlayer } from "./video-player";
import { saveWatchProgress } from "./watch-tracker";
import type { VideoDetail } from "@/lib/types";

/** Client wrapper: video player + resume-progress tracking. */
export function VideoPlayerWithTracking({
  video,
  title,
  slug,
}: {
  video: VideoDetail;
  title: string;
  slug: string;
}) {
  return (
    <VideoPlayer
      video={video}
      title={title}
      onProgress={(t, d) => saveWatchProgress(slug, t, d)}
    />
  );
}
