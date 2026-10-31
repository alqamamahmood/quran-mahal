import Link from "next/link";
import { getScholars } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/server";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Scholars Directory" };
export const revalidate = 300;

export default async function ScholarsPage() {
  const d = await getDictionary();
  const scholars = await getScholars(48);

  return (
    <div className="pt-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 dark:text-white">{d.t("scholar.dir.title")}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {d.t("scholar.dir.subtitle")}
      </p>
      {scholars.length === 0 ? (
        <div className="mt-6"><EmptyState icon="👳" title={d.t("scholar.dir.empty")} /></div>
      ) : (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {scholars.map((s) => (
            <Link
              key={s.id}
              href={`/scholars/${s.slug}`}
              className="rounded-2xl border border-brand-100 dark:border-white/10 bg-white dark:bg-neutral-900 p-5 text-center shadow-card hover:shadow-lift hover:-translate-y-0.5 transition-all"
            >
              <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-brand-600 to-brand-900 text-3xl text-white overflow-hidden">
                {s.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.photo_url} alt={s.name} className="h-20 w-20 object-cover" loading="lazy" />
                ) : (
                  <span aria-hidden>👳</span>
                )}
              </span>
              <span className="mt-3 block font-bold">{s.name}</span>
              {s.subjects.length > 0 && (
                <span className="mt-1 block text-xs text-neutral-500 line-clamp-1">{s.subjects.join(" · ")}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
