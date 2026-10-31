import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { saveSetting } from "../actions";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "SEO Settings", robots: { index: false } };
export const dynamic = "force-dynamic";

const SEO_KEYS = [
  { key: "seo.default_title", label: "Default site title", hint: "Quran Mahal — Islamic Media & Learning" },
  { key: "seo.default_description", label: "Default meta description", hint: "150–160 characters" },
  { key: "seo.og_image", label: "Default OG image URL", hint: "https://…/og.jpg" },
  { key: "seo.twitter_handle", label: "Twitter/X handle", hint: "@quranmahal" },
];

export default async function SeoPage() {
  const d = await getDictionary();
  const values: Record<string, string> = {};
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.from("platform_settings").select("key, value").in("key", SEO_KEYS.map((k) => k.key));
      for (const row of (data ?? []) as Array<{ key: string; value: unknown }>) {
        values[row.key] = typeof row.value === "string" ? row.value : JSON.stringify(row.value ?? "");
      }
    } catch { /* empty */ }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{d.t("admin.seo.title")}</h1>
      <p className="mt-1 text-sm text-neutral-500">{d.t("admin.seo.subtitle")}</p>
      <Card className="mt-4"><CardBody className="space-y-5">
        {SEO_KEYS.map((k) => (
          <form key={k.key} action={saveSetting} className="space-y-2">
            <input type="hidden" name="key" value={k.key} />
            <Input name="value" label={k.label} dir="ltr" defaultValue={values[k.key] ?? ""} placeholder={k.hint} />
            <Button type="submit" size="sm" variant="secondary">{d.t("common.save")}</Button>
          </form>
        ))}
      </CardBody></Card>
      <Card className="mt-4"><CardBody>
        <h2 className="font-bold text-sm">{d.t("admin.seo.sitemapTitle")}</h2>
        <ul className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
          <li>{d.t("admin.seo.sitemapItems")}</li>
        </ul>
      </CardBody></Card>
    </div>
  );
}
