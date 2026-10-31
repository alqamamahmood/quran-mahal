import { AdminContentList } from "@/components/admin/content-list";
export const metadata = { title: "Content", robots: { index: false } };
export default function Page({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  return <AdminContentList searchParams={searchParams} />;
}
