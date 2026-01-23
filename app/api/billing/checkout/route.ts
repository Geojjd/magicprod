import { NextResponse } from 'next/server'
import { stripe } from '@/app/lib/stripe'
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
      plan === 'pro' ? process.env.STRIPE_PRICE_PRO! : process.env.STRIPE_PRICE_STUDIO!

    // Optional: store stripe_customer_id in profiles
    // If none exists, create one.
    const { data: profile, error: pErr } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })

    let customerId = profile?.stripe_customer_id as string | null

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email || undefined,
        metadata: { supabase_user_id: userId },
      })
      customerId = customer.id

      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${site}/?billing=success`,
      cancel_url: `${site}/?billing=cancel`,
      allow_promotion_codes: true,
      metadata: {
        supabase_user_id: userId,
        target_plan: plan,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'checkout failed' }, { status: 500 })
  }
}
