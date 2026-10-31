import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { saveSetting } from "../actions";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Platform Settings", robots: { index: false } };
export const dynamic = "force-dynamic";

const FIELDS = [
  { key: "site_name", label: "Platform name" },
  { key: "tagline", label: "Tagline" },
  { key: "contact_email", label: "Contact email" },
  { key: "social.youtube", label: "YouTube URL" },
  { key: "social.facebook", label: "Facebook URL" },
  { key: "social.instagram", label: "Instagram URL" },
  { key: "social.x", label: "X (Twitter) URL" },
  { key: "homepage.reminder", label: "Daily reminder text" },
  { key: "maintenance.enabled", label: "Maintenance mode (true/false)" },
];

export default async function SettingsPage() {
  const d = await getDictionary();
  const values: Record<string, string> = {};
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.from("platform_settings").select("key, value");
      for (const row of (data ?? []) as Array<{ key: string; value: unknown }>) {
        values[row.key] = typeof row.value === "string" ? row.value : JSON.stringify(row.value ?? "");
      }
    } catch { /* empty */ }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{d.t("admin.set.title")}</h1>
      <p className="mt-1 text-sm text-neutral-500">{d.t("admin.set.subtitle")}</p>
      <Card className="mt-4"><CardBody className="space-y-5">
        {FIELDS.map((f) => (
          <form key={f.key} action={saveSetting} className="space-y-2">
            <input type="hidden" name="key" value={f.key} />
            <Input name="value" label={f.label} dir="ltr" defaultValue={values[f.key] ?? ""} />
            <Button type="submit" size="sm" variant="secondary">Save</Button>
          </form>
        ))}
      </CardBody></Card>
      <Card className="mt-4"><CardBody>
        <h2 className="font-bold text-sm">{d.t("admin.set.customTitle")}</h2>
        <form action={saveSetting} className="mt-2 grid sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
          <Input name="key" label={d.t("admin.set.key")} dir="ltr" placeholder="section.key" required pattern="[a-z0-9_.]+" />
          <Input name="value" label="Value (JSON ok)" dir="ltr" />
          <Button type="submit" size="sm">{d.t("admin.set.add")}</Button>
        </form>
      </CardBody></Card>
    </div>
  );
}
