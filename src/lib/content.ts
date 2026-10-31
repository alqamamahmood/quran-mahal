import { createClient, isSupabaseConfigured } from "./supabase/server";
import type {
  Category,
  ContentItem,
  ContentType,
  Dua,
  Hadith,
  Scholar,
  Surah,
} from "./types";
import {
  SAMPLE_CATEGORIES,
  SAMPLE_CONTENT,
  SAMPLE_DUAS,
  SAMPLE_HADITH,
  SAMPLE_SCHOLARS,
  SAMPLE_SURAHS,
} from "./sample-data";

const ITEM_SELECT = `
  *,
  scholar:scholars(name, slug),
  category:categories(name, slug)
`;

const DETAIL_SELECT: Record<ContentType, string> = {
  video: "videos(*)",
  audio: "audio_tracks(*)",
  book: "books(*)",
  publication: "publications(*)",
  article: "articles(*)",
};

function sampleByType(type: ContentType): ContentItem[] {
  return SAMPLE_CONTENT.filter((c) => c.type === type);
}

function sampleOne(slug: string): ContentItem | null {
  return SAMPLE_CONTENT.find((c) => c.slug === slug) ?? null;
}

export async function getFeatured(limit = 1): Promise<ContentItem[]> {
  if (!isSupabaseConfigured()) return SAMPLE_CONTENT.filter((c) => c.is_featured).slice(0, limit);
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_items")
    .select(ITEM_SELECT)
    .eq("status", "published")
    .eq("visibility", "public")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as ContentItem[];
}

export async function getRecent(type: ContentType, limit = 8): Promise<ContentItem[]> {
  if (!isSupabaseConfigured()) return sampleByType(type).slice(0, limit);
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_items")
    .select(`${ITEM_SELECT}, ${DETAIL_SELECT[type]}`)
    .eq("status", "published")
    .eq("visibility", "public")
    .eq("type", type)
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as ContentItem[];
}

