"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { toggleContentStatus, deleteContent } from "@/app/admin/actions";
import type { ContentItem } from "@/lib/types";
import { formatViews } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/provider";

const TYPE_LABEL: Record<string, string> = {
  video: "🎬 Video", audio: "🎧 Audio", book: "📚 Book",
  publication: "📰 Risala", article: "📝 Article",
};

/** Server-rendered content table with publish/feature/delete actions. */
export function ContentTable({ items }: { items: ContentItem[] }) {
  const { t } = useLanguage();
  const confirmMsg = t("admin.table.confirmDelete");
  return (
    <div className="overflow-x-auto rounded-2xl border border-brand-100 dark:border-white/10">
      <table className="w-full text-sm min-w-[720px]">
        <thead>
          <tr className="bg-brand-50 dark:bg-white/5 text-start">
            <th className="p-3 text-start font-bold">{t("common.title")}</th>
            <th className="p-3 text-start font-bold">{t("common.type")}</th>
            <th className="p-3 text-start font-bold">{t("common.status")}</th>
            <th className="p-3 text-start font-bold">{t("common.views")}</th>
            <th className="p-3 text-start font-bold">{t("common.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id} className="border-t border-brand-100 dark:border-white/10">
              <td className="p-3">
                <p className="font-bold line-clamp-1 max-w-[280px]">{i.title}</p>
                <p className="text-xs text-neutral-500">{i.scholar?.name ?? "—"} · {i.language}</p>
              </td>
              <td className="p-3 whitespace-nowrap">{TYPE_LABEL[i.type]}</td>
              <td className="p-3">
                <div className="flex gap-1 flex-wrap">
                  <Badge tone={i.status === "published" ? "brand" : "neutral"}>{i.status}</Badge>
                  {i.is_featured && <Badge tone="gold">Featured</Badge>}
                  {i.visibility === "premium" && <Badge tone="gold">Premium</Badge>}
                </div>
              </td>
              <td className="p-3">{formatViews(i.view_count)}</td>
              <td className="p-3">
                <div className="flex gap-1.5 flex-wrap">
                  <form action={toggleContentStatus}>
                    <input type="hidden" name="id" value={i.id} />
                    <input type="hidden" name="field" value="status" />
                    <button className="rounded-lg border px-2.5 py-1.5 text-xs font-bold hover:bg-brand-50" title="Publish/Unpublish">
                      {i.status === "published" ? t("admin.table.unpublish") : t("admin.table.publish")}
                    </button>
                  </form>
                  <form action={toggleContentStatus}>
                    <input type="hidden" name="id" value={i.id} />
                    <input type="hidden" name="field" value="is_featured" />
                    <button className="rounded-lg border px-2.5 py-1.5 text-xs font-bold hover:bg-brand-50" title="Feature">
                      {i.is_featured ? "★" : "☆"}
                    </button>
                  </form>
                  <form action={deleteContent} onSubmit={(e) => { if (!confirm(confirmMsg)) e.preventDefault(); }}>
                    <input type="hidden" name="id" value={i.id} />
                    <button className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">
                      {t("admin.table.delete")}
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && <p className="p-6 text-center text-sm text-neutral-500">{t("admin.table.empty")}</p>}
    </div>
  );
}

export function NewContentButton({ type }: { type?: string }) {
  const { t } = useLanguage();
  return (
    <Link
      href={type ? `/admin/content/new?type=${type}` : "/admin/content/new"}
      className="inline-flex h-11 items-center rounded-xl bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-800"
    >
      + {t("common.new")}
    </Link>
  );
}
