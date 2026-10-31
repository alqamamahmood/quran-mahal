export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatDuration(totalSeconds: number | null | undefined): string {
  if (!totalSeconds || totalSeconds <= 0) return "—";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function timeAgo(iso: string | null | undefined, lang: string = "en"): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return lang === "ur" ? "ابھی" : "just now";
  if (mins < 60) return lang === "ur" ? `${mins} منٹ پہلے` : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return lang === "ur" ? `${hours} گھنٹے پہلے` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return lang === "ur" ? `${days} دن پہلے` : `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return lang === "ur" ? `${months} ماہ پہلے` : `${months}mo ago`;
  return lang === "ur"
    ? `${Math.floor(months / 12)} سال پہلے`
    : `${Math.floor(months / 12)}y ago`;
}

export function formatViews(n: number | null | undefined): string {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/** Extract a YouTube video ID from common URL shapes. Returns null if not a YouTube URL. */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  return m ? m[1] : null;
}

/** Truncate text without cutting words. */
export function excerpt(text: string | null | undefined, len = 160): string {
  if (!text) return "";
  const plain = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length <= len) return plain;
  return plain.slice(0, plain.lastIndexOf(" ", len)) + "…";
}
