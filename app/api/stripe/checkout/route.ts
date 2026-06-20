import Stripe from 'stripe'
import { NextResponse } from 'next/server'

// Prices in cents (USD × 100): $4.99 = 499, $9.99 = 999, $39.99 = 3999
const PLANS: Record<string, { price: number; interval: 'week' | 'month' | 'year'; name: string }> = {
  weekly: { price: 499,  interval: 'week',  name: 'FlirtIQ Weekly' },
  monthly: { price: 999,  interval: 'month', name: 'FlirtIQ Monthly' },
  yearly: { price: 3999, interval: 'year',  name: 'FlirtIQ Yearly' },
}

export async function POST(req: Request) {
  try {
    const { plan } = await req.json()

    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const planConfig = PLANS[plan]

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: planConfig.name },
            unit_amount: planConfig.price,
            recurring: { interval: planConfig.interval },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
