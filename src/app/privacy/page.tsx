import { PrivacyPage } from "../(static)/pages";
import { getDictionary } from "@/lib/i18n/server";

export async function generateMetadata() {
  const d = await getDictionary();
  return { title: d.t("static.privacy.title") };
}

export default async function Page() {
  const d = await getDictionary();
  return <PrivacyPage d={d} />;
}
