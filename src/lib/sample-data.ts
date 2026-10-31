/**
 * Clearly-marked SAMPLE content used only when Supabase is not configured
 * (local dev / preview). Every item is prefixed [SAMPLE] in the UI.
 * Real content comes from the database once .env is set up.
 */
import type { Category, ContentItem, Scholar, Dua, Hadith, Surah } from "./types";

export const SAMPLE_SCHOLARS: Scholar[] = [
  {
    id: "sample-scholar-1",
    slug: "sample-scholar",
    name: "[SAMPLE] Scholar Name",
    name_ur: "[نمونہ] عالم کا نام",
    bio: "Sample biography placeholder. Replace with a real, authorized scholar profile.",
    photo_url: null,
    photo_permission_note: null,
    languages: ["ur"],
    subjects: ["Aqeedah"],
    status: "active",
    created_at: new Date().toISOString(),
  },
];

export const SAMPLE_CATEGORIES: Category[] = [
  { id: "c1", slug: "quran-tafseer", name: "Quran & Tafseer", name_ur: "قرآن و تفسیر", name_ar: "القرآن والتفسیر", description: null, icon: "book", parent_id: null, sort_order: 1, is_active: true },
  { id: "c2", slug: "seerat", name: "Seerat-un-Nabi ﷺ", name_ur: "سیرت النبی ﷺ", name_ar: null, description: null, icon: "moon", parent_id: null, sort_order: 2, is_active: true },
  { id: "c3", slug: "aqeedah", name: "Aqeedah", name_ur: "عقیدہ", name_ar: null, description: null, icon: "shield", parent_id: null, sort_order: 3, is_active: true },
  { id: "c4", slug: "namaz-ibadat", name: "Namaz & Ibadat", name_ur: "نماز و عبادت", name_ar: null, description: null, icon: "pray", parent_id: null, sort_order: 4, is_active: true },
  { id: "c5", slug: "islamic-history", name: "Islamic History", name_ur: "اسلامی تاریخ", name_ar: null, description: null, icon: "landmark", parent_id: null, sort_order: 5, is_active: true },
  { id: "c6", slug: "urdu-bayanaat", name: "Urdu Bayanaat", name_ur: "اردو بیانات", name_ar: null, description: null, icon: "mic", parent_id: null, sort_order: 6, is_active: true },
];

function baseItem(over: Partial<ContentItem>): ContentItem {
  return {
    id: over.id ?? `sample-${Math.random().toString(36).slice(2)}`,
    slug: over.slug ?? "sample",
    title: "[SAMPLE] Sample content",
    description: "Sample placeholder content for UI development. Replace with real content via the admin panel.",
    type: "video",
    scholar_id: "sample-scholar-1",
    category_id: "c1",
    language: "ur",
    status: "published",
    visibility: "public",
    is_featured: false,
    published_at: new Date().toISOString(),
    view_count: 1234,
    seo_title: null,
    seo_description: null,
    tags: ["sample"],
    copyright_note: null,
    created_at: new Date().toISOString(),
    scholar: { name: "[SAMPLE] Scholar Name", slug: "sample-scholar" },
    category: { name: "Quran & Tafseer", slug: "quran-tafseer" },
    ...over,
  };
}

export const SAMPLE_CONTENT: ContentItem[] = [
  baseItem({
    id: "sv1", slug: "sample-bayan-1", title: "[SAMPLE] Seerat-un-Nabi ﷺ — Introduction",
    type: "video", is_featured: true, view_count: 45210,
    videos: { content_item_id: "sv1", provider: "youtube", video_url: "https://www.youtube.com/watch?v=REPLACE_ME", thumbnail_url: null, duration_seconds: 3720, captions_url: null },
  }),
  baseItem({
    id: "sv2", slug: "sample-bayan-2", title: "[SAMPLE] Namaz ki Ahmiyat",
    type: "video", view_count: 18930, category_id: "c4",
    category: { name: "Namaz & Ibadat", slug: "namaz-ibadat" },
    videos: { content_item_id: "sv2", provider: "upload", video_url: null, thumbnail_url: null, duration_seconds: 2700, captions_url: null },
  }),
  baseItem({
    id: "sa1", slug: "sample-audio-1", title: "[SAMPLE] Dars-e-Quran (Audio)",
    type: "audio", is_featured: true, view_count: 9870,
    audio_tracks: { content_item_id: "sa1", audio_url: "", cover_url: null, duration_seconds: 3600, allow_download: false },
  }),
  baseItem({
    id: "sb1", slug: "sample-book-1", title: "[SAMPLE] Sample Islamic Book",
    type: "book", view_count: 5432,
    books: { content_item_id: "sb1", author: "[SAMPLE] Author", cover_url: null, file_url: null, file_format: "pdf", pages: 120, publisher: null, license_note: "Sample only — publish only public-domain or licensed books.", allow_download: false },
  }),
  baseItem({
    id: "sp1", slug: "sample-risala-1", title: "[SAMPLE] Monthly Risala — Issue 1",
    type: "publication", view_count: 2100,
    publications: { content_item_id: "sp1", issue_no: "1", pdf_url: null, cover_url: null, allow_download: false },
  }),
  baseItem({
    id: "sr1", slug: "sample-article-1", title: "[SAMPLE] The Importance of Sincerity",
    type: "article", language: "en", view_count: 1876,
    articles: { content_item_id: "sr1", body_html: "<p>Sample article body. Replace with verified, scholar-reviewed content.</p>", excerpt: "Sample article excerpt." },
  }),
];

export const SAMPLE_DUAS: Dua[] = [
  {
    id: "sd1", slug: "sample-dua-1", title: "Sample Dua — replace with verified text",
    arabic_text: null, transliteration: null, translation_ur: null, translation_en: null,
    source_reference: "SAMPLE — unverified placeholder for UI testing only",
    category: "General", is_verified: false, audio_url: null,
  },
];

export const SAMPLE_HADITH: Hadith[] = [
  {
    id: "sh1", collection: "SAMPLE COLLECTION — placeholder", book_name: null, chapter: null,
    hadith_number: null, arabic_text: null, translation_ur: null, translation_en: null,
    authenticity_grade: null, grade_source: null, is_verified: false,
  },
];

export const SAMPLE_SURAHS: Surah[] = [
  { number: 1, name_ar: "الفاتحة", name_en: "Al-Fatihah", name_ur: "الفاتحہ", total_ayahs: 7, revelation_type: "Makki" },
  { number: 2, name_ar: "البقرة", name_en: "Al-Baqarah", name_ur: "البقرہ", total_ayahs: 286, revelation_type: "Madani" },
  { number: 36, name_ar: "يس", name_en: "Ya-Sin", name_ur: "یٰس", total_ayahs: 83, revelation_type: "Makki" },
  { number: 112, name_ar: "الإخلاص", name_en: "Al-Ikhlas", name_ur: "الاخلاص", total_ayahs: 4, revelation_type: "Makki" },
  { number: 113, name_ar: "الفلق", name_en: "Al-Falaq", name_ur: "الفلق", total_ayahs: 5, revelation_type: "Makki" },
  { number: 114, name_ar: "الناس", name_en: "An-Nas", name_ur: "الناس", total_ayahs: 6, revelation_type: "Makki" },
];

export const SAMPLE_REMINDER: string =
  "Sample reminder: content shown here must be replaced with verified Islamic reminders before production.";
