import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

function verifyShopifyHmac(rawBody: string, hmacHeader: string | null, secret: string) {
  if (!hmacHeader) return false;

  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

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

  // Supabase admin client (service role)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // IMPORTANT: add this env var in Vercel
  );

  // We rely on the attributes we attached in checkout link:
  const userIdFromAttr = getNoteAttribute(payload, "user_id");
  const planFromAttr = (getNoteAttribute(payload, "plan") as "starter" | "pro" | null) ?? null;
  const email = getBestEmail(payload);

  let userId = userIdFromAttr;

  // Fallback: lookup by email if user_id missing (optional)
  if (!userId && email) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (profile?.id) userId = profile.id;
  }

  // If we still can’t find a user, acknowledge webhook so Shopify stops retrying
  if (!userId) {
    return NextResponse.json({ received: true });
  }

  const plan: "starter" | "pro" = planFromAttr === "pro" ? "pro" : "starter";

  // Simple 30-day period end (you can improve later using selling plan intervals)
  const current_period_end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await supabase
    .from("user_plans")
    .upsert(
      {
        user_id: userId,
        plan,
        status: "active",
        current_period_end,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  return NextResponse.json({ received: true });
}