"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { createContent } from "@/app/admin/actions";
import { FileUploader } from "@/components/admin/file-uploader";
import type { ContentType } from "@/lib/types";

const TYPES: Array<{ v: ContentType; label: string }> = [
  { v: "video", label: "🎬 Video" },
  { v: "audio", label: "🎧 Audio" },
  { v: "book", label: "📚 Book" },
  { v: "publication", label: "📰 Risala" },
  { v: "article", label: "📝 Article" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-neutral-300 dark:border-white/15 bg-white dark:bg-neutral-900 px-3 text-sm";

export function ContentForm({
  scholars,
  categories,
  defaultType,
  error,
}: {
  scholars: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  defaultType: ContentType;
  error?: string;
}) {
  const [type, setType] = useState<ContentType>(defaultType);
  const { t } = useLanguage();
  // Direct-upload targets (filled by FileUploader)
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbUrl, setThumbUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioCoverUrl, setAudioCoverUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [bookCoverUrl, setBookCoverUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [risalaCoverUrl, setRisalaCoverUrl] = useState("");

  return (
    <form action={createContent} className="space-y-5 max-w-3xl">
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <Card><CardBody className="space-y-4">
        <Field label={t("admin.form.type")}>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t.v}
                type="button"
                onClick={() => setType(t.v)}
                aria-pressed={type === t.v}
                className={`rounded-xl border px-4 py-2.5 text-sm font-bold ${type === t.v ? "bg-brand-700 text-white border-brand-700" : "border-brand-200 dark:border-white/15"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input type="hidden" name="type" value={type} />
        </Field>
        <Input name="title" label={t("admin.form.titleReq")} required maxLength={200} />
        <Field label={t("common.description")}>
          <textarea name="description" rows={4} maxLength={5000} className={`${inputCls} h-auto py-2`} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={t("admin.form.scholar")}>
            <select name="scholar_id" className={inputCls} defaultValue="">
              <option value="">—</option>
              {scholars.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label={t("admin.form.category")}>
            <select name="category_id" className={inputCls} defaultValue="">
              <option value="">—</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label={t("admin.form.language")}>
            <select name="language" className={inputCls} defaultValue="ur">
              <option value="ur">Urdu</option>
              <option value="roman">Roman Urdu</option>
              <option value="en">English</option>
              <option value="ar">Arabic</option>
            </select>
          </Field>
          <Field label={t("common.status")}>
            <select name="status" className={inputCls} defaultValue="draft">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
          <Field label={t("admin.form.visibility")}>
            <select name="visibility" className={inputCls} defaultValue="public">
              <option value="public">Public</option>
              <option value="premium">Premium</option>
              <option value="private">Private</option>
            </select>
          </Field>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2 font-semibold"><input type="checkbox" name="is_featured" className="h-4 w-4" /> {t("admin.form.featured")}</label>
          <label className="flex items-center gap-2 font-semibold"><input type="checkbox" name="allow_download" className="h-4 w-4" /> {t("admin.form.allowDownload")}</label>
        </div>
        <Input name="tags" label={t("admin.form.tags")} placeholder="seerat, namaz" />
        <Input name="copyright_note" label={t("admin.form.copyright")} placeholder="© Channel name — used with permission" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input name="seo_title" label={t("admin.form.seoTitle")} maxLength={200} />
          <Input name="seo_description" label={t("admin.form.seoDesc")} maxLength={300} />
        </div>
      </CardBody></Card>

      {type === "video" && (
        <Card><CardBody className="space-y-4">
          <h2 className="font-bold">{t("admin.form.videoDetails")}</h2>
          <FileUploader
            bucket="media-public"
            prefix="videos/"
            accept="video/*"
            buttonLabel={t("admin.upload.chooseVideo")}
            onUploaded={setVideoUrl}
          />
          {videoUrl ? (
            <p className="break-all text-xs font-semibold text-green-600">✓ {videoUrl}</p>
          ) : (
            <p className="text-xs font-semibold text-amber-600">{t("admin.upload.required")}</p>
          )}
          <input type="hidden" name="video_provider" value="upload" />
          <input type="hidden" name="video_url" value={videoUrl} />
          <FileUploader
            bucket="covers"
            prefix="covers/"
            accept="image/*"
            buttonLabel={t("admin.upload.chooseCover")}
            onUploaded={setThumbUrl}
          />
          {thumbUrl && <p className="break-all text-xs font-semibold text-green-600">✓ {thumbUrl}</p>}
          <input type="hidden" name="thumbnail_url" value={thumbUrl} />
          <Input name="duration_seconds" label={t("admin.form.duration")} type="number" min={0} dir="ltr" />
        </CardBody></Card>
      )}

      {type === "audio" && (
        <Card><CardBody className="space-y-4">
          <h2 className="font-bold">{t("admin.form.audioDetails")}</h2>
          <FileUploader
            bucket="media-public"
            prefix="audio/"
            accept="audio/*"
            buttonLabel={t("admin.upload.chooseAudio")}
            onUploaded={setAudioUrl}
          />
          {audioUrl ? (
            <p className="break-all text-xs font-semibold text-green-600">✓ {audioUrl}</p>
          ) : (
            <p className="text-xs font-semibold text-amber-600">{t("admin.upload.required")}</p>
          )}
          <input type="hidden" name="audio_url" value={audioUrl} />
          <FileUploader
            bucket="covers"
            prefix="covers/"
            accept="image/*"
            buttonLabel={t("admin.upload.chooseCover")}
            onUploaded={setAudioCoverUrl}
          />
          {audioCoverUrl && <p className="break-all text-xs font-semibold text-green-600">✓ {audioCoverUrl}</p>}
          <input type="hidden" name="cover_url" value={audioCoverUrl} />
          <Input name="duration_seconds" label={t("admin.form.duration")} type="number" min={0} dir="ltr" />
        </CardBody></Card>
      )}

      {type === "book" && (
        <Card><CardBody className="space-y-4">
          <h2 className="font-bold">{t("admin.form.bookDetails")}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input name="author" label={t("admin.form.author")} />
            <Field label={t("admin.form.format")}>
              <select name="file_format" className={inputCls} defaultValue="pdf">
                <option value="pdf">PDF</option>
                <option value="epub">EPUB</option>
                <option value="html">HTML</option>
                <option value="other">Other</option>
              </select>
            </Field>
          </div>
          <FileUploader
            bucket="media-public"
            prefix="books/"
            accept=".pdf,.epub"
            buttonLabel={t("admin.upload.chooseBook")}
            onUploaded={setFileUrl}
          />
          {fileUrl ? (
            <p className="break-all text-xs font-semibold text-green-600">✓ {fileUrl}</p>
          ) : (
            <p className="text-xs font-semibold text-amber-600">{t("admin.upload.required")}</p>
          )}
          <input type="hidden" name="file_url" value={fileUrl} />
          <FileUploader
            bucket="covers"
            prefix="covers/"
            accept="image/*"
            buttonLabel={t("admin.upload.chooseCover")}
            onUploaded={setBookCoverUrl}
          />
          {bookCoverUrl && <p className="break-all text-xs font-semibold text-green-600">✓ {bookCoverUrl}</p>}
          <input type="hidden" name="cover_url" value={bookCoverUrl} />
          <Input name="pages" label={t("admin.form.pages")} type="number" min={0} dir="ltr" />
          <p className="text-xs text-neutral-500">{t("admin.form.bookNote")}</p>
        </CardBody></Card>
      )}

      {type === "publication" && (
        <Card><CardBody className="space-y-4">
          <h2 className="font-bold">{t("admin.form.risalaDetails")}</h2>
          <Input name="issue_no" label={t("admin.form.issueNo")} />
          <FileUploader
            bucket="covers"
            prefix="covers/"
            accept="image/*"
            buttonLabel={t("admin.upload.chooseCover")}
            onUploaded={setRisalaCoverUrl}
          />
          {risalaCoverUrl && <p className="break-all text-xs font-semibold text-green-600">✓ {risalaCoverUrl}</p>}
          <input type="hidden" name="cover_url" value={risalaCoverUrl} />
          <FileUploader
            bucket="media-public"
            prefix="risalas/"
            accept=".pdf"
            buttonLabel={t("admin.upload.chooseRisala")}
            onUploaded={setPdfUrl}
          />
          {pdfUrl ? (
            <p className="break-all text-xs font-semibold text-green-600">✓ {pdfUrl}</p>
          ) : (
            <p className="text-xs font-semibold text-amber-600">{t("admin.upload.required")}</p>
          )}
          <input type="hidden" name="pdf_url" value={pdfUrl} />
        </CardBody></Card>
      )}

      {type === "article" && (
        <Card><CardBody className="space-y-4">
          <h2 className="font-bold">{t("admin.form.articleDetails")}</h2>
          <Input name="excerpt" label={t("admin.form.excerpt")} maxLength={500} />
          <Field label={t("admin.form.bodyHtml")}>
            <textarea name="body_html" rows={12} dir="ltr" className={`${inputCls} h-auto py-2 font-mono text-xs`} placeholder="<h2>…</h2><p>…</p>" />
          </Field>
          <p className="text-xs text-neutral-500">Tip: write in a rich-text editor, paste clean HTML here. Never present AI-generated rulings as verified fatwas.</p>
        </CardBody></Card>
      )}

      <Button type="submit" size="lg">{t("admin.form.saveBtn")}</Button>
    </form>
  );
}
