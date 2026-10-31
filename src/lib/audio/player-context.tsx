"use client";

import { useLanguage } from "@/lib/i18n/provider";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface QueueTrack {
  id: string;
  slug: string;
  title: string;
  scholarName?: string | null;
  audioUrl: string;
  coverUrl?: string | null;
  durationSeconds?: number | null;
}

interface PlayerState {
  track: QueueTrack | null;
  queue: QueueTrack[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  rate: number;
  error: string | null;
  play: (track: QueueTrack, queue?: QueueTrack[]) => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  skip: (seconds: number) => void;
  next: () => void;
  prev: () => void;
  setRate: (r: number) => void;
  close: () => void;
}

const AudioPlayerContext = createContext<PlayerState | null>(null);

const STORAGE_KEY = "qm-audio-progress";

function loadProgress(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState<QueueTrack | null>(null);
  const [queue, setQueue] = useState<QueueTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRateState] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  // Single persistent <audio> element for the whole app session.
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onErr = () =>
      setError(t("player.error"));

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onErr);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onErr);
      audio.pause();
    };
  }, []);

  // Persist progress every 10s so "Continue Listening" works.
  useEffect(() => {
    if (!track || currentTime < 1) return;
    const id = setInterval(() => {
      try {
        const all = loadProgress();
        all[track.id] = Math.floor(audioRef.current?.currentTime ?? currentTime);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      } catch {
        /* storage unavailable */
      }
    }, 10000);
    return () => clearInterval(id);
  }, [track, currentTime]);

  // Media Session API — lock-screen / background controls where supported.
  useEffect(() => {
    if (!("mediaSession" in navigator) || !track) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.scholarName ?? "Quran Mahal",
        album: "Quran Mahal Audio",
        artwork: track.coverUrl
          ? [{ src: track.coverUrl, sizes: "512x512", type: "image/jpeg" }]
          : [],
      });
      navigator.mediaSession.setActionHandler("play", () => audioRef.current?.play());
      navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause());
      navigator.mediaSession.setActionHandler("previoustrack", () => prevRef.current());
      navigator.mediaSession.setActionHandler("nexttrack", () => nextRef.current());
    } catch {
      /* not supported */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  const play = useCallback((nextTrack: QueueTrack, nextQueue: QueueTrack[] = []) => {
    const audio = audioRef.current;
    if (!audio) return;
    setError(null);
    setQueue(nextQueue);
    setTrack(nextTrack);
    // Resume from saved position when available.
    const saved = loadProgress()[nextTrack.id] ?? 0;
    audio.src = nextTrack.audioUrl;
    audio.playbackRate = rateRef.current;
    const startAt = saved > 10 ? saved : 0;
    audio
      .play()
      .then(() => {
        if (startAt > 0) audio.currentTime = startAt;
      })
      .catch(() => setError(t("player.startError")));
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (audio.paused) audio.play().catch(() => setError(t("player.startError")));
    else audio.pause();
  }, [track]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(seconds, audio.duration || seconds));
    setCurrentTime(audio.currentTime);
  }, []);

  const skip = useCallback(
    (seconds: number) => seek(currentTime + seconds),
    [currentTime, seek]
  );

  const stepQueue = useCallback(
    (dir: 1 | -1) => {
      if (!track || queue.length === 0) return;
      const idx = queue.findIndex((q) => q.id === track.id);
      const nextIdx = idx === -1 ? 0 : (idx + dir + queue.length) % queue.length;
      play(queue[nextIdx], queue);
    },
    [track, queue, play]
  );

  const next = useCallback(() => stepQueue(1), [stepQueue]);
  const prev = useCallback(() => stepQueue(-1), [stepQueue]);
  const nextRef = useRef(next);
  const prevRef = useRef(prev);
  const rateRef = useRef(rate);
  nextRef.current = next;
  prevRef.current = prev;
  rateRef.current = rate;

  const setRate = useCallback((r: number) => {
    setRateState(r);
    if (audioRef.current) audioRef.current.playbackRate = r;
  }, []);

  const close = useCallback(() => {
    audioRef.current?.pause();
    setTrack(null);
    setIsPlaying(false);
  }, []);

  const value = useMemo<PlayerState>(
    () => ({
      track,
      queue,
      isPlaying,
      currentTime,
      duration,
      rate,
      error,
      play,
      toggle,
      seek,
      skip,
      next,
      prev,
      setRate,
      close,
    }),
    [track, queue, isPlaying, currentTime, duration, rate, error, play, toggle, seek, skip, next, prev, setRate, close]
  );

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}

export function useAudioPlayer(): PlayerState {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudioPlayer must be used inside AudioPlayerProvider");
  return ctx;
}

/** Saved per-track progress (seconds) for "Continue Listening". */
export function getSavedProgress(trackId: string): number {
  if (typeof window === "undefined") return 0;
  return loadProgress()[trackId] ?? 0;
}