export async function getPopular(type: ContentType, limit = 8): Promise<ContentItem[]> {
  if (!isSupabaseConfigured())
    return [...sampleByType(type)].sort((a, b) => b.view_count - a.view_count).slice(0, limit);
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_items")
    .select(`${ITEM_SELECT}, ${DETAIL_SELECT[type]}`)
    .eq("status", "published")
    .eq("visibility", "public")
    .eq("type", type)
    .order("view_count", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as ContentItem[];
}

export async function getLibrary(
  type: ContentType,
  opts: { category?: string; lang?: string; q?: string; page?: number; perPage?: number } = {}
): Promise<{ items: ContentItem[]; total: number }> {
  const { category, lang, q, page = 1, perPage = 12 } = opts;
  if (!isSupabaseConfigured()) {
    let items = sampleByType(type);
    if (q) items = items.filter((i) => i.title.toLowerCase().includes(q.toLowerCase()));
    return { items, total: items.length };
  }
  const supabase = await createClient();
  let query = supabase
    .from("content_items")
    .select(`${ITEM_SELECT}, ${DETAIL_SELECT[type]}, count:count`, { count: "exact" })
    .eq("status", "published")
    .eq("visibility", "public")
    .eq("type", type)
    .order("published_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);
  if (category) query = query.eq("category.slug" as never, category);
  if (lang) query = query.eq("language", lang);
  if (q) query = query.ilike("title", `%${q}%`);
  const { data, count } = await query;
  return { items: (data ?? []) as unknown as ContentItem[], total: count ?? 0 };
}

export async function getContentBySlug(slug: string): Promise<ContentItem | null> {
  if (!isSupabaseConfigured()) return sampleOne(slug);
  const supabase = await createClient();
  const { data: item } = await supabase
    .from("content_items")
    .select(ITEM_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (!item) return null;
  const typed = item as ContentItem;
  const detailTable =
    typed.type === "video" ? "videos"
    : typed.type === "audio" ? "audio_tracks"
    : typed.type === "book" ? "books"
    : typed.type === "publication" ? "publications"
    : "articles";
  const { data: detail } = await supabase
    .from(detailTable)
    .select("*")
    .eq("content_item_id", typed.id)
    .single();
  const key =
    typed.type === "video" ? "videos"
    : typed.type === "audio" ? "audio_tracks"
    : typed.type === "book" ? "books"
    : typed.type === "publication" ? "publications"
    : "articles";
  return { ...typed, [key]: detail } as ContentItem;
}

export async function getRelated(item: ContentItem, limit = 6): Promise<ContentItem[]> {
  if (!isSupabaseConfigured())
    return SAMPLE_CONTENT.filter((c) => c.type === item.type && c.id !== item.id).slice(0, limit);
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_items")
    .select(ITEM_SELECT)
    .eq("status", "published")
    .eq("visibility", "public")
    .eq("type", item.type)
    .neq("id", item.id)
    .order("view_count", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as ContentItem[];
}

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return SAMPLE_CATEGORIES;
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []) as Category[];
}

export async function getScholars(limit = 12): Promise<Scholar[]> {
  if (!isSupabaseConfigured()) return SAMPLE_SCHOLARS.slice(0, limit);
  const supabase = await createClient();
  const { data } = await supabase
    .from("scholars")
    .select("*")
    .eq("status", "active")
    .order("name")
    .limit(limit);
  return (data ?? []) as Scholar[];
}

export async function getScholarBySlug(slug: string): Promise<Scholar | null> {
  if (!isSupabaseConfigured()) return SAMPLE_SCHOLARS.find((s) => s.slug === slug) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("scholars").select("*").eq("slug", slug).single();
  return (data ?? null) as unknown as Scholar | null;
}

export async function getScholarContent(scholarId: string, limit = 12): Promise<ContentItem[]> {
  if (!isSupabaseConfigured())
    return SAMPLE_CONTENT.filter((c) => c.scholar_id === scholarId).slice(0, limit);
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_items")
    .select(ITEM_SELECT)
    .eq("scholar_id", scholarId)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as ContentItem[];
}

export async function searchContent(
  q: string,
  opts: { type?: ContentType; category?: string; lang?: string; limit?: number } = {}
): Promise<ContentItem[]> {
  const { type, lang, limit = 20 } = opts;
  if (!isSupabaseConfigured() || q.trim().length < 2) {
    if (!isSupabaseConfigured() && q.trim().length >= 2)
      return SAMPLE_CONTENT.filter((c) =>
        c.title.toLowerCase().includes(q.toLowerCase())
      ).slice(0, limit);
    return [];
  }
  const supabase = await createClient();
  let query = supabase
    .from("content_items")
    .select(ITEM_SELECT)
    .eq("status", "published")
    .eq("visibility", "public")
    .ilike("title", `%${q}%`)
    .order("view_count", { ascending: false })
    .limit(limit);
  if (type) query = query.eq("type", type);
  if (lang) query = query.eq("language", lang);
  const { data } = await query;
  return (data ?? []) as unknown as ContentItem[];
}

export async function getDuas(limit = 24): Promise<Dua[]> {
  if (!isSupabaseConfigured()) return SAMPLE_DUAS.slice(0, limit);
  const supabase = await createClient();
  const { data } = await supabase
    .from("duas")
    .select("*")
    .eq("status", "published")
    .order("title")
    .limit(limit);
  return (data ?? []) as Dua[];
}

export async function getHadith(limit = 24): Promise<Hadith[]> {
  if (!isSupabaseConfigured()) return SAMPLE_HADITH.slice(0, limit);
  const supabase = await createClient();
  const { data } = await supabase
    .from("hadith")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Hadith[];
}

export async function getSurahs(): Promise<Surah[]> {
  if (!isSupabaseConfigured()) return SAMPLE_SURAHS;
  const supabase = await createClient();
  const { data } = await supabase.from("surahs").select("*").order("number");
  return ((data ?? []) as Surah[]).length ? (data as Surah[]) : SAMPLE_SURAHS;
}

/** Increment view counter (fire-and-forget; uses a staff-safe RPC or direct update). */
export async function recordView(contentId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = await createClient();
    await supabase.rpc("increment_view_count", { content_id: contentId });
  } catch {
    /* view counting is best-effort */
  }
}
