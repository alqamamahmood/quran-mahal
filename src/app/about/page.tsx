import { AboutPage } from "../(static)/pages";
import { getDictionary } from "@/lib/i18n/server";

export async function generateMetadata() {
  const d = await getDictionary();
  return { title: d.t("static.about.title") };
}

export default async function Page() {
  const d = await getDictionary();
  return <AboutPage d={d} />;
}
