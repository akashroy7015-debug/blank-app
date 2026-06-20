import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const VARIANT_IDS: Record<string, string> = {
  weekly: process.env.LS_VARIANT_WEEKLY ?? '',
  monthly: process.env.LS_VARIANT_MONTHLY ?? '',
  yearly: process.env.LS_VARIANT_YEARLY ?? '',
}

export async function POST(req: Request) {
  try {
    const { plan } = await req.json()

    if (!plan || !VARIANT_IDS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY
    const storeId = process.env.LEMONSQUEEZY_STORE_ID

    if (!apiKey || !storeId || !VARIANT_IDS[plan]) {
      return NextResponse.json({ error: 'Lemon Squeezy not configured' }, { status: 500 })
    }

    // Get user ID from Supabase session if available
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

    const body = {
      data: {
        type: 'checkouts',
        attributes: {
          product_options: {
            redirect_url: `${appUrl}/dashboard?success=true`,
            receipt_button_text: 'Go to Dashboard',
            receipt_link_url: `${appUrl}/dashboard`,
          },
          checkout_options: {
            embed: false,
            media: true,
            logo: true,
          },
          ...(userId && {
            checkout_data: {
              custom: { user_id: userId },
            },
          }),
        },
        relationships: {
          store: {
            data: { type: 'stores', id: storeId },
          },
          variant: {
            data: { type: 'variants', id: VARIANT_IDS[plan] },
          },
        },
      },
    }

    const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('LS checkout error:', err)
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
    }

    const data = await res.json()
    const url = data?.data?.attributes?.url

    return NextResponse.json({ url })
  } catch (error) {
    console.error('LS checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
