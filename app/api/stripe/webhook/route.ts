import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // important (don’t run this on Edge)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover" as any,
});

// Supabase admin (service role) client — server only
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function upsertSubscriptionFromStripe(sub: Stripe.Subscription) {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  // Find user_id by customer_id
  const { data: profile, error: profErr } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (profErr) throw profErr;

  // If no profile match, try customer metadata (we set it at customer creation)
  let userId = profile?.id ?? null;

  if (!userId) {
    const customer = await stripe.customers.retrieve(customerId);
    const metaUserId =
      !("deleted" in customer) ? customer.metadata?.supabase_user_id : null;
    if (metaUserId) userId = metaUserId;
  }

  if (!userId) {
    // If this happens, it means you created a subscription without linking a customer to a user
    throw new Error(`No Supabase user found for customer ${customerId}`);
  }
 

  const priceId = sub.items.data[0]?.price?.id ?? null;
  

  const periodEnd =
    (sub as any).current_period_end ??
    sub.billing_cycle_anchor;
  
  const payload = {
    id: sub.id,
    user_id: userId,
    status: sub.status,
    price_id: priceId,
    current_period_end: new Date(periodEnd * 1000).toISOString(),
    cancel_at_period_end: sub.cancel_at_period_end ?? false,
  };



  const { error } = await supabaseAdmin.from("subscriptions").upsert(payload);
  if (error) throw error;
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // subscription is created in subscription mode
        const subscriptionId = session.subscription as string | null;
        const customerId = session.customer as string | null;

        // Optional: store customer id on profile if you want extra safety
        // (you already do this when creating checkout, but this helps if you didn’t)
        const supabaseUserId = session.metadata?.supabase_user_id; // only if you set it
        if (supabaseUserId && customerId) {
          await supabaseAdmin.from("profiles").upsert({
            id: supabaseUserId,
            stripe_customer_id: customerId,
          });
        }

        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          await upsertSubscriptionFromStripe(sub);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await upsertSubscriptionFromStripe(sub);
        break;
      }

      default:
        // ignore other events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook handler failed: ${err.message}` },
      { status: 500 }
    );
  }
}