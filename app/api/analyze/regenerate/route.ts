import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const STYLE_PROMPTS: Record<string, string> = {
  aura:      'Magnetic, mysterious, high-status energy. Makes them curious and wanting more.',
  cool:      'Relaxed confidence. Short, playful, not over-eager. Effortlessly attractive.',
  bold:      'Takes charge. Direct, assertive, clear intent. No games.',
  gentleman: 'Warm, genuine, charming. Real interest without desperation.',
}

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType, style } = await req.json()

    if (!imageBase64 || !style || !STYLE_PROMPTS[style]) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
    }

    // Require auth + verify user has access (subscription, credits, or free tier usage today)
    // Does NOT deduct credits — regeneration is a free extra after the initial paid analysis
    const supabase = createServerClient()
    if (!supabase) return NextResponse.json({ error: 'Service not configured' }, { status: 500 })

    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Please sign in to use FlirtIQ.' }, { status: 401 })

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 })

    // Gate: user must have an active subscription, credits, or have used a free analysis today
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status, credits, free_analyses_count, free_analyses_date')
      .eq('user_id', user.id)
      .single()

    const isSubscribed = sub?.status === 'active'
    const hasCredits = (sub?.credits ?? 0) > 0
    const today = new Date().toISOString().split('T')[0]
    const usedFreeToday = sub?.free_analyses_date === today && (sub?.free_analyses_count ?? 0) > 0

    if (!isSubscribed && !hasCredits && !usedFreeToday) {
      return NextResponse.json({ error: 'Please analyze a chat first to unlock regeneration.' }, { status: 403 })
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const prompt = `You are FlirtIQ, an expert AI dating coach. Look at this chat screenshot and write a single fresh reply in the ${style.toUpperCase()} style.

Style guide for ${style.toUpperCase()}: ${STYLE_PROMPTS[style]}

Rules:
- Keep it under 100 characters
- Match the language, tone, and dialect of the conversation exactly
- Make it feel different from a generic template — read the actual chat context
- Return ONLY the reply text (no quotes, no JSON, no explanation)

Just the reply itself.`

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}` },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
      max_tokens: 200,
    })

    const reply = response.choices[0]?.message?.content?.trim() ?? ''
    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Regenerate API error:', error)
    return NextResponse.json({ error: 'Regeneration failed. Please try again.' }, { status: 500 })
  }
}
