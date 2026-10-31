import { getDuas } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/server";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Duas" };
export const revalidate = 300;

/** Duas are shown ONLY from the database; unverified rows carry a visible badge.
 *  Never invent dua text — admins add verified duas via /admin. */
export default async function DuasPage() {
  const d = await getDictionary();
  const duas = await getDuas();

  return (
    <div className="pt-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 dark:text-white">{d.t("dua.title")}</h1>
      <p className="mt-1 text-sm text-neutral-500">{d.t("dua.subtitle")}</p>

      <div className="mt-6 space-y-4">
        {duas.length === 0 && (
          <EmptyState icon="🤲" title={d.t("dua.empty.title")} description={d.t("dua.empty.desc")} />
        )}
        {duas.map((item) => (
          <article key={item.id} className="rounded-2xl border border-brand-100 dark:border-white/10 bg-white dark:bg-neutral-900 p-5 sm:p-6 shadow-card">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-extrabold">{item.title}</h2>
              {!item.is_verified && <Badge tone="red">{d.t("common.unverified")}</Badge>}
              {item.category && <Badge tone="neutral">{item.category}</Badge>}
            </div>
            {item.arabic_text ? (
              <p className="font-arabic mt-3 text-2xl leading-loose text-end" lang="ar" dir="rtl">{item.arabic_text}</p>
            ) : (
              <p className="mt-3 text-sm italic text-neutral-400">{d.t("dua.pending")}</p>
            )}
            {item.transliteration && <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400" dir="ltr">{item.transliteration}</p>}
            {item.translation_ur && <p className="mt-2 text-[15px]" dir="rtl" lang="ur">{item.translation_ur}</p>}
            {item.translation_en && <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{item.translation_en}</p>}
            {item.source_reference && (
              <p className="mt-3 text-xs font-semibold text-brand-700 dark:text-brand-300">📜 {item.source_reference}</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
