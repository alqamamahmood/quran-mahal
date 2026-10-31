/** Hand-written database types mirroring supabase/migrations/20261031000001_schema.sql */

export type ContentType = "video" | "audio" | "book" | "publication" | "article";
export type ContentStatus = "draft" | "scheduled" | "published" | "archived";
export type Visibility = "public" | "premium" | "private";
export type Language = "ur" | "en" | "ar" | "roman";
export type UiLanguage = "en" | "ur" | "roman";
export type VideoProvider = "youtube" | "upload" | "external";
export type RoleName =
  | "super_administrator"
  | "administrator"
  | "content_manager"
  | "editor"
  | "user";

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  language_pref: UiLanguage;
  theme_pref: "light" | "dark";
  created_at: string;
  updated_at: string;
}

export interface Scholar {
  id: string;
  slug: string;
  name: string;
  name_ur: string | null;
  bio: string | null;
  photo_url: string | null;
  photo_permission_note: string | null;
  languages: string[];
  subjects: string[];
  status: "active" | "hidden";
  created_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  name_ur: string | null;
  name_ar: string | null;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface ContentItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: ContentType;
  scholar_id: string | null;
  category_id: string | null;
  language: Language;
  status: ContentStatus;
  visibility: Visibility;
  is_featured: boolean;
  published_at: string | null;
  view_count: number;
  seo_title: string | null;
  seo_description: string | null;
  tags: string[];
  copyright_note: string | null;
  created_at: string;
  scholar?: Pick<Scholar, "name" | "slug"> | null;
  category?: Pick<Category, "name" | "slug"> | null;
  videos?: VideoDetail | null;
  audio_tracks?: AudioDetail | null;
  books?: BookDetail | null;
  publications?: PublicationDetail | null;
  articles?: ArticleDetail | null;
}

export interface VideoDetail {
  content_item_id: string;
  provider: VideoProvider;
  video_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  captions_url: string | null;
}

export interface AudioDetail {
  content_item_id: string;
  audio_url: string;
  cover_url: string | null;
  duration_seconds: number | null;
  allow_download: boolean;
}

export interface BookDetail {
  content_item_id: string;
  author: string | null;
  cover_url: string | null;
  file_url: string | null;
  file_format: "pdf" | "epub" | "html" | "other" | null;
  pages: number | null;
  publisher: string | null;
  license_note: string | null;
  allow_download: boolean;
}

export interface PublicationDetail {
  content_item_id: string;
  issue_no: string | null;
  pdf_url: string | null;
  cover_url: string | null;
  allow_download: boolean;
}

export interface ArticleDetail {
  content_item_id: string;
  body_html: string | null;
  excerpt: string | null;
}

export interface MembershipPlan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  duration_days: number;
  is_active: boolean;
  features: string[];
  trial_days: number;
  sort_order: number;
}

export interface Dua {
  id: string;
  slug: string;
  title: string;
  arabic_text: string | null;
  transliteration: string | null;
  translation_ur: string | null;
  translation_en: string | null;
  source_reference: string | null;
  category: string | null;
  is_verified: boolean;
  audio_url: string | null;
}

export interface Hadith {
  id: string;
  collection: string;
  book_name: string | null;
  chapter: string | null;
  hadith_number: string | null;
  arabic_text: string | null;
  translation_ur: string | null;
  translation_en: string | null;
  authenticity_grade: string | null;
  grade_source: string | null;
  is_verified: boolean;
}

export interface Surah {
  number: number;
  name_ar: string;
  name_en: string;
  name_ur: string | null;
  total_ayahs: number;
  revelation_type: "Makki" | "Madani";
}
