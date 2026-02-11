import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/app/lib/SupabaseAdmin";

function verifyShopifyHmac(rawBody: string, hmacHeader: string | null, secret: string) {
  if (!hmacHeader) return false;

  const digest = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");

  // timing-safe compare
  const a = Buffer.from(digest);
  const b = Buffer.from(hmacHeader);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function getNoteAttribute(payload: any, key: string): string | null {
  const attrs = payload?.note_attributes;
  if (!Array.isArray(attrs)) return null;
  const found = attrs.find((x: any) => x?.name === key);
  return found?.value ?? null;
}

function getBestEmail(payload: any): string | null {
  return (
    payload?.email ||
    payload?.contact_email ||
    payload?.customer?.email ||
    payload?.billing_address?.email ||
    null
  );
}

export async function POST(req: Request) {
  const raw = await req.text();
  const hmac = req.headers.get("x-shopify-hmac-sha256");

  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    return new NextResponse("Missing SHOPIFY_WEBHOOK_SECRET", { status: 500 });
  }

  if (!verifyShopifyHmac(raw, hmac, secret)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(raw);

  // We rely on what we set in checkout link:
  const userIdFromAttr = getNoteAttribute(payload, "user_id");
  const planFromAttr = getNoteAttribute(payload, "plan") as "starter" | "pro" | null;

  const email = getBestEmail(payload);

  const supabase = getSupabaseAdmin();

  // Decide user_id:
  let userId = userIdFromAttr;

  // If no attribute, fallback lookup by email
  if (!userId && email) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (profile?.id) userId = profile.id;
  }

  // If still no user, acknowledge webhook (so Shopify doesn't retry forever)
  if (!userId) {
    return NextResponse.json({ received: true });
  }

  // Decide plan:
  // Prefer attribute. If missing, try to infer from line items selling plan name/id.
  let plan: "starter" | "pro" = planFromAttr === "pro" ? "pro" : "starter";

  // Mark active for ~30 days (basic subscription window for usage limits)
  const current_period_end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await supabase.from("user_plans").upsert(
    {
      user_id: userId,
      plan,
      status: "active",
      current_period_end,
    },
    { onConflict: "user_id" }
  );

  return NextResponse.json({ received: true });
}