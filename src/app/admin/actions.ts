"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, getUser } from "@/lib/supabase/server";
import { requireStaff, requireAdmin, ADMIN_ROLES } from "@/lib/auth/roles";
import { slugify } from "@/lib/utils";

/** Write an audit log entry (best-effort, never blocks the action). */
async function audit(action: string, entityType: string, entityId?: string, details?: Record<string, unknown>) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert({
      actor_id: user?.id ?? null,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      details: details ?? null,
    });
  } catch { /* audit is best-effort */ }
}

async function staffClient() {
  await requireStaff();
  return createClient();
}

/* ---------- Content ---------- */

const contentSchema = z.object({
  title: z.string().min(3).max(200),
  type: z.enum(["video", "audio", "book", "publication", "article"]),
  description: z.string().max(5000).optional(),
  scholar_id: z.string().uuid().optional().or(z.literal("")),
  category_id: z.string().uuid().optional().or(z.literal("")),
  language: z.enum(["ur", "en", "ar", "roman"]),
  status: z.enum(["draft", "scheduled", "published", "archived"]),
  visibility: z.enum(["public", "premium", "private"]),
  is_featured: z.string().optional(),
  tags: z.string().optional(),
  copyright_note: z.string().max(500).optional(),
  seo_title: z.string().max(200).optional(),
  seo_description: z.string().max(300).optional(),
  // type-specific
  video_provider: z.enum(["youtube", "upload", "external"]).optional(),
  video_url: z.string().max(2000).optional(),
  thumbnail_url: z.string().max(2000).optional(),
  duration_seconds: z.coerce.number().int().min(0).optional(),
  audio_url: z.string().max(2000).optional(),
  cover_url: z.string().max(2000).optional(),
  allow_download: z.string().optional(),
  author: z.string().max(200).optional(),
  file_url: z.string().max(2000).optional(),
  file_format: z.enum(["pdf", "epub", "html", "other"]).optional(),
  pages: z.coerce.number().int().min(0).optional(),
  issue_no: z.string().max(50).optional(),
  pdf_url: z.string().max(2000).optional(),
  body_html: z.string().max(200000).optional(),
  excerpt: z.string().max(500).optional(),
});

export async function createContent(formData: FormData) {
  const supabase = await staffClient();
  const { data: { user } } = await supabase.auth.getUser();
  const raw = Object.fromEntries(formData.entries());
  const parsed = contentSchema.safeParse(raw);
  if (!parsed.success) redirect("/admin/content/new?error=" + encodeURIComponent("Validation failed: " + parsed.error.issues[0]?.message));

  const v = parsed.data;
  const slugBase = slugify(v.title) || "item";
  const slug = `${slugBase}-${Date.now().toString(36)}`;

  const { data: item, error } = await supabase
    .from("content_items")
    .insert({
      slug,
      title: v.title,
      description: v.description || null,
      type: v.type,
      scholar_id: v.scholar_id || null,
      category_id: v.category_id || null,
      language: v.language,
      status: v.status,
      visibility: v.visibility,
      is_featured: v.is_featured === "on",
      published_at: v.status === "published" ? new Date().toISOString() : null,
      tags: v.tags ? v.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      copyright_note: v.copyright_note || null,
      seo_title: v.seo_title || null,
      seo_description: v.seo_description || null,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !item) redirect("/admin/content/new?error=" + encodeURIComponent(error?.message ?? "Insert failed"));
  const id = item.id as string;

  // Type-specific detail row
  if (v.type === "video") {
    await supabase.from("videos").insert({
      content_item_id: id,
      provider: v.video_provider ?? "youtube",
      video_url: v.video_url || null,
      thumbnail_url: v.thumbnail_url || v.cover_url || null,
      duration_seconds: v.duration_seconds || null,
    });
  } else if (v.type === "audio") {
    if (!v.audio_url) {
      await supabase.from("content_items").delete().eq("id", id);
      redirect("/admin/content/new?error=" + encodeURIComponent("Audio URL required"));
    }
    await supabase.from("audio_tracks").insert({
      content_item_id: id,
      audio_url: v.audio_url,
      cover_url: v.cover_url || null,
      duration_seconds: v.duration_seconds || null,
      allow_download: v.allow_download === "on",
    });
  } else if (v.type === "book") {
    await supabase.from("books").insert({
      content_item_id: id,
      author: v.author || null,
      cover_url: v.cover_url || null,
      file_url: v.file_url || null,
      file_format: v.file_format ?? null,
      pages: v.pages || null,
      allow_download: v.allow_download === "on",
    });
  } else if (v.type === "publication") {
    await supabase.from("publications").insert({
      content_item_id: id,
      issue_no: v.issue_no || null,
      pdf_url: v.pdf_url || null,
      cover_url: v.cover_url || null,
      allow_download: v.allow_download === "on",
    });
  } else {
    await supabase.from("articles").insert({
      content_item_id: id,
      body_html: v.body_html || null,
      excerpt: v.excerpt || null,
    });
  }

  await audit("content.create", "content_items", id, { title: v.title, type: v.type });
  revalidatePath("/admin/content");
  redirect("/admin/content?created=1");
}

export async function toggleContentStatus(formData: FormData) {
  const supabase = await staffClient();
  const id = String(formData.get("id"));
  const field = String(formData.get("field")); // status | is_featured
  const { data: item } = await supabase.from("content_items").select("status, is_featured, published_at").eq("id", id).single();
  if (!item) return;
  const patch =
    field === "status"
      ? { status: item.status === "published" ? "archived" : "published", published_at: item.status === "published" ? item.published_at : new Date().toISOString() }
      : { is_featured: !item.is_featured };
  await supabase.from("content_items").update(patch).eq("id", id);
  await audit(`content.${field}.toggle`, "content_items", id, patch);
  revalidatePath("/admin/content");
}

export async function deleteContent(formData: FormData) {
  const supabase = await staffClient();
  const id = String(formData.get("id"));
  await supabase.from("content_items").delete().eq("id", id);
  await audit("content.delete", "content_items", id);
  revalidatePath("/admin/content");
}

/* ---------- Categories ---------- */

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(100),
  name_ur: z.string().max(100).optional(),
  slug: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.string().optional(),
});

