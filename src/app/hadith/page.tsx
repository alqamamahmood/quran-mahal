import { getHadith } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/server";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Hadith" };
export const revalidate = 300;

/** Hadith shown ONLY from the database with collection + grading source.
 *  Unverified rows are badged and carry no fabricated text. */
export default async function HadithPage() {
  const d = await getDictionary();
  const list = await getHadith();

  return (
    <div className="pt-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 dark:text-white">{d.t("hadith.title")}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {d.t("hadith.subtitle")}
      </p>

      <div className="mt-6 space-y-4">
        {list.length === 0 && (
          <EmptyState icon="📜" title={d.t("hadith.empty.title")} description={d.t("hadith.empty.desc")} />
        )}
        {list.map((h) => (
          <article key={h.id} className="rounded-2xl border border-brand-100 dark:border-white/10 bg-white dark:bg-neutral-900 p-5 sm:p-6 shadow-card">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{h.collection}</Badge>
              {h.hadith_number && <Badge tone="neutral">#{h.hadith_number}</Badge>}
              {h.authenticity_grade && <Badge tone="gold">{h.authenticity_grade}</Badge>}
              {!h.is_verified && <Badge tone="red">{d.t("common.unverified")}</Badge>}
            </div>
            {h.book_name && <p className="mt-2 text-sm font-semibold text-neutral-600 dark:text-neutral-400">{h.book_name}{h.chapter ? ` — ${h.chapter}` : ""}</p>}
            {h.arabic_text ? (
              <p className="font-arabic mt-3 text-xl leading-loose text-end" lang="ar" dir="rtl">{h.arabic_text}</p>
            ) : (
              <p className="mt-3 text-sm italic text-neutral-400">{d.t("hadith.pending")}</p>
            )}
            {h.translation_ur && <p className="mt-3 text-[15px]" dir="rtl" lang="ur">{h.translation_ur}</p>}
            {h.translation_en && <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{h.translation_en}</p>}
            {h.grade_source && <p className="mt-3 text-xs text-neutral-500">{d.t("hadith.gradeSource")} {h.grade_source}</p>}
          </article>
        ))}
      </div>
    </div>
  );
}
