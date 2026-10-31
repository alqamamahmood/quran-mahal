"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/provider";

export function FavoriteButton({ contentId }: { contentId: string }) {
  const [fav, setFav] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        const { data } = await supabase
          .from("favorites")
          .select("content_item_id")
          .eq("user_id", user.id)
          .eq("content_item_id", contentId)
          .maybeSingle();
        setFav(Boolean(data));
      } catch { /* sample mode */ }
    })();
  }, [contentId]);

  const toggle = async () => {
    if (!userId || busy) return;
    setBusy(true);
    try {
      const supabase = createClient();
      if (fav) {
        await supabase.from("favorites").delete().eq("user_id", userId).eq("content_item_id", contentId);
        setFav(false);
      } else {
        await supabase.from("favorites").insert({ user_id: userId, content_item_id: contentId });
        setFav(true);
      }
    } finally {
      setBusy(false);
    }
  };

  if (!userId) return null;

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-pressed={fav}
      aria-label={fav ? t("fav.removeLabel") : t("fav.saveLabel")}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition-colors",
        fav
          ? "border-red-200 bg-red-50 text-red-700 dark:bg-red-950/40"
          : "border-brand-200 dark:border-white/15 hover:bg-brand-50 dark:hover:bg-white/5"
      )}
    >
      <span aria-hidden>{fav ? "❤️" : "🤍"}</span>
      {fav ? t("fav.saved") : t("fav.save")}
    </button>
  );
}
