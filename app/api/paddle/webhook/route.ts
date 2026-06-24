import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServerClient } from '@/lib/supabase'

function verifySignature(body: string, signature: string, secret: string): boolean {
  // Paddle signature format: ts=TIMESTAMP;h1=HMAC_SHA256
  const parts: Record<string, string> = {}
  for (const part of signature.split(';')) {
    const [k, v] = part.split('=')
    if (k && v) parts[k] = v
  }
  if (!parts.ts || !parts.h1) return false
  const expected = crypto.createHmac('sha256', secret).update(`${parts.ts}:${body}`).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(parts.h1, 'utf8'))
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('paddle-signature') ?? ''
  const secret = process.env.PADDLE_WEBHOOK_SECRET

  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  if (!verifySignature(body, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType = payload.event_type as string
  const data = (payload.data as Record<string, unknown>) ?? {}

  try {
    switch (eventType) {
      case 'subscription.created': {
        const customData = (data.custom_data as Record<string, string>) ?? {}
        const userId = customData.user_id
        if (!userId) break
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: String(data.customer_id ?? ''),
          stripe_subscription_id: String(data.id ?? ''),
          plan: resolvePlan(data),
          status: isActive(data.status as string) ? 'active' : 'inactive',
          current_period_end: (data.current_billing_period as Record<string, string>)?.ends_at ?? null,
        }, { onConflict: 'user_id' })
        break
      }

      case 'subscription.updated': {
        await supabase
          .from('subscriptions')
          .update({
            plan: resolvePlan(data),
            status: isActive(data.status as string) ? 'active' : 'inactive',
            current_period_end: (data.current_billing_period as Record<string, string>)?.ends_at ?? null,
          })
          .eq('stripe_subscription_id', String(data.id ?? ''))
        break
      }

      case 'subscription.canceled':
      case 'subscription.paused': {
        await supabase
          .from('subscriptions')
          .update({ status: 'inactive' })
          .eq('stripe_subscription_id', String(data.id ?? ''))
        break
      }

      default:
        console.log(`Unhandled Paddle event: ${eventType}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Paddle webhook handler error:', error)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }
}

function isActive(status: string): boolean {
  return status === 'active' || status === 'trialing'
}

function resolvePlan(data: Record<string, unknown>): string {
  const items = (data.items as Array<Record<string, unknown>>) ?? []
  const priceId = ((items[0]?.price as Record<string, unknown>)?.id as string) ?? ''
  if (priceId === process.env.PADDLE_PRICE_WEEKLY) return 'weekly'
  if (priceId === process.env.PADDLE_PRICE_MONTHLY) return 'monthly'
  if (priceId === process.env.PADDLE_PRICE_YEARLY) return 'yearly'
  return 'monthly'
}
