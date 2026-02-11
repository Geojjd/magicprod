import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/app/lib/SupabaseAdmin";

// map variant -> plan (use your env variant ids)
function planFromVariant(variantId: string) {
  const starter = process.env.SHOPIFY_STARTER_VARIANT_ID!;
  const pro = process.env.SHOPIFY_PRO_VARIANT_ID!;
  if (variantId === starter) return "starter";
  if (variantId === pro) return "pro";
  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-shopify-hmac-sha256") || "";

  const secret = process.env.SHOPIFY_WEBHOOK_SECRET!;
  if (!secret) return new NextResponse("Missing secret", { status: 500 });

  const hash = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");

  if (hash !== signature) return new NextResponse("Invalid signature", { status: 401 });

  const data = JSON.parse(body);

  // ✅ Pull your Supabase user_id from note_attributes (created from checkout attributes[])
  const noteAttrs: Array<{ name: string; value: string }> = data.note_attributes ?? [];
  const userId = noteAttrs.find((x) => x.name === "user_id")?.value || null;

  if (!userId) return NextResponse.json({ received: true, ignored: "no_user_id" });

  // Plan detection (recommended): use purchased variant_id
  const firstItem = (data.line_items ?? [])[0];
  const variantId = String(firstItem?.variant_id ?? "");
  const plan = planFromVariant(variantId) || (noteAttrs.find((x) => x.name === "plan")?.value ?? "starter");

  // Shopify IDs you might want to store
  const shopifyCustomerId = data.customer?.id ? String(data.customer.id) : null;
  const orderId = data.id ? String(data.id) : null;

  const supabase = getSupabaseAdmin();

  // ✅ Update user_plans (unlock)
  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error: planErr } = await supabase.from("user_plans").upsert(
    {
      user_id: userId,
      plan,
      status: "active",
      current_period_end: periodEnd,
    },
    { onConflict: "user_id" }
  );

  if (planErr) return NextResponse.json({ error: planErr.message }, { status: 500 });

  // ✅ Save Shopify link info
  await supabase.from("shopify_links").upsert(
    {
      user_id: userId,
      shopify_customer_id: shopifyCustomerId,
      last_order_id: orderId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  return NextResponse.json({ received: true });
}