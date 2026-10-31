import { ContinueList } from "@/components/dashboard/continue-list";
export const metadata = { title: "Continue Watching", robots: { index: false } };
export default function Page() { return <ContinueList kind="watch" />; }
