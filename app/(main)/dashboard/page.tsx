'use client'

import { useState, useEffect } from 'react'
import ImageUploader from '@/components/ImageUploader'
import AnalysisResult from '@/components/AnalysisResult'
import { getTodayUsage, incrementUsage, canUseFreeTier, FREE_LIMIT } from '@/lib/usage'
import { Sparkles, AlertCircle, Crown, Infinity, Coins } from 'lucide-react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'

interface AnalysisResultData {
  replies: { aura: string; cool: string; bold: string; gentleman: string }
  compatibilityScore: number
  strategyNote: string
  creditsUsed?: boolean
}

export default function DashboardPage() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResultData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usageCount, setUsageCount] = useState(0)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [credits, setCredits] = useState(0)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    setUsageCount(getTodayUsage())
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      setSuccessMessage('Payment successful! Your account has been updated.')
    }

    const checkSubscription = async () => {
      const supabase = createBrowserClient()
      if (!supabase) return
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setAccessToken(session.access_token)
      const { data } = await supabase
        .from('subscriptions')
        .select('status, credits')
        .eq('user_id', session.user.id)
        .single()
      if (data?.status === 'active') setIsSubscribed(true)
      if ((data?.credits ?? 0) > 0) setCredits(data?.credits ?? 0)
    }
    checkSubscription()
  }, [])

  const handleAnalyze = async () => {
    if (!imageFile) { setError('Please upload a chat screenshot first.'); return }
    const hasAccess = isSubscribed || credits > 0 || canUseFreeTier()
    if (!hasAccess) {
      setError('You have used all 3 free analyses for today. Buy credits or upgrade to continue.')
      return
    }
    setIsAnalyzing(true)
    setError(null)
    setResult(null)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(imageFile)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
      })
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({ imageBase64: base64.split(',')[1], mimeType: imageFile.type }),
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Analysis failed. Please try again.')
      }
      const data = await response.json()
      setResult(data)
      if (data.creditsUsed) {
        setCredits(c => Math.max(0, c - 1))
      } else if (!isSubscribed) {
        incrementUsage()
        setUsageCount(getTodayUsage())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const remaining = FREE_LIMIT - usageCount
  const isLimitReached = !isSubscribed && credits === 0 && !canUseFreeTier()

  const bannerIcon = isLimitReached
    ? <AlertCircle size={19} style={{ color: 'oklch(0.577 0.245 27.325)', flexShrink: 0 }} />
    : isSubscribed
      ? <Infinity size={19} style={{ color: 'var(--primary)', flexShrink: 0 }} />
      : credits > 0
        ? <Coins size={19} style={{ color: 'oklch(0.7 0.19 55)', flexShrink: 0 }} />
        : <Sparkles size={19} style={{ color: 'var(--primary)', flexShrink: 0 }} />

  const bannerText = isLimitReached
    ? 'Daily limit reached — buy credits or upgrade'
    : isSubscribed
      ? 'Unlimited analyses — Pro plan active'
      : credits > 0
        ? `${credits} credit${credits !== 1 ? 's' : ''} remaining`
        : `${remaining} of ${FREE_LIMIT} free analyses remaining today`

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium mb-4"
            style={{ background: 'oklch(0.64 0.24 5 / 0.1)', color: 'var(--primary)', border: '1px solid oklch(0.64 0.24 5 / 0.2)' }}>
            <Sparkles size={14} /> AI Dating Coach
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-4" style={{ color: 'var(--foreground)' }}>
            Analyze Your <span className="italic" style={{ color: 'var(--primary)' }}>Chat</span>
          </h1>
          <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
            Upload a screenshot to get 4 perfect replies, a compatibility score, and expert strategy
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'oklch(0.6 0.18 160 / 0.08)', border: '1px solid oklch(0.6 0.18 160 / 0.3)' }}>
            <Crown size={19} style={{ color: 'oklch(0.6 0.18 160)', flexShrink: 0 }} />
            <p className="text-sm" style={{ color: 'oklch(0.6 0.18 160)' }}>{successMessage}</p>
          </div>
        )}

        <div className="mb-8 rounded-2xl p-4 flex items-center justify-between"
          style={isLimitReached
            ? { background: 'oklch(0.577 0.245 27.325 / 0.07)', border: '1px solid oklch(0.577 0.245 27.325 / 0.3)' }
            : { background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            {bannerIcon}
            <div>
              <p className="font-medium text-sm" style={{ color: isLimitReached ? 'oklch(0.577 0.245 27.325)' : 'var(--foreground)' }}>
                {bannerText}
              </p>
              {!isLimitReached && !isSubscribed && credits === 0 && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Resets at midnight</p>
              )}
            </div>
          </div>
          {isLimitReached && (
            <Link href="/pricing"
              className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-pill transition-transform hover:scale-105 shrink-0"
              style={{ background: 'var(--gradient-primary)' }}>
              Get Credits
            </Link>
          )}
        </div>

        <div className="rounded-3xl p-6 md:p-8 mb-6 shadow-soft" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <ImageUploader setImageFile={setImageFile} setImagePreview={setImagePreview} imagePreview={imagePreview} imageFile={imageFile} />

          {error && (
            <div className="mt-4 rounded-xl p-4 flex items-center gap-3"
              style={{ background: 'oklch(0.577 0.245 27.325 / 0.07)', border: '1px solid oklch(0.577 0.245 27.325 / 0.3)' }}>
              <AlertCircle size={17} style={{ color: 'oklch(0.577 0.245 27.325)', flexShrink: 0 }} />
              <p className="text-sm" style={{ color: 'oklch(0.577 0.245 27.325)' }}>{error}</p>
            </div>
          )}

          <button onClick={handleAnalyze}
            disabled={!imageFile || isAnalyzing || isLimitReached}
            className="mt-6 w-full rounded-full py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-pill hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            style={!imageFile || isLimitReached
              ? { background: 'var(--muted)', color: 'var(--muted-foreground)' }
              : { background: 'var(--gradient-primary)', color: 'white' }}>
            {isAnalyzing ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles size={19} /> Analyze My Chat</>
            )}
          </button>
        </div>

        <AnalysisResult result={result} isLoading={isAnalyzing} />
      </div>
    </main>
  )
}
