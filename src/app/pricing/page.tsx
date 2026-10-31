import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MembershipPlan } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Premium Membership" };
export const revalidate = 300;

const FALLBACK_PLANS: MembershipPlan[] = [
  { id: "p1", slug: "free", name: "Free", description: "Tamaam public muft mawaad", price: 0, currency: "PKR", duration_days: 0, is_active: true, features: ["Public videos", "Audio lectures", "Books & rasail"], trial_days: 0, sort_order: 1 },
  { id: "p2", slug: "premium-monthly", name: "Premium Monthly", description: "Premium mawaad + offline", price: 499, currency: "PKR", duration_days: 30, is_active: true, features: ["Sab kuch jo Free mein", "Premium bayanaat", "Offline downloads"], trial_days: 0, sort_order: 2 },
  { id: "p3", slug: "premium-yearly", name: "Premium Yearly", description: "Saara premium, behtareen qeemat", price: 4999, currency: "PKR", duration_days: 365, is_active: true, features: ["Sab kuch jo Monthly mein", "2 mahine muft"], trial_days: 0, sort_order: 3 },
];

export default async function PricingPage() {
  const d = await getDictionary();
  let plans: MembershipPlan[] = FALLBACK_PLANS;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("membership_plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (data?.length) plans = data as MembershipPlan[];
    } catch { /* fallback */ }
  }

  const paymentsLive = Boolean(process.env.STRIPE_SECRET_KEY);

  return (
    <div className="pt-6">
      <div className="text-center max-w-2xl mx-auto">
        <Badge tone="gold">{d.t("pricing.badge")}</Badge>
        <h1 className="mt-2 text-3xl font-extrabold text-brand-950 dark:text-white">{d.t("pricing.title")}</h1>
        <p className="mt-2 text-sm text-neutral-500">
          {d.t("pricing.subtitle")}
        </p>
        {!paymentsLive && (
          <p className="mt-3 rounded-xl border border-dashed border-gold-500/60 bg-gold-100/40 px-4 py-2 text-xs text-yellow-900 dark:text-gold-300">
            {d.t("pricing.noPayments")}
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.id} className={p.slug.includes("yearly") ? "ring-2 ring-gold-500" : ""}>
            <CardBody>
              <h2 className="text-xl font-extrabold">{p.name}</h2>
              {p.description && <p className="mt-1 text-sm text-neutral-500">{p.description}</p>}
              <p className="mt-4 text-3xl font-extrabold text-brand-800 dark:text-brand-200">
                {p.price === 0 ? d.t("pricing.free") : `${p.currency} ${Number(p.price).toLocaleString()}`}
                {p.price > 0 && <span className="text-sm font-medium text-neutral-500">{p.duration_days >= 365 ? d.t("pricing.perYear") : d.t("pricing.perMonth")}</span>}
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {p.features.map((f, i) => (
                  <li key={i} className="flex gap-2"><span aria-hidden className="text-brand-600">✓</span>{f}</li>
                ))}
              </ul>
              {p.price > 0 ? (
                <Link
                  href={paymentsLive ? `/dashboard/membership?plan=${p.slug}` : "/contact"}
                  className="mt-6 flex h-11 items-center justify-center rounded-xl bg-brand-700 font-bold text-white hover:bg-brand-800"
                >
                  {paymentsLive ? d.t("pricing.upgrade") : d.t("pricing.contactUs")}
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="mt-6 flex h-11 items-center justify-center rounded-xl border border-brand-300 font-bold text-brand-800 hover:bg-brand-50"
                >
                  {d.t("pricing.startFree")}
                </Link>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
