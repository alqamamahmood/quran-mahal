"use client";

import { useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/provider";

const REASON_KEYS = ["report.r1", "report.r2", "report.r3", "report.r4"];

export function ReportButton({ contentId }: { contentId: string }) {
  const { t } = useLanguage();
  const reasons = REASON_KEYS.map((k) => t(k));
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(reasons[0]);
  const [details, setDetails] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) { setDone(true); return; }
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("reports").insert({
        reporter_id: user?.id ?? null,
        content_item_id: contentId,
        reason,
        details: details || null,
      });
      setDone(true);
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return <p className="text-sm font-semibold text-brand-700">{t("report.done")}</p>;

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-sm font-semibold text-neutral-500 hover:text-red-600 underline underline-offset-2"
      >
        {t("report.title")}
      </button>
      {open && (
        <form onSubmit={submit} className="mt-3 rounded-2xl border border-brand-100 dark:border-white/10 p-4 space-y-3 bg-white dark:bg-neutral-900">
          <label className="block text-sm font-semibold">
            {t("report.reason")}
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-neutral-300 dark:border-white/15 bg-white dark:bg-neutral-900 px-3"
            >
              {reasons.map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            {t("report.details")}
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-neutral-300 dark:border-white/15 bg-white dark:bg-neutral-900 px-3 py-2"
            />
          </label>
          <Button type="submit" size="sm" disabled={busy}>{t("report.submit")}</Button>
        </form>
      )}
    </div>
  );
}
