import { notFound } from "next/navigation";
import Link from "next/link";
import { getSurahs } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/server";

export const revalidate = 3600;
export const metadata = { title: "Surah" };

/**
 * Surah reading view. Ayah text is fetched at request time from the verified
 * Quran API configured via QURAN_API_BASE (default: api.alquran.cloud, a
 * well-known Tanzil-text-based API). Nothing is fabricated locally.
 */
async function fetchSurah(number: number) {
  const base = process.env.QURAN_API_BASE ?? "https://api.alquran.cloud/v1";
  try {
    const [ar, ur, en] = await Promise.all([
      fetch(`${base}/surah/${number}/quran-uthmani`, { next: { revalidate: 86400 } }).then((r) => r.json()),
      fetch(`${base}/surah/${number}/ur.jalandhry`, { next: { revalidate: 86400 } }).then((r) => r.json()),
      fetch(`${base}/surah/${number}/en.sahih`, { next: { revalidate: 86400 } }).then((r) => r.json()),
    ]);
    if (ar?.code !== 200) return null;
    return {
      arabic: ar.data.ayahs as Array<{ numberInSurah: number; text: string }>,
      urdu: (ur?.data?.ayahs ?? []) as Array<{ text: string }>,
      english: (en?.data?.ayahs ?? []) as Array<{ text: string }>,
    };
  } catch {
    return null;
  }
}

export default async function SurahPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const d = await getDictionary();
  const n = Number(number);
  const surahs = await getSurahs();
  const surah = surahs.find((s) => s.number === n);
  if (!surah) notFound();

  const data = await fetchSurah(n);

  return (
    <div className="pt-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-neutral-500">
        <Link href="/quran" className="hover:text-brand-700">{d.t("quran.breadcrumb")}</Link> /{" "}
        <span className="text-neutral-700 dark:text-neutral-300">{surah.name_en}</span>
      </nav>

      <div className="pattern-bg rounded-3xl p-8 text-center text-white shadow-card">
        <p className="font-arabic text-4xl" lang="ar">{surah.name_ar}</p>
        <h1 className="mt-2 text-2xl font-extrabold">{surah.name_en}</h1>
        <p className="mt-1 text-sm text-brand-100/80">{surah.total_ayahs} {d.t("quran.ayahs")} · {surah.revelation_type}</p>
      </div>

      {!data ? (
        <div className="mt-6 rounded-2xl border border-dashed p-8 text-center text-sm text-neutral-500">
          {d.t("surah.error")}
        </div>
      ) : (
        <ol className="mt-6 space-y-4">
          {data.arabic.map((ayah, i) => (
            <li key={ayah.numberInSurah} className="rounded-2xl border border-brand-100 dark:border-white/10 bg-white dark:bg-neutral-900 p-5 shadow-card">
              <p className="font-arabic text-2xl leading-loose text-end" lang="ar" dir="rtl">
                {ayah.text}
                <span className="ms-2 inline-grid h-8 w-8 place-items-center rounded-full bg-brand-100 dark:bg-brand-950 text-sm font-sans text-brand-800 dark:text-brand-200">
                  {ayah.numberInSurah}
                </span>
              </p>
              {data.urdu[i]?.text && (
                <p className="mt-3 text-[15px] leading-relaxed" dir="rtl" lang="ur">{data.urdu[i].text}</p>
              )}
              {data.english[i]?.text && (
                <p className="mt-2 text-sm text-neutral-500 leading-relaxed">{data.english[i].text}</p>
              )}
            </li>
          ))}
        </ol>
      )}
      <p className="mt-6 text-xs text-neutral-500">
        {d.t("surah.source")} Tanzil-based editions via api.alquran.cloud (Uthmani script; Urdu: Jalandhry; English: Saheeh International).
      </p>
    </div>
  );
}
