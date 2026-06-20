import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 400 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const clientReferenceId = session.client_reference_id

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const planName = subscription.items.data[0]?.price?.recurring?.interval || 'monthly'
          const currentPeriodEnd = new Date((subscription as Stripe.Subscription & { current_period_end: number }).current_period_end * 1000).toISOString()

          if (clientReferenceId) {
            await supabase.from('subscriptions').upsert({
              user_id: clientReferenceId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              plan: planName,
              status: 'active',
              current_period_end: currentPeriodEnd,
            }, { onConflict: 'user_id' })
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription & { current_period_end: number }
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString()
        const planName = subscription.items.data[0]?.price?.recurring?.interval || 'monthly'

        await supabase
          .from('subscriptions')
          .update({
            plan: planName,
            status: subscription.status === 'active' ? 'active' : 'inactive',
            current_period_end: currentPeriodEnd,
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await supabase
          .from('subscriptions')
          .update({ status: 'inactive' })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
