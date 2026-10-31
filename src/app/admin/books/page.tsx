import { AdminContentList } from "@/components/admin/content-list";
export const metadata = { title: "Books", robots: { index: false } };
export default function Page({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  return <AdminContentList type="book" searchParams={searchParams} />;
}
