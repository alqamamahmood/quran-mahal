import Link from "next/link";
import { searchContent } from "@/lib/content";
import { ContentGrid } from "@/components/content/content-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getDictionary, type Dictionary } from "@/lib/i18n/server";
import type { ContentType } from "@/lib/types";

export const metadata = { title: "Search" };
export const dynamic = "force-dynamic";

const TYPE_FILTERS: Array<{ key: string; labelKey: string; value?: ContentType }> = [
  { key: "all", labelKey: "search.f.all" },
  { key: "video", labelKey: "search.f.video", value: "video" },
  { key: "audio", labelKey: "search.f.audio", value: "audio" },
  { key: "book", labelKey: "search.f.book", value: "book" },
  { key: "publication", labelKey: "search.f.publication", value: "publication" },
  { key: "article", labelKey: "search.f.article", value: "article" },
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const d = await getDictionary();
  const { q = "", type = "all" } = await searchParams;
  const filter = TYPE_FILTERS.find((f) => f.key === type);
  const results = q.trim().length >= 2 ? await searchContent(q, { type: filter?.value }) : [];

  return (
    <div className="pt-6">
      <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{d.t("search.title")}</h1>
      <form action="/search" method="get" className="mt-4 flex gap-2" role="search">
        <input
          name="q"
          defaultValue={q}
          placeholder={d.t("search.placeholder")}
          aria-label={d.t("search.title")}
          className="h-12 flex-1 rounded-2xl border border-brand-200 dark:border-white/15 bg-white dark:bg-neutral-900 px-5 focus:outline-none focus:ring-2 focus:ring-brand-600"
        />
        <input type="hidden" name="type" value={type} />
        <button type="submit" className="h-12 rounded-2xl bg-brand-700 px-6 font-bold text-white hover:bg-brand-800">
          {d.t("search.button")}
        </button>
      </form>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {TYPE_FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/search?q=${encodeURIComponent(q)}&type=${f.key}`}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold border ${type === f.key ? "bg-brand-700 text-white border-brand-700" : "border-brand-200 dark:border-white/15"}`}
          >
            {d.t(f.labelKey)}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        {q.trim().length < 2 ? (
          <EmptyState icon="🔍" title={d.t("search.hint.title")} description={d.t("search.hint.desc")} />
        ) : results.length === 0 ? (
          <EmptyState icon="🔍" title={d.t("search.noresult.title")} description={`"${q}" — ${d.t("common.noResults")}`} />
        ) : (
          <>
            <p className="mb-3 text-sm text-neutral-500">{results.length} {d.t("search.noresult.desc")} — "{q}"</p>
            <ContentGrid items={results} />
          </>
        )}
      </div>
    </div>
  );
}
