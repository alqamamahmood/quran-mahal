"use client";

import { useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/provider";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 50 * 1024 * 1024; // Supabase free tier ≈ 50MB per file

/**
 * Uploads a file straight to Supabase Storage (no link pasting needed) and
 * hands the public URL back via onUploaded. Used in the admin content form
 * for videos, audio, books, risalas and cover images.
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
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setError("");
    if (file.size > MAX_BYTES) {
      setState("error");
      setError(t("admin.upload.tooBig"));
      return;
    }
    setState("uploading");
    setFileName(file.name);
    try {
      const supabase = createClient();
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${prefix}${Date.now()}-${safe}`;
      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: false, contentType: file.type || undefined });
      if (upErr) throw upErr;
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
      <button
        type="button"
        disabled={state === "uploading"}
        onClick={() => inputRef.current?.click()}
        className="rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
      >
        {state === "uploading" ? `⏳ ${t("admin.upload.uploading")}` : `📤 ${buttonLabel || t("admin.upload.choose")}`}
      </button>
      {state === "done" && (
        <p className="text-xs font-semibold text-green-600">✓ {fileName} — {t("admin.upload.done")}</p>
      )}
      {state === "error" && <p className="text-xs font-semibold text-red-600">{error}</p>}
      {state === "idle" && <p className="text-xs text-neutral-500">{t("admin.upload.hint")}</p>}
    </div>
  );
}
