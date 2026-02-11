import { NextResponse } from "next/server";
import type { PlanName } from "@/app/lib/shopifyPlans";
import { SHOPIFY_PLANS } from "@/app/lib/shopifyPlans";
import { createSupabaseServerClient } from "@/app/lib/supabaseServer";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const plan = (body?.plan ?? "starter") as PlanName;

  if (!(plan in SHOPIFY_PLANS)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const store = process.env.SHOPIFY_STORE_DOMAIN; // e.g. "magicprodz.myshopify.com"
  if (!store) {
    return NextResponse.json({ error: "Missing SHOPIFY_STORE_DOMAIN" }, { status: 500 });
  }

  const p = SHOPIFY_PLANS[plan];

  // Cart permalink -> redirects into Shopify checkout
  const qs = new URLSearchParams();
  qs.set("selling_plan", p.sellingPlanId);

  // IMPORTANT: link checkout to your Supabase user
  qs.set("attributes[user_id]", user.id);

  // Prefill email (nice UX) + helps fallback matching
  if (user.email) qs.set("checkout[email]", user.email);

  // quantity = 1
  const url = `https://${store}/cart/${p.variantId}:1?${qs.toString()}`;

  return NextResponse.json({ url });
}