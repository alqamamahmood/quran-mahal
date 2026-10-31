"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/provider";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch { /* dismissed */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <button
      onClick={share}
      className="inline-flex h-11 items-center gap-2 rounded-xl border border-brand-200 dark:border-white/15 px-4 text-sm font-bold hover:bg-brand-50 dark:hover:bg-white/5"
    >
      <span aria-hidden>🔗</span>
      {copied ? t("share.copied") : t("common.share")}
    </button>
  );
}
