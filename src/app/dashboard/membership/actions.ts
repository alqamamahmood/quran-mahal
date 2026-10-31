"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function cancelSubscription(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const uid = user?.id;
  if (!uid) redirect("/login");
  const subId = String(formData.get("sub_id") ?? "");
  // Mark cancelled locally; Stripe subscription cancellation happens via
  // dashboard or the customer portal once STRIPE_SECRET_KEY is configured.
  await supabase.from("subscriptions").update({ status: "cancelled" }).eq("id", subId).eq("user_id", uid);
  await supabase.from("audit_logs").insert({ actor_id: uid, action: "subscription.cancel", entity_type: "subscription", entity_id: subId });
  redirect("/dashboard/membership?cancelled=1");
}
