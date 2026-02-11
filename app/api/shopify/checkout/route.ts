import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabaseServer";
import { SHOPIFY_PLANS, assertShopifyPlansConfigured, type PlanName } from "@/app/lib/shopifyPlans";

export async function POST(req: Request) {
  try {
    assertShopifyPlansConfigured();

    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const plan = (body?.plan as PlanName) ?? "starter";
    if (plan !== "starter" && plan !== "pro") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const store = process.env.SHOPIFY_STORE_DOMAIN; // e.g. "magicprodz.myshopify.com"
    if (!store) {
      return NextResponse.json({ error: "Missing SHOPIFY_STORE_DOMAIN" }, { status: 500 });
    }

    const p = SHOPIFY_PLANS[plan];

    // Build Shopify cart permalink:
    // https://{store}/cart/{variantId}:1?selling_plan=SELLINGPLAN&attributes[user_id]=...&attributes[plan]=...
    const qs = new URLSearchParams();
    qs.set("selling_plan", p.sellingPlanId);
    qs.set("attributes[user_id]", user.id);
    qs.set("attributes[plan]", plan);
    if (user.email) qs.set("checkout[email]", user.email);

    const url = `https://${store}/cart/${p.variantId}:1?${qs.toString()}`;

    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Checkout failed" }, { status: 500 });
  }
}