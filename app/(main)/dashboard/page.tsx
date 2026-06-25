'use client'

import { useState, useEffect } from 'react'
import ImageUploader from '@/components/ImageUploader'
import AnalysisResult from '@/components/AnalysisResult'
import OpenerGenerator from '@/components/OpenerGenerator'
import { FREE_LIMIT } from '@/lib/usage'
import { Sparkles, AlertCircle, Crown, Infinity, Coins, Lock, ImageIcon, MessageSquarePlus, Camera, CalendarDays, Zap } from 'lucide-react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'

type Mode = 'analyze' | 'opener'

interface AnalysisResultData {
  replies: { aura: string; cool: string; bold: string; gentleman: string }
  compatibilityScore: number
  strategyNote: string
  creditsUsed?: boolean
  freeTierCount?: number
}

// Sample demo image URL — a public placeholder chat screenshot for first-time users
const SAMPLE_HINT = 'Try uploading any chat screenshot from Tinder, Bumble, Hinge, Instagram DMs, or WhatsApp.'

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
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imageMime, setImageMime] = useState<string>('image/jpeg')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [mode, setMode] = useState<Mode>('analyze')
  const [plan, setPlan] = useState<string | null>(null)
  const [periodEnd, setPeriodEnd] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      setSuccessMessage('Payment successful! Your account has been updated.')
    }
    if (params.get('mode') === 'opener') {
      setMode('opener')
    }

    const checkSubscription = async () => {
      const supabase = createBrowserClient()
      if (!supabase) { setAuthChecked(true); return }
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setAuthChecked(true); return }

      setAccessToken(session.access_token)
      setIsLoggedIn(true)

      const { data } = await supabase
        .from('subscriptions')
        .select('status, credits, free_analyses_count, free_analyses_date, plan, current_period_end')
        .eq('user_id', session.user.id)
        .single()

      if (data?.status === 'active') setIsSubscribed(true)
      if ((data?.credits ?? 0) > 0) setCredits(data?.credits ?? 0)
      if (data?.plan) setPlan(data.plan)
      if (data?.current_period_end) setPeriodEnd(data.current_period_end)

      const today = new Date().toISOString().split('T')[0]
      const isToday = data?.free_analyses_date === today
      setUsageCount(isToday ? (data?.free_analyses_count ?? 0) : 0)
      setAuthChecked(true)
    }
    checkSubscription()
  }, [])

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
    })

  const handleAnalyze = async () => {
    if (!imageFile) { setError('Please upload a chat screenshot first.'); return }

    if (!isLoggedIn) {
      setError('Please sign in or create a free account to analyze your chat.')
      return
    }

    const hasAccess = isSubscribed || credits > 0 || usageCount < FREE_LIMIT
    if (!hasAccess) {
      setError('You have used all 3 free analyses for today. Buy credits or upgrade to continue.')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setResult(null)
    try {
      const base64Full = await getBase64(imageFile)
      const b64 = base64Full.split(',')[1]
      setImageBase64(b64)
      setImageMime(imageFile.type)

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({ imageBase64: b64, mimeType: imageFile.type }),
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Analysis failed. Please try again.')
      }
      const data = await response.json()
      setResult(data)

      if (data.creditsUsed) {
        setCredits(c => Math.max(0, c - 1))
      } else if (!isSubscribed && data.freeTierCount !== undefined) {
        setUsageCount(data.freeTierCount)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleRegenerate = async (key: string): Promise<string | null> => {
    if (!imageBase64 || !accessToken) return null
    try {
      const response = await fetch('/api/analyze/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify({ imageBase64, mimeType: imageMime, style: key }),
      })
      if (!response.ok) return null
      const data = await response.json()
      return data.reply ?? null
    } catch {
      return null
    }
  }

  const remaining = FREE_LIMIT - usageCount
  const isLimitReached = !isSubscribed && credits === 0 && usageCount >= FREE_LIMIT

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
            {mode === 'analyze'
              ? <>Analyze Your <span className="italic" style={{ color: 'var(--primary)' }}>Chat</span></>
              : <>Write an <span className="italic" style={{ color: 'var(--primary)' }}>Opener</span></>}
          </h1>
          <p className="text-lg mb-6" style={{ color: 'var(--muted-foreground)' }}>
            {mode === 'analyze'
              ? 'Upload a screenshot to get 4 perfect replies, a compatibility score, and expert strategy'
              : "Describe your match's profile and get 4 personalized opening lines — no screenshot needed"}
          </p>

          {/* Mode switcher */}
          <div className="inline-flex rounded-2xl p-1 gap-1" style={{ background: 'var(--muted)' }}>
            <button
              onClick={() => setMode('analyze')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={mode === 'analyze'
                ? { background: 'white', color: 'var(--foreground)', boxShadow: '0 2px 8px oklch(0 0 0 / 0.1)' }
                : { color: 'var(--muted-foreground)' }}>
              <Camera size={15} /> Analyze Chat
            </button>
            <button
              onClick={() => setMode('opener')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={mode === 'opener'
                ? { background: 'white', color: 'var(--foreground)', boxShadow: '0 2px 8px oklch(0 0 0 / 0.1)' }
                : { color: 'var(--muted-foreground)' }}>
              <MessageSquarePlus size={15} /> Write Opener
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'oklch(0.6 0.18 160 / 0.08)', border: '1px solid oklch(0.6 0.18 160 / 0.3)' }}>
            <Crown size={19} style={{ color: 'oklch(0.6 0.18 160)', flexShrink: 0 }} />
            <p className="text-sm" style={{ color: 'oklch(0.6 0.18 160)' }}>{successMessage}</p>
          </div>
        )}

        {!authChecked ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
          </div>
        ) : !isLoggedIn ? (
          <div className="rounded-3xl p-8 md:p-12 text-center shadow-soft" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'oklch(0.64 0.24 5 / 0.1)' }}>
              <Lock size={24} style={{ color: 'var(--primary)' }} />
            </div>
            <h2 className="font-display text-2xl md:text-3xl mb-3" style={{ color: 'var(--foreground)' }}>
              Create a free account to start
            </h2>
            <p className="text-sm md:text-base mb-7 max-w-md mx-auto" style={{ color: 'var(--muted-foreground)' }}>
              Sign up free to get <strong>3 analyses every day</strong> — no card required. Your usage and credits stay synced to your account across all your devices.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/auth/signup"
                className="w-full sm:w-auto rounded-full px-7 py-3 text-sm font-semibold text-white shadow-pill transition-transform hover:scale-105"
                style={{ background: 'var(--gradient-primary)' }}>
                Sign Up Free
              </Link>
              <Link href="/auth/login"
                className="w-full sm:w-auto rounded-full px-7 py-3 text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: 'var(--muted)', color: 'var(--foreground)' }}>
                Log In
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Account Status Card */}
            <div className="mb-6 rounded-2xl p-5 shadow-soft" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Account Status</h2>
                {!isSubscribed && (
                  <Link href="/pricing"
                    className="text-xs font-semibold rounded-full px-3 py-1.5 text-white shadow-pill transition-transform hover:scale-105"
                    style={{ background: 'var(--gradient-primary)' }}>
                    Upgrade
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {/* Plan */}
                <div className="rounded-xl p-3 text-center" style={{ background: 'var(--muted)' }}>
                  <div className="flex justify-center mb-1.5">
                    <Crown size={16} style={{ color: isSubscribed ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                  </div>
                  <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Plan</p>
                  <p className="font-bold text-sm capitalize" style={{ color: 'var(--foreground)' }}>
                    {isSubscribed && plan ? plan.charAt(0).toUpperCase() + plan.slice(1) + ' Pro' : 'Free'}
                  </p>
                </div>

                {/* Days left / renewal */}
                <div className="rounded-xl p-3 text-center" style={{ background: 'var(--muted)' }}>
                  <div className="flex justify-center mb-1.5">
                    <CalendarDays size={16} style={{ color: isSubscribed ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                  </div>
                  <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
                    {isSubscribed ? 'Renews in' : 'Resets in'}
                  </p>
                  <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>
                    {isSubscribed && periodEnd
                      ? (() => {
                          const days = Math.max(0, Math.ceil((new Date(periodEnd).getTime() - Date.now()) / 86400000))
                          return days === 0 ? 'Today' : `${days}d`
                        })()
                      : (() => {
                          const now = new Date()
                          const midnight = new Date(now)
                          midnight.setHours(24, 0, 0, 0)
                          const hrs = Math.ceil((midnight.getTime() - now.getTime()) / 3600000)
                          return `${hrs}h`
                        })()
                    }
                  </p>
                </div>

                {/* Credits / analyses */}
                <div className="rounded-xl p-3 text-center" style={{ background: 'var(--muted)' }}>
                  <div className="flex justify-center mb-1.5">
                    {isSubscribed
                      ? <Infinity size={16} style={{ color: 'var(--primary)' }} />
                      : credits > 0
                        ? <Coins size={16} style={{ color: 'oklch(0.7 0.19 55)' }} />
                        : <Zap size={16} style={{ color: 'var(--muted-foreground)' }} />}
                  </div>
                  <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
                    {isSubscribed ? 'Analyses' : credits > 0 ? 'Credits' : 'Free left'}
                  </p>
                  <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>
                    {isSubscribed ? '∞' : credits > 0 ? credits : `${remaining}/${FREE_LIMIT}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Usage banner (limit reached only) */}
            {isLimitReached && (
              <div className="mb-6 rounded-2xl p-4 flex items-center justify-between"
                style={{ background: 'oklch(0.577 0.245 27.325 / 0.07)', border: '1px solid oklch(0.577 0.245 27.325 / 0.3)' }}>
                <div className="flex items-center gap-3">
                  <AlertCircle size={19} style={{ color: 'oklch(0.577 0.245 27.325)', flexShrink: 0 }} />
                  <p className="font-medium text-sm" style={{ color: 'oklch(0.577 0.245 27.325)' }}>
                    Daily limit reached — buy credits or upgrade to continue
                  </p>
                </div>
                <Link href="/pricing"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-pill transition-transform hover:scale-105 shrink-0"
                  style={{ background: 'var(--gradient-primary)' }}>
                  Get Credits
                </Link>
              </div>
            )}

            {mode === 'analyze' ? (
              <>
                <div className="rounded-3xl p-6 md:p-8 mb-6 shadow-soft" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <ImageUploader setImageFile={setImageFile} setImagePreview={setImagePreview} imagePreview={imagePreview} imageFile={imageFile} />

                  {!imageFile && !result && (
                    <div className="mt-4 flex items-start gap-2">
                      <ImageIcon size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0, marginTop: 2 }} />
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{SAMPLE_HINT}</p>
                    </div>
                  )}

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

                <AnalysisResult
                  result={result}
                  isLoading={isAnalyzing}
                  onRegenerate={result ? handleRegenerate : undefined}
                />
              </>
            ) : (
              <OpenerGenerator
                accessToken={accessToken}
                onUsageUpdate={(count) => setUsageCount(count)}
                onCreditUsed={() => setCredits(c => Math.max(0, c - 1))}
              />
            )}
          </>
        )}
      </div>
    </main>
  )
}
