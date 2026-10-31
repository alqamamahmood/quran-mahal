"use client";

import { useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/provider";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 50 * 1024 * 1024; // Supabase free tier ≈ 50MB per file

/**
 * Uploads a file straight to Supabase Storage (no link pasting needed) and
 * hands the public URL back via onUploaded. Uses XMLHttpRequest so the user
 * sees a real progress bar on slow connections.
 */
export function FileUploader({
  bucket,
  prefix,
  accept,
  onUploaded,
  buttonLabel,
}: {
  bucket: string;
  prefix: string;
  accept: string;
  onUploaded: (url: string) => void;
  buttonLabel?: string;
}) {
  const { t } = useLanguage();
  const [state, setState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const cancel = () => {
    xhrRef.current?.abort();
  };

  const upload = async (file: File) => {
    setError("");
    if (file.size > MAX_BYTES) {
      setState("error");
      setError(t("admin.upload.tooBig"));
      return;
    }
    setState("uploading");
    setProgress(0);
    setFileName(file.name);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error(t("admin.upload.loginAgain"));
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${prefix}${Date.now()}-${safe}`;
      const url = `${baseUrl}/storage/v1/object/${bucket}/${path}`;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(t("admin.upload.failed") + ` (${xhr.status})`));
        };
        xhr.onerror = () => reject(new Error(t("admin.upload.failed")));
        xhr.onabort = () => reject(new Error(t("admin.upload.cancelled")));
        xhr.open("PUT", url);
        xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
        xhr.setRequestHeader("apikey", anonKey || "");
        if (file.type) xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onUploaded(data.publicUrl);
      setState("done");
    } catch (e: any) {
      setState("error");
      setError(e?.message || t("admin.upload.failed"));
    }
  };

  return (
    <div className="space-y-1.5">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
      {state === "uploading" ? (
        <div className="space-y-1.5">
          <div className="h-2.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-brand-600 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">
              ⏳ {progress}% — {fileName}
            </span>
            <button
              type="button"
              onClick={cancel}
              className="font-bold text-red-600"
            >
              ✕ {t("admin.upload.cancel")}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white"
        >
          📤 {buttonLabel || t("admin.upload.choose")}
        </button>
      )}
      {state === "done" && (
        <p className="text-xs font-semibold text-green-600">✓ {fileName} — {t("admin.upload.done")}</p>
      )}
      {state === "error" && <p className="text-xs font-semibold text-red-600">{error}</p>}
      {state === "idle" && <p className="text-xs text-neutral-500">{t("admin.upload.hint")}</p>}
    </div>
  );
}
