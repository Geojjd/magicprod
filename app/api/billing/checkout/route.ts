import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabaseServer";
import { SHOPIFY_PLANS } from "@/app/lib/shopifyPlans";
import type { PlanName } from "@/app/lib/plan";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  // ✅ FIXED
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const plan = (body?.plan as PlanName) ?? "starter";

  if (plan === "free") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const store = process.env.SHOPIFY_STORE_DOMAIN;
  if (!store) {
    return NextResponse.json({ error: "Missing SHOPIFY_STORE_DOMAIN" }, { status: 500 });
  }

  const p = SHOPIFY_PLANS[plan];
  if (!p?.variantId || !p?.sellingPlanId) {
    return NextResponse.json({ error: "Plan not configured" }, { status: 500 });
  }

  const qs = new URLSearchParams();
  qs.set("selling_plan", p.sellingPlanId);
  qs.set("attributes[user_id]", user.id);
  qs.set("attributes[plan]", plan);
  if (user.email) qs.set("checkout[email]", user.email);

  const url = `https://${store}/cart/${p.variantId}:1?${qs.toString()}`;

  return NextResponse.json({ url });
}