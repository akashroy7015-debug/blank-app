import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const PRICE_IDS: Record<string, string> = {
  weekly:         process.env.PADDLE_PRICE_WEEKLY          ?? '',
  monthly:        process.env.PADDLE_PRICE_MONTHLY         ?? '',
  yearly:         process.env.PADDLE_PRICE_YEARLY          ?? '',
  credits_10:     process.env.PADDLE_PRICE_CREDITS_10      ?? '',
  credits_50:     process.env.PADDLE_PRICE_CREDITS_50      ?? '',
  credits_150:    process.env.PADDLE_PRICE_CREDITS_150     ?? '',
  credits_custom: process.env.PADDLE_PRICE_CREDITS_CUSTOM  ?? '',
}

export async function POST(req: Request) {
  try {
    const { plan, quantity } = await req.json()

    if (!plan || !PRICE_IDS[plan]) {
      const missing = plan ? `price ID for "${plan}" not configured` : 'no plan specified'
      return NextResponse.json({ error: `Invalid plan: ${missing}` }, { status: 400 })
    }

    const qty = (plan === 'credits_custom' && typeof quantity === 'number' && quantity >= 1)
      ? Math.min(Math.floor(quantity), 10000)
      : 1

    const apiKey = process.env.PADDLE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Paddle API key not configured' }, { status: 500 })
    }

    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Please sign in before purchasing.' }, { status: 401 })
    }

    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) {
      return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    const paddleBase = process.env.PADDLE_SANDBOX === 'true'
      ? 'https://sandbox-api.paddle.com'
      : 'https://api.paddle.com'

    const body = {
      items: [{ price_id: PRICE_IDS[plan], quantity: qty }],
      checkout: { url: `${appUrl}/dashboard?success=true` },
      custom_data: { user_id: user.id },
    }

    const res = await fetch(`${paddleBase}/transactions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      const paddleError = data?.error?.detail ?? data?.error?.code ?? JSON.stringify(data)
      console.error('Paddle API error:', paddleError)
      return NextResponse.json({ error: `Paddle error: ${paddleError}` }, { status: 500 })
    }

    const url = data?.data?.checkout?.url
    if (!url) {
      console.error('Paddle response missing checkout URL:', JSON.stringify(data))
      return NextResponse.json({ error: 'Paddle did not return a checkout URL. Check your Paddle dashboard settings.' }, { status: 500 })
    }

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Paddle checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
