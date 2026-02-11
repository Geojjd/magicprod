import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/app/lib/SupabaseAdmin";
import { PLAN_BY_VARIANT_ID } from "@/app/lib/shopifyPlans";

function verifyShopifyWebhook(rawBody: string, hmacHeader: string | null, secret: string) {
  if (!hmacHeader) return false;
  const digest = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  // Use timing-safe compare
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
}

function getAttribute(noteAttributes: any, key: string): string | null {
  // Shopify order note_attributes usually looks like [{name:"user_id", value:"..."}]
  if (!Array.isArray(noteAttributes)) return null;
  const found = noteAttributes.find((x) => x?.name === key);
  return found?.value ?? null;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const hmac = req.headers.get("x-shopify-hmac-sha256");
  const topic = req.headers.get("x-shopify-topic") || "";

  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) return new NextResponse("Missing SHOPIFY_WEBHOOK_SECRET", { status: 500 });

  const ok = verifyShopifyWebhook(rawBody, hmac, secret);
  if (!ok) return new NextResponse("Invalid signature", { status: 401 });

  const payload = JSON.parse(rawBody);

  // Your webhook is “Order payment” in admin.
  // Depending on Shopify, you might receive:
  // - orders/paid
  // - orders/create (with financial_status=paid)
  // We'll handle both.
  const financialStatus = (payload?.financial_status || "").toLowerCase();
  const isPaid = financialStatus === "paid";

  if (!isPaid) {
    // Ignore non-paid events
    return NextResponse.json({ received: true, ignored: true, topic });
  }

  // 1) Prefer user_id from note_attributes (best)
  const userId =
    getAttribute(payload?.note_attributes, "user_id") ||
    getAttribute(payload?.note_attributes, "userId");

  // 2) Fallback: match by email (less reliable, but ok as backup)
  const email = payload?.email || payload?.contact_email || payload?.customer?.email;

  // Determine plan from line_items variant_id
  const lineItems = Array.isArray(payload?.line_items) ? payload.line_items : [];
  const firstVariantId = lineItems?.[0]?.variant_id ? String(lineItems[0].variant_id) : null;
  const plan = firstVariantId ? PLAN_BY_VARIANT_ID[firstVariantId] : null;

  const supabase = getSupabaseAdmin();

  let resolvedUserId = userId;

  if (!resolvedUserId && email) {
    // If your profiles table stores email, use that
    const { data: profile } = await supabase
      .from("profiles")
      .select("id,email")
      .eq("email", email)
      .maybeSingle();

    resolvedUserId = profile?.id ?? null;
  }

  if (!resolvedUserId) {
    // We verified the webhook, but can’t link it to a user
    return NextResponse.json({ received: true, linked: false });
  }

  // If we can’t detect plan from variant_id, default to starter (or handle as error)
  const finalPlan = plan ?? "starter";

  await supabase.from("user_plans").upsert(
    {
      user_id: resolvedUserId,
      plan: finalPlan,
      status: "active",
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  return NextResponse.json({ received: true, linked: true, plan: finalPlan });
}