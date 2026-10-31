"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDuration } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/provider";

interface Entry { t: number; d: number; at: number }

/** Continue Watching/ Listening — reads device-local progress (works offline too). */
export function ContinueList({ kind }: { kind: "watch" | "listen" }) {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<Array<{ slug: string; t: number; d: number }>>([]);
  const key = kind === "watch" ? "qm-watch-progress" : "qm-audio-progress";

  useEffect(() => {
    try {
      const all: Record<string, Entry | number> = JSON.parse(localStorage.getItem(key) ?? "{}");
      const list = Object.entries(all)
        .map(([slug, v]) => {
          const e: Entry = typeof v === "number" ? { t: v, d: 0, at: 0 } : v;
          return { slug, t: e.t ?? 0, d: e.d ?? 0, at: e.at ?? 0 };
        })
        .filter((e) => e.t > 30)
        .sort((a, b) => b.at - a.at)
        .slice(0, 20);
      setEntries(list);
    } catch { /* ignore */ }
  }, [key]);

  const base = kind === "watch" ? "/bayanaat" : "/audio";
  const title = kind === "watch" ? "Continue Watching" : "Continue Listening";

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{title}</h1>
      <p className="mt-1 text-xs text-neutral-500">{t("dash.cont.deviceNote")}</p>
      <div className="mt-4 space-y-2">
        {entries.length === 0 && (
          <EmptyState icon={kind === "watch" ? "▶" : "🎧"} title={t("dash.cont.empty.title")} description={t("dash.cont.empty.desc")} />
        )}
        {entries.map((e) => {
          const pct = e.d > 0 ? Math.min(100, (e.t / e.d) * 100) : 0;
          return (
            <Link key={e.slug} href={`${base}/${e.slug}`} className="block rounded-2xl border border-brand-100 dark:border-white/10 bg-white dark:bg-neutral-900 p-4 hover:shadow-card">
              <p className="font-bold text-sm truncate">{e.slug.replace(/-/g, " ")}</p>
              <div className="mt-2 h-1.5 rounded-full bg-brand-100 dark:bg-white/10">
                <div className="h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1 text-xs text-neutral-500">{formatDuration(e.t)}{e.d > 0 ? ` / ${formatDuration(e.d)}` : ""} · {Math.round(pct)}%</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
