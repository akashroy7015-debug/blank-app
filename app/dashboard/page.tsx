'use client'

import { useState, useEffect } from 'react'
import ImageUploader from '@/components/ImageUploader'
import AnalysisResult from '@/components/AnalysisResult'
import { getTodayUsage, incrementUsage, canUseFreeTier, FREE_LIMIT } from '@/lib/usage'
import { Sparkles, AlertCircle, Crown } from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'

interface AnalysisResultData {
  replies: {
    flirty: string
    confident: string
    funny: string
    sweet: string
  }
  compatibilityScore: number
  strategyTip: string
}

export default function DashboardPage() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResultData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usageCount, setUsageCount] = useState(0)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    setUsageCount(getTodayUsage())

    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      setSuccessMessage('Payment successful! You now have unlimited analyses.')
    }
  }, [])

  const handleAnalyze = async () => {
    if (!imageFile) {
      setError('Please upload a chat screenshot first.')
      return
    }

    if (!canUseFreeTier()) {
      setError('You have used all 3 free analyses for today. Upgrade to continue.')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const base64 = await fileToBase64(imageFile)
      const base64Data = base64.split(',')[1]

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: imageFile.type,
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Analysis failed. Please try again.')
      }

      const data = await response.json()
      setResult(data)
      incrementUsage()
      setUsageCount(getTodayUsage())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
    })
  }

  const remaining = FREE_LIMIT - usageCount
  const isLimitReached = !canUseFreeTier()

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 rounded-full px-4 py-2 text-pink-400 text-sm font-medium mb-4">
            <Sparkles size={14} />
            Powered by Gemini AI
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Analyze Your{' '}
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Chat
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Upload a screenshot to get 4 perfect replies, a compatibility score, and expert strategy
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
            <Crown className="text-green-400 shrink-0" size={20} />
            <p className="text-green-400">{successMessage}</p>
          </div>
        )}

        {/* Usage Banner */}
        <div className={clsx(
          'mb-8 rounded-xl p-4 flex items-center justify-between',
          isLimitReached
            ? 'bg-red-500/10 border border-red-500/20'
            : 'bg-[#12121f] border border-white/8'
        )}>
          <div className="flex items-center gap-3">
            {isLimitReached ? (
              <AlertCircle className="text-red-400 shrink-0" size={20} />
            ) : (
              <Sparkles className="text-pink-400 shrink-0" size={20} />
            )}
            <div>
              <p className={clsx(
                'font-medium',
                isLimitReached ? 'text-red-400' : 'text-white'
              )}>
                {isLimitReached
                  ? 'Daily limit reached'
                  : `${remaining} of ${FREE_LIMIT} free analyses remaining today`
                }
              </p>
              {!isLimitReached && (
                <p className="text-gray-500 text-sm">Resets at midnight</p>
              )}
            </div>
          </div>
          {isLimitReached && (
            <Link
              href="/pricing"
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl px-4 py-2 text-sm transition-all shrink-0"
            >
              Upgrade Now
            </Link>
          )}
        </div>

        {/* Upload Section */}
        <div className="bg-[#12121f] border border-white/8 rounded-2xl p-6 md:p-8 mb-6">
          <ImageUploader
            setImageFile={setImageFile}
            setImagePreview={setImagePreview}
            imagePreview={imagePreview}
            imageFile={imageFile}
          />

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="text-red-400 shrink-0" size={18} />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!imageFile || isAnalyzing || isLimitReached}
            className={clsx(
              'mt-6 w-full font-semibold rounded-xl px-6 py-4 transition-all flex items-center justify-center gap-2 text-lg',
              !imageFile || isLimitReached
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white glow-pink'
            )}
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing with Gemini AI...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Analyze My Chat
              </>
            )}
          </button>
        </div>

        {/* Results */}
        <AnalysisResult result={result} isLoading={isAnalyzing} />
      </div>
    </main>
  )
}
