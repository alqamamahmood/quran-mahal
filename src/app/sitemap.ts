import type { MetadataRoute } from "next";
import { getRecent } from "@/lib/content";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quran-mahal.example";

/** Public sitemap — published public content only. Private media URLs are never included. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/bayanaat`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/audio`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/books`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/rasail`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/quran`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/duas`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/scholars`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE}/pricing`, changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const [videos, audios, books, pubs] = await Promise.all([
      getRecent("video", 100),
      getRecent("audio", 100),
      getRecent("book", 100),
      getRecent("publication", 100),
    ]);
    const pathFor = (t: string) =>
      t === "video" ? "bayanaat" : t === "audio" ? "audio" : t === "book" ? "books" : "rasail";
    for (const item of [...videos, ...audios, ...books, ...pubs]) {
      if (item.visibility !== "public") continue;
      base.push({
        url: `${SITE}/${pathFor(item.type)}/${item.slug}`,
        lastModified: item.published_at ? new Date(item.published_at) : undefined,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    /* sitemap works without DB too */
  }
  return base;
}
