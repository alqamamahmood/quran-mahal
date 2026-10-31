import { AdminContentList } from "@/components/admin/content-list";
export const metadata = { title: "Rasail", robots: { index: false } };
export default function Page({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  return <AdminContentList type="publication" searchParams={searchParams} />;
}
