import { createClient, getUser, isSupabaseConfigured } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { updateProfile } from "./actions";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Account Settings", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const d = await getDictionary();
  const user = await getUser();
  let profile = { display_name: "", language_pref: "ur", theme_pref: "light" };

  if (isSupabaseConfigured() && user) {
    const supabase = await createClient();
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (data) {
      profile = {
        display_name: data.display_name ?? user.user_metadata?.display_name ?? "",
        language_pref: data.language_pref ?? "ur",
        theme_pref: data.theme_pref ?? "light",
      };
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-extrabold text-brand-950 dark:text-white">{d.t("dash.settings.title")}</h1>
      {saved && <p className="mt-3 rounded-xl bg-brand-50 p-3 text-sm font-semibold text-brand-800">{d.t("dash.settings.saved")}</p>}
      <Card className="mt-4">
        <CardBody>
          <form action={updateProfile} className="space-y-4">
            <Input name="display_name" label={d.t("dash.settings.name")} defaultValue={profile.display_name} />
            <div>
              <label className="mb-1.5 block text-sm font-semibold">{d.t("dash.settings.email")}</label>
              <input value={user?.email ?? ""} disabled dir="ltr" className="h-11 w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-4 opacity-70" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-semibold">{d.t("dash.settings.language")}
                <select name="language" defaultValue={profile.language_pref} className="mt-1 h-11 w-full rounded-xl border border-neutral-300 dark:border-white/15 bg-white dark:bg-neutral-900 px-3">
                  <option value="ur">اردو</option>
                  <option value="roman">Roman Urdu</option>
                  <option value="en">English</option>
                </select>
              </label>
              <label className="block text-sm font-semibold">{d.t("dash.settings.theme")}
                <select name="theme" defaultValue={profile.theme_pref} className="mt-1 h-11 w-full rounded-xl border border-neutral-300 dark:border-white/15 bg-white dark:bg-neutral-900 px-3">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </label>
            </div>
            <Button type="submit">{d.t("dash.settings.saveBtn")}</Button>
          </form>
        </CardBody>
      </Card>
      <Card className="mt-4">
        <CardBody>
          <h2 className="font-bold text-red-700">{d.t("dash.settings.pwTitle")}</h2>
          <p className="mt-1 text-sm text-neutral-500">{d.t("dash.settings.pwDesc")}</p>
          <a href="/forgot-password" className="mt-3 inline-flex h-10 items-center rounded-xl border border-red-200 px-4 text-sm font-bold text-red-700">{d.t("dash.settings.pwLink")}</a>
        </CardBody>
      </Card>
    </div>
  );
}
