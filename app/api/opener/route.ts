import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const FREE_LIMIT = 3

export async function POST(req: Request) {
  try {
    const { name, platform, bio, interests, photoDesc } = await req.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
    }

    const supabase = createServerClient()
    if (!supabase) return NextResponse.json({ error: 'Service not configured' }, { status: 500 })

    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Please sign in to use FlirtIQ.' }, { status: 401 })

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 })

    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('status, credits, free_analyses_count, free_analyses_date')
      .eq('user_id', user.id)
      .single()

    // A real DB/config error (not just "row not found") — abort
    if (subError && subError.code !== 'PGRST116') {
      console.error('Supabase subscription fetch error:', subError)
      return NextResponse.json({ error: 'Service error. Please try again.' }, { status: 500 })
    }

    const isSubscribed = sub?.status === 'active'
    const credits = sub?.credits ?? 0
    let creditsUsed = false
    let freeTierCount: number | undefined = undefined

    if (isSubscribed) {
      // unlimited — no deduction
    } else if (credits > 0) {
      const { error: updateErr } = await supabase
        .from('subscriptions')
        .update({ credits: credits - 1 })
        .eq('user_id', user.id)
      if (updateErr) {
        console.error('Credit deduction error:', updateErr)
        return NextResponse.json({ error: 'Failed to deduct credit. Please try again.' }, { status: 500 })
      }
      creditsUsed = true
    } else {
      // Free tier — enforce server-side
      const today = new Date().toISOString().split('T')[0]
      const isNewDay = sub?.free_analyses_date !== today
      const currentCount = isNewDay ? 0 : (sub?.free_analyses_count ?? 0)

      if (currentCount >= FREE_LIMIT) {
        return NextResponse.json(
          { error: 'Daily free limit reached. Buy credits or upgrade to continue.' },
          { status: 429 }
        )
      }

      const newCount = currentCount + 1
      if (sub) {
        const { error: updateErr } = await supabase
          .from('subscriptions')
          .update({ free_analyses_count: newCount, free_analyses_date: today })
          .eq('user_id', user.id)
        if (updateErr) {
          console.error('Free tier update error:', updateErr)
          return NextResponse.json({ error: 'Failed to track usage. Please try again.' }, { status: 500 })
        }
      } else {
        const { error: insertErr } = await supabase
          .from('subscriptions')
          .insert({ user_id: user.id, status: 'inactive', credits: 0, free_analyses_count: newCount, free_analyses_date: today })
        if (insertErr) {
          console.error('Free tier insert error:', insertErr)
          return NextResponse.json({ error: 'Failed to track usage. Please try again.' }, { status: 500 })
        }
      }
      freeTierCount = newCount
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const matchDesc = [
      name ? `Name: ${name}` : null,
      platform ? `Platform: ${platform}` : null,
      bio ? `Bio: ${bio}` : null,
      interests ? `Interests/hobbies: ${interests}` : null,
      photoDesc ? `Profile photo: ${photoDesc}` : null,
    ].filter(Boolean).join('\n')

    const prompt = `You are FlirtIQ, an expert AI dating coach. Based on this match's profile, write 4 opening lines in different styles. Respond with ONLY valid JSON (no markdown, no code blocks):

{
  "replies": {
    "aura": "Magnetic, mysterious opening that creates intrigue (under 100 chars)",
    "cool": "Laid-back, effortlessly confident opener (under 100 chars)",
    "bold": "Direct, confident opener that takes initiative (under 100 chars)",
    "gentleman": "Warm, genuine, personalized opener (under 100 chars)"
  },
  "tip": "One specific tip on what to talk about next based on their profile"
}

Style guide:
- AURA: High-value, mysterious. Makes them curious, invites a reply. References something from their profile subtly.
- COOL: Relaxed, playful. Doesn't try too hard. Short and witty.
- BOLD: Takes charge. Could be a direct compliment, a question about something specific, or suggesting something fun.
- GENTLEMAN: Shows you actually read their profile. Genuine, warm, no cheesiness.

LANGUAGE RULE (critical): Detect the language and cultural context from the match's bio and profile details.
- If the bio is in Hindi or Hinglish → write all openers in natural Hinglish (mix of Hindi + English like real Indian texting, e.g. "Yaar, tera bio padh ke laga...")
- If the bio is in Spanish → write in Spanish
- If the bio is in any other language → match that language
- If English or unclear → write in English
- Always match the tone, formality level, and cultural nuance of the profile's language

Match profile:
${matchDesc || 'No profile details provided — write general openers that work for most profiles.'}

Important: Make each opener feel unique and not like a template. Reference actual details from their profile when available.`

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
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
      const match = cleanedText.match(/\{[\s\S]*\}/)
      if (match) json = JSON.parse(match[0])
      else throw new Error('Failed to parse AI response')
    }

    return NextResponse.json({ ...json, creditsUsed, freeTierCount })
  } catch (error) {
    console.error('Opener API error:', error)
    return NextResponse.json({ error: 'Failed to generate openers. Please try again.' }, { status: 500 })
  }
}
