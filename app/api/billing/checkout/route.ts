import { NextResponse } from 'next/server'
import { getStripe } from '@/app/lib/stripe'
import { supabaseAdmin } from '@/app/lib/SupabaseAdmin'


export async function POST(req: Request) {
  try {
    const body = await req.json()
    const plan = String(body.plan || '').toLowerCase() // 'pro' | 'studio'
    const userId = String(body.userId || '')
    const email = String(body.email || '')

    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    if (!['pro', 'studio'].includes(plan)) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

   const priceId =
   plan === "pro"
   ? process.env.STRIPE_PRICE_PRO
   : process.env.STRIPE_PRICE_STARTER;

   if (!priceId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });

   }

   const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

   const stripe = getStripe(); // getStripe should return a Stripe instance

   const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: body.customerId, // Make sure to pass customerId in the request body
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${site}/success`,
    cancel_url: `${site}/cancel`,
    allow_promotion_codes: true,
    metadata: { supabase_user_id: userId, target_plan: plan },
   });


  return NextResponse.json({ url: session.url});
 }catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "checkout failed" }, { status: 500 });
  }
}
