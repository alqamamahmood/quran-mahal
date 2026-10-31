import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getScholarBySlug, getScholarContent } from "@/lib/content";
import { ContentGrid } from "@/components/content/content-card";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { getDictionary } from "@/lib/i18n/server";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = await getScholarBySlug(slug);
  return { title: s ? s.name : "Not found", description: s?.bio?.slice(0, 160) };
}

export default async function ScholarProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug } = await params;
  const d = await getDictionary();
  const { q } = await searchParams;
  const scholar = await getScholarBySlug(slug);
  if (!scholar || scholar.status !== "active") notFound();

  let content = await getScholarContent(scholar.id, 24);
  if (q) content = content.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()));

  const byType = (t: string) => content.filter((c) => c.type === t);

  return (
    <div className="pt-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-neutral-500">
        <Link href="/scholars" className="hover:text-brand-700">{d.t("scholar.profile.breadcrumb")}</Link> /{" "}
        <span className="text-neutral-700 dark:text-neutral-300">{scholar.name}</span>
      </nav>

      <div className="flex flex-col sm:flex-row gap-5 rounded-3xl border border-brand-100 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-card">
        <span className="grid h-28 w-28 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-brand-600 to-brand-900 text-5xl text-white overflow-hidden">
          {scholar.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={scholar.photo_url} alt={scholar.name} className="h-28 w-28 object-cover" />
          ) : (
            <span aria-hidden>👳</span>
          )}
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 dark:text-white">{scholar.name}</h1>
          {scholar.name_ur && <p className="font-arabic text-xl text-brand-800 dark:text-brand-200" lang="ur">{scholar.name_ur}</p>}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {scholar.languages.map((l) => <Badge key={l} tone="neutral">{l}</Badge>)}
            {scholar.subjects.map((s) => <Badge key={s}>{s}</Badge>)}
          </div>
          {scholar.bio && <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{scholar.bio}</p>}
        </div>
      </div>

      <form action={`/scholars/${slug}`} method="get" className="mt-6 flex gap-2" role="search">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder={d.t("scholar.profile.searchPh")}
          className="h-11 flex-1 rounded-xl border border-brand-200 dark:border-white/15 bg-white dark:bg-neutral-900 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
        />
        <button type="submit" className="h-11 rounded-xl bg-brand-700 px-5 text-sm font-bold text-white">{d.t("common.search")}</button>
      </form>

      {byType("video").length > 0 && (
        <Section title={d.t("scholar.profile.videos")}><ContentGrid items={byType("video")} /></Section>
      )}
      {byType("audio").length > 0 && (
        <Section title={d.t("scholar.profile.audio")}><ContentGrid items={byType("audio")} /></Section>
      )}
      {byType("book").length > 0 && (
        <Section title={d.t("scholar.profile.books")}><ContentGrid items={byType("book")} /></Section>
      )}
      {content.length === 0 && (
        <p className="mt-8 text-center text-sm text-neutral-500">{d.t("scholar.profile.empty")}</p>
      )}
    </div>
  );
}
