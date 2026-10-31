"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/provider";

/**
 * Registers the service worker and shows an "Install app" banner when the
 * browser fires beforeinstallprompt (Android/Chrome). Makes the site feel
 * like a native app: fullscreen, home-screen icon, offline shell.
 */
export function PwaManager() {
  const { t } = useLanguage();
  const [deferred, setDeferred] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem("qm-install-dismissed") === "1") setDismissed(true);
    } catch {}
  }, []);

  if (!deferred || dismissed) return null;

  const install = async () => {
    try {
      deferred.prompt();
      await deferred.userChoice;
    } catch {}
    setDeferred(null);
  };
  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem("qm-install-dismissed", "1");
    } catch {}
  };

  return (
    <div className="fixed inset-x-3 bottom-20 z-50 lg:bottom-6 lg:left-auto lg:right-6 lg:w-96">
      <div className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-white/95 p-3 shadow-xl backdrop-blur dark:border-white/10 dark:bg-neutral-900/95">
        <img src="/icons/icon-192.png" alt="" className="h-11 w-11 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">{t("pwa.install.title")}</p>
          <p className="truncate text-xs text-neutral-500">{t("pwa.install.body")}</p>
        </div>
        <button
          onClick={install}
          className="rounded-xl bg-brand-700 px-3 py-2 text-sm font-bold text-white"
        >
          {t("pwa.install.cta")}
        </button>
        <button onClick={dismiss} aria-label="✕" className="px-1 text-neutral-400">
          ✕
        </button>
      </div>
    </div>
  );
}
