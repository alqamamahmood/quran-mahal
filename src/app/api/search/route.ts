import { NextResponse } from "next/server";
import { searchContent } from "@/lib/content";
import type { ContentType } from "@/lib/types";

/** GET /api/search?q=...&type=video — JSON search API (also powers future mobile apps). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type") as ContentType | null;
  if (q.trim().length < 2) {
    return NextResponse.json({ results: [], total: 0 });
  }
  try {
    const results = await searchContent(q, {
      type: type && ["video", "audio", "book", "publication", "article"].includes(type) ? type : undefined,
      limit: 20,
    });
    return NextResponse.json({
      results: results.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        type: r.type,
        scholar: r.scholar?.name ?? null,
        category: r.category?.name ?? null,
        view_count: r.view_count,
      })),
      total: results.length,
    });
  } catch (e) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