export async function upsertCategory(formData: FormData) {
  const supabase = await staffClient();
  const parsed = categorySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/admin/categories?error=" + encodeURIComponent("Validation failed"));
  const v = parsed.data;
  const payload = {
    name: v.name,
    name_ur: v.name_ur || null,
    slug: v.slug || slugify(v.name),
    description: v.description || null,
    sort_order: v.sort_order,
    is_active: v.is_active === "on",
  };
  if (v.id) {
    await supabase.from("categories").update(payload).eq("id", v.id);
    await audit("category.update", "categories", v.id, { name: v.name });
  } else {
    const { data } = await supabase.from("categories").insert(payload).select("id").single();
    await audit("category.create", "categories", data?.id, { name: v.name });
  }
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  const supabase = await staffClient();
  const id = String(formData.get("id"));
  await supabase.from("categories").delete().eq("id", id);
  await audit("category.delete", "categories", id);
  revalidatePath("/admin/categories");
}

/* ---------- Scholars ---------- */

const scholarSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(150),
  name_ur: z.string().max(150).optional(),
  bio: z.string().max(3000).optional(),
  photo_url: z.string().max(2000).optional(),
  photo_permission_note: z.string().max(500).optional(),
  languages: z.string().optional(),
  subjects: z.string().optional(),
  status: z.enum(["active", "hidden"]),
});

export async function upsertScholar(formData: FormData) {
  const supabase = await staffClient();
  const { data: { user } } = await supabase.auth.getUser();
  const parsed = scholarSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/admin/scholars?error=" + encodeURIComponent("Validation failed"));
  const v = parsed.data;
  const payload = {
    name: v.name,
    name_ur: v.name_ur || null,
    slug: slugify(v.name) + "-" + Date.now().toString(36),
    bio: v.bio || null,
    photo_url: v.photo_url || null,
    photo_permission_note: v.photo_permission_note || null,
    languages: v.languages ? v.languages.split(",").map((s) => s.trim()).filter(Boolean) : [],
    subjects: v.subjects ? v.subjects.split(",").map((s) => s.trim()).filter(Boolean) : [],
    status: v.status,
    created_by: user?.id ?? null,
  };
  if (v.id) {
    const { slug: _s, created_by: _c, ...rest } = payload;
    await supabase.from("scholars").update(rest).eq("id", v.id);
    await audit("scholar.update", "scholars", v.id, { name: v.name });
  } else {
    const { data } = await supabase.from("scholars").insert(payload).select("id").single();
    await audit("scholar.create", "scholars", data?.id, { name: v.name });
  }
  revalidatePath("/admin/scholars");
  redirect("/admin/scholars");
}

