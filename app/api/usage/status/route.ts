import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabaseServer";
import { SHOPIFY_PLANS, type PlanName } from "@/app/lib/shopifyPlans";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    return NextResponse.json(
      {
        error: "Not logged in",
        redirectTo: "/login?next=/pricing",
      },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const plan = (body?.plan as PlanName) ?? "starter";

  const store = process.env.SHOPIFY_STORE_DOMAIN;
  if (!store) {
    return NextResponse.json({ error: "Missing SHOPIFY_STORE_DOMAIN" }, { status: 500 });
  }

  const p = SHOPIFY_PLANS[plan];
  if (!p?.variantId) {
    return NextResponse.json({ error: "Plan not configured" }, { status: 500 });
  }

  // Build Shopify cart permalink:
  // https://STORE/cart/VARIANT_ID:1?selling_plan=...&attributes[user_id]=...&attributes[plan]=...&checkout[email]=...
  const qs = new URLSearchParams();
  if (p.sellingPlanId) qs.set("selling_plan", p.sellingPlanId);

  // Pass metadata through to order.note_attributes (Shopify will include these)
  qs.set("attributes[user_id]", user.id);
  qs.set("attributes[plan]", plan);

  // Prefill email if available
  if (user.email) qs.set("checkout[email]", user.email);

  const url = `https://${store}/cart/${p.variantId}:1?${qs.toString()}`;

  return NextResponse.json({ url });
}