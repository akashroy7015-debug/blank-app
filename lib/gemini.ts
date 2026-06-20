import { GoogleGenerativeAI } from '@google/generative-ai'

export function createGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set')
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
}

export function getGeminiModel(modelName = 'gemini-1.5-flash') {
  const client = createGeminiClient()
  return client.getGenerativeModel({ model: modelName })
}
