"use client";

import { useAudioPlayer, type QueueTrack } from "@/lib/audio/player-context";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/provider";
import type { ContentItem } from "@/lib/types";

export function PlayAudioButton({ item, queue }: { item: ContentItem; queue: ContentItem[] }) {
  const { play, track, isPlaying, toggle } = useAudioPlayer();
  const { t } = useLanguage();
  const audio = item.audio_tracks;
  if (!audio?.audio_url) return null;

  const toTrack = (c: ContentItem): QueueTrack => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    scholarName: c.scholar?.name,
    audioUrl: c.audio_tracks!.audio_url,
    coverUrl: c.audio_tracks!.cover_url,
    durationSeconds: c.audio_tracks!.duration_seconds,
  });

  const isCurrent = track?.id === item.id;

  const handle = () => {
    if (isCurrent) toggle();
    else play(toTrack(item), queue.filter((q) => q.audio_tracks?.audio_url).map(toTrack));
  };

  return (
    <Button onClick={handle} size="lg" className="gap-2">
      <span aria-hidden>{isCurrent && isPlaying ? "⏸" : "▶"}</span>
      {isCurrent && isPlaying ? t("player.pause") : t("player.listen")}
    </Button>
  );
}
