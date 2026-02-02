import { NextResponse } from 'next/server'
import { getStripe } from '@/app/lib/stripe'

export const runtime = 'nodejs'



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

   function getSiteUrl(req: Request) {
  const origin = req.headers.get('origin')
  if (origin) return origin

  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  if (host) return `${proto}://${host}`

  return 'http://localhost:3000'
}

   const site = getSiteUrl(req)
   const stripe = getStripe(); // getStripe should return a Stripe instance

   const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: body.customerId, // Make sure to pass customerId in the request body
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `/success`,
    cancel_url: `/cancel`,
    allow_promotion_codes: true,
    metadata: { supabase_user_id: userId, target_plan: plan },
   });


  return NextResponse.json({ url: session.url});
 }catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "checkout failed" }, { status: 500 });
  }
}
