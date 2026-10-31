import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/webhooks/stripe
 * Verified Stripe webhook → updates subscriptions + payment_records via the
 * service-role client (bypasses RLS; never exposed to the browser).
 *
 * REQUIRED ENV: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
 * Without them this route returns 503 and NO payment is marked successful —
 * we never fake a successful payment.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !webhookSecret) {
    return NextResponse.json(
      { error: "Payments not configured. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET." },
      { status: 503 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const rawBody = await req.text();

  let stripe: typeof import("stripe").default.prototype;
  try {
    const Stripe = (await import("stripe")).default;
    const client = new Stripe(secret);
    const event = client.webhooks.constructEvent(rawBody, sig, webhookSecret);
    stripe = client as never;

    const supabase = createServiceClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          id: string;
          metadata?: { user_id?: string; plan_id?: string };
          subscription?: string;
          amount_total?: number;
          currency?: string;
        };
        const userId = session.metadata?.user_id;
        const planId = session.metadata?.plan_id;
        if (!userId || !planId) break;

        const { data: plan } = await supabase
          .from("membership_plans")
          .select("duration_days")
          .eq("id", planId)
          .single();

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (plan?.duration_days ?? 30));

        const { data: sub } = await supabase
          .from("subscriptions")
          .insert({
            user_id: userId,
            plan_id: planId,
            status: "active",
            expires_at: expiresAt.toISOString(),
            payment_provider: "stripe",
            external_id: typeof session.subscription === "string" ? session.subscription : session.id,
          })
          .select("id")
          .single();

        await supabase.from("payment_records").insert({
          user_id: userId,
          subscription_id: sub?.id ?? null,
          amount: (session.amount_total ?? 0) / 100,
          currency: (session.currency ?? "pkr").toUpperCase(),
          provider: "stripe",
          external_payment_id: session.id,
          status: "succeeded",
          raw_payload: event.data.object,
        });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as { id: string };
        await supabase
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("external_id", sub.id);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as { subscription?: string };
        if (typeof invoice.subscription === "string") {
          await createServiceClient()
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("external_id", invoice.subscription);
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }
}
