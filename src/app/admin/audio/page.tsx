import { AdminContentList } from "@/components/admin/content-list";
export const metadata = { title: "Audio", robots: { index: false } };
export default function Page({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  return <AdminContentList type="audio" searchParams={searchParams} />;
}
