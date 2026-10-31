import Link from "next/link";
import { getCategories, getLibrary } from "@/lib/content";
import { ContentGrid } from "@/components/content/content-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Bayanaat — Video Library" };
export const revalidate = 300;

export default async function BayanaatPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const d = await getDictionary();
  const { category, q, page } = await searchParams;
  const [{ items, total }, categories] = await Promise.all([
    getLibrary("video", { category, q, page: Number(page ?? 1) }),
    getCategories(),
  ]);

  return (
    <div className="pt-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 dark:text-white">{d.t("lib.bayanaat.title")}</h1>
      <p className="mt-1 text-sm text-neutral-500">{d.t("lib.bayanaat.subtitle")} — {total} {d.t("lib.items")}</p>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2" role="navigation" aria-label="Categories">
        <Link
          href="/bayanaat"
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold border ${!category ? "bg-brand-700 text-white border-brand-700" : "border-brand-200 dark:border-white/15"}`}
        >
          {d.t("common.all")}
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/bayanaat?category=${c.slug}`}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold border ${category === c.slug ? "bg-brand-700 text-white border-brand-700" : "border-brand-200 dark:border-white/15"}`}
          >
            {d.lang === "en" ? c.name : (c.name_ur ?? c.name)}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState
            icon="🎬"
            title={d.t("lib.empty.video.title")}
            description={d.t("lib.empty.video.desc")}
          />
        ) : (
          <ContentGrid items={items} />
        )}
      </div>

      {items.some((i) => i.visibility === "premium") && (
        <p className="mt-4 text-xs text-neutral-500">
          <Badge tone="gold">{d.t("common.premium")}</Badge> {d.t("lib.premiumNote")}
        </p>
      )}
    </div>
  );
}
