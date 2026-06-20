import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json()

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are RizzAI — India's #1 expert AI dating coach. Analyze this chat screenshot and respond with ONLY valid JSON (no markdown, no code blocks) in this exact format:
{
  "replies": {
    "flirty": "A playful, flirty reply that creates tension (under 100 chars)",
    "confident": "A bold, confident reply that shows high value (under 100 chars)",
    "funny": "A witty, humorous reply that shows personality (under 100 chars)",
    "sweet": "A genuine, heartfelt reply that shows vulnerability (under 100 chars)"
  },
  "compatibilityScore": 75,
  "strategyTip": "One specific, actionable tip about how to move this conversation forward based on the dynamic you see."
}

The replies must be in first person from the perspective of the person who should reply next.
Base the compatibility score on: response time signals visible in the chat, message length parity, emoji usage, engagement level, and overall interest signals.
IMPORTANT: If the conversation is in Hindi or Hinglish (a mix of Hindi and English), write the replies in Hinglish — casual, fun, romanized Hindi mixed with English (e.g., "Yaar, tu toh bohot interesting hai 😏", "Chal na, coffee chalti hai?"). Match the language style and tone of the conversation.
If you cannot read the chat or it's not a dating/romantic conversation, still provide helpful general replies.`

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64,
        },
      },
      prompt,
    ])

    const text = result.response.text()

    // Clean up response — Gemini sometimes wraps in ```json ... ```
    let cleanedText = text.trim()
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    }

    let json
    try {
      json = JSON.parse(cleanedText)
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        json = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Failed to parse AI response')
      }
    }

    // Validate expected structure
    if (!json.replies || !json.compatibilityScore || !json.strategyTip) {
      throw new Error('Invalid response structure from AI')
    }

    return NextResponse.json(json)
  } catch (error) {
    console.error('Analyze API error:', error)
    const message = error instanceof Error ? error.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