export async function deleteScholar(formData: FormData) {
  const supabase = await staffClient();
  const id = String(formData.get("id"));
  await supabase.from("scholars").delete().eq("id", id);
  await audit("scholar.delete", "scholars", id);
  revalidatePath("/admin/scholars");
}

/* ---------- Users ---------- */

export async function setUserSuspended(formData: FormData) {
  const supabase = await staffClient();
  const userId = String(formData.get("user_id"));
  const suspend = String(formData.get("suspend")) === "1";
  // Suspend = ban via auth admin would need service role; here we record in audit
  // and rely on app-level check. Documented in docs.
  await audit(suspend ? "user.suspend" : "user.reactivate", "profiles", userId);
  revalidatePath("/admin/users");
}

export async function grantRole(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = String(formData.get("user_id"));
  const roleName = String(formData.get("role"));
  if (!(ADMIN_ROLES as string[]).concat(["content_manager", "editor", "user"]).includes(roleName)) return;
  const { data: role } = await supabase.from("roles").select("id").eq("name", roleName).single();
  if (!role) return;
  // Only super_admin may grant administrator/super_administrator
  const myRoles = (
    (await supabase.from("user_roles").select("roles(name)").eq("user_id", user!.id)).data ?? []
  ) as unknown as Array<{ roles: { name: string } | null }>;
  const roleNames = myRoles.map((r) => r.roles?.name);
  if (["administrator", "super_administrator"].includes(roleName) && !roleNames.includes("super_administrator")) return;
  await supabase.from("user_roles").upsert({ user_id: userId, role_id: role.id, granted_by: user!.id });
  await audit("role.grant", "user_roles", userId, { role: roleName });
  revalidatePath("/admin/users");
}

/* ---------- Membership plans ---------- */

const planSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(100),
  slug: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  price: z.coerce.number().min(0),
  currency: z.string().max(10).default("PKR"),
  duration_days: z.coerce.number().int().min(0),
  trial_days: z.coerce.number().int().min(0).default(0),
  features: z.string().optional(),
  is_active: z.string().optional(),
  sort_order: z.coerce.number().int().default(0),
});

export async function upsertPlan(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const parsed = planSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/admin/memberships?error=" + encodeURIComponent("Validation failed"));
  const v = parsed.data;
  const payload = {
    name: v.name,
    slug: v.slug || slugify(v.name),
    description: v.description || null,
    price: v.price,
    currency: v.currency,
    duration_days: v.duration_days,
    trial_days: v.trial_days,
    features: v.features ? v.features.split("\n").map((s) => s.trim()).filter(Boolean) : [],
    is_active: v.is_active === "on",
    sort_order: v.sort_order,
  };
  if (v.id) {
    await supabase.from("membership_plans").update(payload).eq("id", v.id);
    await audit("plan.update", "membership_plans", v.id, { name: v.name });
  } else {
    const { data } = await supabase.from("membership_plans").insert(payload).select("id").single();
    await audit("plan.create", "membership_plans", data?.id, { name: v.name });
  }
  revalidatePath("/admin/memberships");
  revalidatePath("/pricing");
  redirect("/admin/memberships");
}

/* ---------- Settings / SEO ---------- */

export async function saveSetting(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const key = String(formData.get("key"));
  const value = String(formData.get("value"));
  if (!/^[a-z0-9_.]+$/i.test(key)) return;
  let parsed: unknown = value;
  try { parsed = JSON.parse(value); } catch { /* store as string */ }
  await supabase.from("platform_settings").upsert({ key, value: parsed, updated_by: user?.id ?? null });
  await audit("settings.update", "platform_settings", key);
  revalidatePath("/admin/settings");
  revalidatePath("/admin/seo");
}

/* ---------- Reports ---------- */

export async function reviewReport(formData: FormData) {
  const supabase = await staffClient();
  const { data: { user } } = await supabase.auth.getUser();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["reviewed", "resolved", "dismissed"].includes(status)) return;
  await supabase.from("reports").update({ status, reviewed_by: user?.id ?? null, reviewed_at: new Date().toISOString() }).eq("id", id);
  await audit("report.review", "reports", id, { status });
  revalidatePath("/admin/reports");
}
