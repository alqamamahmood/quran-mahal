import Link from "next/link";
import { Section } from "@/components/ui/section";
import { ContentGrid } from "@/components/content/content-card";
import { Badge } from "@/components/ui/badge";
import {
  getCategories,
  getFeatured,
  getPopular,
  getRecent,
  getScholars,
} from "@/lib/content";
import { SAMPLE_REMINDER } from "@/lib/sample-data";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { formatViews, timeAgo } from "@/lib/utils";
import { getDictionary, type Dictionary } from "@/lib/i18n/server";

export const revalidate = 300;

async function Hero({ d }: { d: Dictionary }) {
  const featured = await getFeatured(1);
  const item = featured[0];
  return (
    <div className="pattern-bg relative overflow-hidden rounded-3xl mt-6 text-white shadow-lift">
      <div className="relative px-6 py-10 sm:px-10 sm:py-14 max-w-2xl">
        <Badge tone="gold" className="mb-3">{d.t("home.hero.kicker")}</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
          {d.t("home.hero.title")}
        </h1>
        <p className="mt-3 text-brand-100/90">{d.t("home.hero.subtitle")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/bayanaat"
            className="inline-flex h-11 items-center rounded-xl bg-gold-500 px-6 font-bold text-brand-950 hover:bg-gold-400"
          >
            {d.t("home.hero.cta")}
          </Link>
          {item && (
            <Link
              href={`/bayanaat/${item.slug}`}
              className="inline-flex h-11 items-center rounded-xl border border-white/30 px-6 font-bold hover:bg-white/10"
            >
              ▶ {item.title.replace("[SAMPLE] ", "")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const d = await getDictionary();
  const [featured, recentVideos, popularVideos, recentAudio, featuredBooks, recentRasail, categories, scholars] =
    await Promise.all([
      getFeatured(4),
      getRecent("video", 8),
      getPopular("video", 4),
      getRecent("audio", 4),
      getRecent("book", 4),
      getRecent("publication", 4),
      getCategories(),
      getScholars(6),
    ]);

  const sampleMode = !isSupabaseConfigured();

  return (
    <div>
      <Hero d={d} />
      {sampleMode && (
        <p className="mt-4 rounded-xl border border-dashed border-gold-500/60 bg-gold-100/40 px-4 py-2 text-xs text-yellow-900 dark:text-gold-300">
          {d.t("home.sampleMode")}
        </p>
      )}

      <Section title={d.t("home.categories")} href="/bayanaat" viewAllLabel={d.t("common.viewAll")}>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/bayanaat?category=${c.slug}`}
              className="shrink-0 rounded-2xl border border-brand-200 dark:border-white/10 bg-white dark:bg-neutral-900 px-5 py-3.5 text-center shadow-card hover:shadow-lift hover:-translate-y-0.5 transition-all min-w-[130px]"
            >
              <span className="text-2xl" aria-hidden>📖</span>
              <span className="mt-1 block text-sm font-bold text-brand-900 dark:text-brand-100">
                {d.lang === "en" ? c.name : (c.name_ur ?? c.name)}
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {featured.length > 0 && (
        <Section title={d.t("home.featured")} href="/bayanaat" viewAllLabel={d.t("common.viewAll")}>
          <ContentGrid items={featured} />
        </Section>
      )}

      <Section title={d.t("home.recent")} href="/bayanaat" viewAllLabel={d.t("common.viewAll")}>
        <ContentGrid items={recentVideos} />
      </Section>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-gradient-to-br from-gold-500 to-gold-600 p-6 text-brand-950 shadow-card">
          <p className="text-xs font-bold uppercase tracking-wider opacity-70">{d.t("home.reminder")}</p>
          <p className="mt-2 text-lg font-bold leading-relaxed">{SAMPLE_REMINDER}</p>
          <p className="mt-2 text-xs opacity-70">{d.t("home.reminderSampleNote")}</p>
        </div>
        <div className="rounded-3xl border border-brand-200 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-card">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">{d.t("home.popularScholars")}</p>
          <div className="mt-3 space-y-2">
            {scholars.slice(0, 4).map((s) => (
              <Link key={s.id} href={`/scholars/${s.slug}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-brand-50 dark:hover:bg-white/5">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 dark:bg-brand-950 text-lg">👳</span>
                <span className="font-bold text-sm">{s.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Section title={d.t("home.popular")} href="/bayanaat" viewAllLabel={d.t("common.viewAll")}>
        <div className="grid gap-3">
          {popularVideos.map((v, i) => (
            <Link key={v.id} href={`/bayanaat/${v.slug}`} className="flex items-center gap-4 rounded-2xl border border-brand-100 dark:border-white/10 bg-white dark:bg-neutral-900 p-3 shadow-card hover:shadow-lift transition-shadow">
              <span className="text-2xl font-extrabold text-gold-500 w-8 text-center">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-sm">{v.title}</p>
                <p className="text-xs text-neutral-500">{v.scholar?.name} · {formatViews(v.view_count)} {d.t("common.views")} · {timeAgo(v.published_at, d.lang)}</p>
              </div>
              <span aria-hidden className="text-brand-600 text-xl">▶</span>
            </Link>
          ))}
        </div>
      </Section>

      <Section title={d.t("home.audio")} href="/audio" viewAllLabel={d.t("common.viewAll")}>
        <ContentGrid items={recentAudio} />
      </Section>

      <Section title={d.t("home.books")} href="/books" viewAllLabel={d.t("common.viewAll")}>
        <ContentGrid items={featuredBooks} />
      </Section>

      <Section title={d.t("home.rasail")} href="/rasail" viewAllLabel={d.t("common.viewAll")}>
        <ContentGrid items={recentRasail} />
      </Section>
    </div>
  );
}
