import { ContinueList } from "@/components/dashboard/continue-list";
export const metadata = { title: "Continue Listening", robots: { index: false } };
export default function Page() { return <ContinueList kind="listen" />; }
