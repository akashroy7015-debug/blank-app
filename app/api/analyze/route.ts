import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json()

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Check subscription or credits if user is authenticated
    const authHeader = req.headers.get('authorization')
    let creditsUsed = false
    if (authHeader) {
      const supabase = createServerClient()
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
        if (user) {
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('status, credits')
            .eq('user_id', user.id)
            .single()

          const isSubscribed = sub?.status === 'active'
          const credits = sub?.credits ?? 0

          if (!isSubscribed && credits <= 0) {
            // No subscription and no credits — fall through to free tier (client enforces)
          } else if (!isSubscribed && credits > 0) {
            // Deduct 1 credit
            await supabase
              .from('subscriptions')
              .update({ credits: credits - 1 })
              .eq('user_id', user.id)
            creditsUsed = true
          }
          // If subscribed, no deduction needed
        }
      }
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const prompt = `You are FlirtIQ — an expert AI dating coach serving users in 29 languages worldwide. Analyze this chat screenshot and respond with ONLY valid JSON (no markdown, no code blocks) in this exact format:

{
  "replies": {
    "aura": "Magnetic, mysterious reply with effortless high-status energy (under 100 chars)",
    "cool": "Laid-back, confident reply that doesn't try too hard (under 100 chars)",
    "bold": "Direct, assertive reply that takes initiative (under 100 chars)",
    "gentleman": "Warm, charming, respectful reply with genuine interest (under 100 chars)"
  },
  "compatibilityScore": 75,
  "strategyNote": "One specific, actionable tip about how to move this conversation forward — what to write next and when, based on the dynamic you observe."
}

Reply style guide:
- AURA: High-value, mysterious, magnetic. The reply that makes them curious and wanting more.
- COOL: Relaxed confidence. Short, playful, not over-eager. Effortlessly attractive.
- BOLD: Takes charge. Direct ask, clear intent, high confidence. No games.
- GENTLEMAN: Warm and genuine. Shows real interest without desperation. Charming and kind.

Scoring: Base compatibilityScore (0-100) on response time signals, message length parity, emoji usage, engagement level, question-asking, and overall interest indicators visible in the chat.

MULTILINGUAL — CRITICAL RULE: Detect the language of the conversation and write ALL 4 replies in that EXACT same language, dialect, and cultural style. Supported languages:
English, Hindi, Hinglish (Hindi+English mix), Spanish, French, Portuguese (Brazil & Portugal), German, Italian, Turkish, Arabic, Japanese, Korean, Chinese (Simplified & Traditional), Russian, Polish, Dutch, Swedish, Norwegian, Danish, Finnish, Greek, Thai, Vietnamese, Indonesian, Malay, Tagalog, Bengali, Urdu, Persian/Farsi, Ukrainian.

Language matching examples:
- English chat → English replies
- Hindi/Hinglish chat → casual Hinglish replies (e.g. "Yaar, tu toh kaafi interesting hai 😏")
- Turkish chat → Turkish replies
- Arabic chat → Arabic replies (maintain formality level of original)
- Spanish chat → Spanish replies (match Latin American vs Spain dialect if clear)
- Japanese chat → Japanese replies (match keigo level of original)
Always match tone, formality, and cultural nuance of the original conversation exactly.

If the image is unclear or not a dating/messaging conversation, still return valid JSON with helpful general replies in English and a compatibilityScore of 50.`

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      max_tokens: 1000,
    })

    const text = response.choices[0]?.message?.content ?? ''

    let cleanedText = text.trim()
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    }

    let json
    try {
      json = JSON.parse(cleanedText)
    } catch {
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        json = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Failed to parse AI response')
      }
    }

    if (!json.replies || !json.compatibilityScore || !json.strategyNote) {
      throw new Error('Invalid response structure from AI')
    }

    return NextResponse.json({ ...json, creditsUsed })
  } catch (error) {
    console.error('Analyze API error:', error)
    const message = error instanceof Error ? error.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
