import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/app/lib/stripe'
import { supabaseAdmin } from '@/app/lib/SupabaseAdmin'

export const runtime = 'nodejs' // IMPORTANT for Stripe signature

export async function POST(req: Request) {
  const sig = (await headers()).get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })

  const rawBody = await req.text()

  let event: any
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature failed: ${err.message}` }, { status: 400 })
  }

  try {
    // 1) Subscription active/created
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      const userId = session?.metadata?.supabase_user_id
      const targetPlan = session?.metadata?.target_plan // 'pro'|'studio'

      if (userId && targetPlan) {
        await supabaseAdmin
          .from('profiles')
          .update({ plan: targetPlan })
          .eq('id', userId)
      }
    }

    // 2) Keep plan in sync if subscription changes later (canceled, unpaid, etc.)
    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as any
      const customerId = sub.customer as string

      // Find user by stripe_customer_id
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (profile?.id) {
        const status = sub.status as string
        const isActive = ['active', 'trialing'].includes(status)

        // If canceled / unpaid etc -> downgrade to free
        if (!isActive) {
          await supabaseAdmin
            .from('profiles')
            .update({ plan: 'free' })
            .eq('id', profile.id)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Webhook handler failed' }, { status: 500 })
  }
}
