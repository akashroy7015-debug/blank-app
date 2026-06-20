import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServerClient } from '@/lib/supabase'

function verifySignature(body: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(body)
  const digest = Buffer.from(hmac.digest('hex'), 'utf8')
  const sig = Buffer.from(signature, 'utf8')
  if (digest.length !== sig.length) return false
  return crypto.timingSafeEqual(digest, sig)
}

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('x-signature') ?? ''
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET

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

  const eventName = (payload.meta as Record<string, unknown>)?.event_name as string
  const customData = ((payload.meta as Record<string, unknown>)?.custom_data as Record<string, string>) ?? {}
  const attrs = ((payload.data as Record<string, unknown>)?.attributes as Record<string, unknown>) ?? {}
  const dataId = (payload.data as Record<string, unknown>)?.id as string

  const userId = customData.user_id

  try {
    switch (eventName) {
      case 'subscription_created': {
        if (!userId) break
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: String(attrs.customer_id ?? ''),
          stripe_subscription_id: dataId,
          plan: resolvePlan(String(attrs.variant_id ?? '')),
          status: attrs.status === 'active' ? 'active' : 'inactive',
          current_period_end: attrs.renews_at ?? null,
        }, { onConflict: 'user_id' })
        break
      }

      case 'subscription_updated': {
        await supabase
          .from('subscriptions')
          .update({
            plan: resolvePlan(String(attrs.variant_id ?? '')),
            status: attrs.status === 'active' ? 'active' : 'inactive',
            current_period_end: attrs.renews_at ?? null,
          })
          .eq('stripe_subscription_id', dataId)
        break
      }

      case 'subscription_cancelled':
      case 'subscription_expired': {
        await supabase
          .from('subscriptions')
          .update({ status: 'inactive' })
          .eq('stripe_subscription_id', dataId)
        break
      }

      default:
        console.log(`Unhandled LS event: ${eventName}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('LS webhook handler error:', error)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }
}

function resolvePlan(variantId: string): string {
  if (variantId === process.env.LS_VARIANT_WEEKLY) return 'weekly'
  if (variantId === process.env.LS_VARIANT_MONTHLY) return 'monthly'
  if (variantId === process.env.LS_VARIANT_YEARLY) return 'yearly'
  return 'monthly'
}
