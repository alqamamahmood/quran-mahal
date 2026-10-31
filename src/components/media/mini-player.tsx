"use client";

import { useAudioPlayer } from "@/lib/audio/player-context";
import { useLanguage } from "@/lib/i18n/provider";
import { formatDuration } from "@/lib/utils";
import Link from "next/link";

/** Persistent mini-player rendered once in the root layout. */
export function MiniPlayer() {
  const { t } = useLanguage();
  const {
    track,
    isPlaying,
    currentTime,
    duration,
    error,
    toggle,
    seek,
    skip,
    next,
    prev,
    close,
  } = useAudioPlayer();

  if (!track) return null;

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      role="region"
      aria-label={t("player.region")}
      className="fixed bottom-[68px] lg:bottom-4 inset-x-3 sm:inset-x-4 z-40 mx-auto max-w-3xl rounded-2xl border border-brand-200 dark:border-white/15 bg-white/95 dark:bg-neutral-900/95 backdrop-blur shadow-lift"
    >
      {error && (
        <p className="px-4 pt-2 text-xs font-semibold text-red-600" role="alert">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3 p-3">
        <Link
          href={`/audio/${track.slug}`}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-100 dark:bg-brand-950 text-2xl"
          aria-label={track.title}
        >
          {track.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={track.coverUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
          ) : (
            "🎧"
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/audio/${track.slug}`} className="block truncate text-sm font-bold">
            {track.title}
          </Link>
          <p className="truncate text-xs text-neutral-500">
            {track.scholarName ?? ""} · {formatDuration(currentTime)} / {formatDuration(duration)}
          </p>
          <div
            className="mt-1 h-1.5 rounded-full bg-brand-100 dark:bg-white/10 cursor-pointer"
            role="slider"
            aria-label={t("player.seek")}
            aria-valuenow={Math.round(currentTime)}
            aria-valuemax={Math.round(duration)}
            tabIndex={0}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - r.left) / r.width;
              seek(ratio * duration);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") skip(10);
              if (e.key === "ArrowLeft") skip(-10);
            }}
          >
            <div className="h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prev} aria-label={t("player.prev")} className="p-2 text-lg min-w-[44px]">⏮</button>
          <button onClick={() => skip(-10)} aria-label={t("player.back10")} className="p-2 text-lg min-w-[44px]">↺</button>
          <button
            onClick={toggle}
            aria-label={isPlaying ? t("player.pause") : t("player.play")}
            className="grid h-12 w-12 place-items-center rounded-full bg-brand-700 text-white text-xl hover:bg-brand-800"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button onClick={() => skip(10)} aria-label={t("player.fwd10")} className="p-2 text-lg min-w-[44px]">↻</button>
          <button onClick={next} aria-label={t("player.next")} className="p-2 text-lg min-w-[44px]">⏭</button>
          <button onClick={close} aria-label={t("player.close")} className="p-2 text-lg min-w-[44px] text-neutral-400">✕</button>
        </div>
      </div>
    </div>
  );
}
