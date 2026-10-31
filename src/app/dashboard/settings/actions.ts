"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const displayName = String(formData.get("display_name") ?? "");
  const language = String(formData.get("language") ?? "ur");
  const theme = String(formData.get("theme") ?? "light");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.auth.updateUser({ data: { display_name: displayName } });
  await supabase
    .from("profiles")
    .update({
      display_name: displayName || null,
      language_pref: ["en", "ur", "roman"].includes(language) ? language : "ur",
      theme_pref: theme === "dark" ? "dark" : "light",
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?saved=1");
}
