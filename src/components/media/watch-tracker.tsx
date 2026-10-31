"use client";

import { useEffect, useRef } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const KEY = "qm-watch-progress";

/** Saves watch progress locally + to Supabase watch_history (best-effort). */
export function WatchTracker({
  contentId,
  slug,
}: {
  contentId: string;
  slug: string;
}) {
  const saved = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured() || saved.current) return;
    saved.current = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const local = JSON.parse(localStorage.getItem(KEY) ?? "{}");
        const p = local[slug];
        if (p) {
          await supabase.from("watch_history").upsert({
            user_id: user.id,
            content_item_id: contentId,
            progress_seconds: Math.floor(p.t ?? 0),
            duration_seconds: Math.floor(p.d ?? 0),
            last_watched_at: new Date().toISOString(),
          });
        }
      } catch { /* best-effort */ }
    })();
  }, [contentId, slug]);

  return null;
}

export function saveWatchProgress(slug: string, t: number, d: number) {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    all[slug] = { t: Math.floor(t), d: Math.floor(d), at: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}
