import Link from "next/link";
import { getSurahs } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Quran — Surah Index" };
export const revalidate = 3600;

/**
 * Surah index from the database. Full ayah text, translations and recitation
 * audio come from a VERIFIED external Quran API (see docs/INTEGRATIONS.md —
 * QURAN_API_BASE). We never store or invent Quranic text ourselves.
 */
export default async function QuranPage() {
  const d = await getDictionary();
  const surahs = await getSurahs();
  const apiNote = !process.env.QURAN_API_BASE;

  return (
    <div className="pt-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 dark:text-white">{d.t("quran.title")}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {d.t("quran.subtitle")}
      </p>
      {apiNote && (
        <p className="mt-3 rounded-xl border border-dashed border-gold-500/60 bg-gold-100/40 px-4 py-2 text-xs text-yellow-900 dark:text-gold-300">
          {d.t("quran.apiNote")}
        </p>
      )}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {surahs.map((s) => (
          <Link
            key={s.number}
            href={`/quran/${s.number}`}
            className="flex items-center gap-4 rounded-2xl border border-brand-100 dark:border-white/10 bg-white dark:bg-neutral-900 p-4 shadow-card hover:shadow-lift transition-shadow"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-700 text-white font-bold">
              {s.number}
            </span>
            <span className="flex-1">
              <span className="block font-bold">{s.name_en}</span>
              <span className="block text-xs text-neutral-500">
                {s.total_ayahs} {d.t("quran.ayahs")} · {s.revelation_type}
              </span>
            </span>
            <span className="font-arabic text-2xl text-brand-800 dark:text-brand-200" lang="ar">
              {s.name_ar}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
