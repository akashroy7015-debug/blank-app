import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const PRICE_IDS: Record<string, string> = {
  weekly:  process.env.PADDLE_PRICE_WEEKLY  ?? '',
  monthly: process.env.PADDLE_PRICE_MONTHLY ?? '',
  yearly:  process.env.PADDLE_PRICE_YEARLY  ?? '',
}

export async function POST(req: Request) {
  try {
    const { plan } = await req.json()

    if (!plan || !PRICE_IDS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const apiKey = process.env.PADDLE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Paddle not configured' }, { status: 500 })
    }

    // Get user from Supabase session if available
    let userId: string | undefined
    const authHeader = req.headers.get('authorization')
    if (authHeader) {
      const supabase = createServerClient()
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
        userId = user?.id
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

    const body: Record<string, unknown> = {
      items: [{ price_id: PRICE_IDS[plan], quantity: 1 }],
      checkout: {
        url: `${appUrl}/dashboard?success=true`,
      },
    }

    if (userId) {
      body.custom_data = { user_id: userId }
    }

    const res = await fetch('https://api.paddle.com/transactions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Paddle checkout error:', err)
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
    }

    const data = await res.json()
    const url = data?.data?.checkout?.url

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Paddle checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
