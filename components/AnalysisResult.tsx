'use client'

import { useState, useEffect, useRef } from 'react'
import { Copy, Check, Lightbulb, LucideIcon, Heart, Zap, Smile, Star } from 'lucide-react'

interface AnalysisResultData {
  replies: { flirty: string; confident: string; funny: string; sweet: string }
  compatibilityScore: number
  strategyTip: string
}

interface ReplyCard {
  key: keyof AnalysisResultData['replies']
  label: string
  icon: LucideIcon
  bgGradient: string
  borderColor: string
  iconColor: string
}

const replyCards: ReplyCard[] = [
  { key: 'flirty',    label: 'Flirty',     icon: Heart, bgGradient: 'from-rose-50 to-pink-50',   borderColor: 'oklch(0.88 0.08 5)',    iconColor: 'oklch(0.64 0.24 5)'   },
  { key: 'confident', label: 'Confident',  icon: Zap,   bgGradient: 'from-violet-50 to-fuchsia-50', borderColor: 'oklch(0.88 0.06 290)', iconColor: 'oklch(0.6 0.22 290)'  },
  { key: 'funny',     label: 'Funny',      icon: Smile, bgGradient: 'from-amber-50 to-orange-50',  borderColor: 'oklch(0.9 0.09 60)',   iconColor: 'oklch(0.7 0.19 55)'   },
  { key: 'sweet',     label: 'Sweet',      icon: Star,  bgGradient: 'from-emerald-50 to-teal-50',  borderColor: 'oklch(0.88 0.06 160)', iconColor: 'oklch(0.6 0.18 160)'  },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* noop */ }
  }

  return (
    <button onClick={handleCopy}
      className="p-1.5 rounded-lg transition-all hover:opacity-70"
      style={{ color: 'var(--muted-foreground)' }}
      title="Copy to clipboard">
      {copied ? <Check size={14} style={{ color: 'oklch(0.6 0.18 160)' }} /> : <Copy size={14} />}
    </button>
  )
}

function ScoreBar({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0)
  const [width, setWidth] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true
    const steps = 60
    const increment = score / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= score) { setDisplayScore(score); setWidth(score); clearInterval(timer) }
      else { setDisplayScore(Math.floor(current)); setWidth(current) }
    }, 1500 / steps)
    return () => clearInterval(timer)
  }, [score])

  const scoreGradient = score >= 75 ? 'from-emerald-400 to-green-500' : score >= 50 ? 'from-amber-400 to-orange-500' : 'from-rose-500 to-pink-600'
  const scoreLabel = score >= 80 ? 'High Chemistry 🔥' : score >= 60 ? 'Good Vibes ✨' : score >= 40 ? 'Some Interest 💭' : 'Keep Going 💪'

  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>Conversation Vibe</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--foreground)' }}>{scoreLabel}</p>
        </div>
        <div className={`text-5xl font-extrabold bg-gradient-to-r ${scoreGradient} bg-clip-text text-transparent score-animate`}>
          {displayScore}%
        </div>
      </div>
      <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: 'var(--muted)' }}>
        <div className={`h-full rounded-full bg-gradient-to-r ${scoreGradient}`}
          style={{ width: `${width}%`, transition: 'width 0.05s linear' }} />
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl p-5 h-32" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} />
        ))}
      </div>
      {[...Array(2)].map((_, i) => (
        <div key={i} className="rounded-2xl p-6 h-28" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} />
      ))}
    </div>
  )
}

export default function AnalysisResult({ result, isLoading }: { result: AnalysisResultData | null; isLoading: boolean }) {
  if (isLoading) return <LoadingSkeleton />
  if (!result) return null

  return (
    <div className="space-y-6">
      {/* Reply Cards */}
      <div>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Your 4 Perfect Replies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {replyCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.key} className={`rounded-2xl p-5 bg-gradient-to-br ${card.bgGradient}`}
                style={{ border: `1px solid ${card.borderColor}` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon size={15} style={{ color: card.iconColor }} />
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: card.iconColor }}>{card.label}</span>
                  </div>
                  <CopyButton text={result.replies[card.key]} />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
                  &ldquo;{result.replies[card.key]}&rdquo;
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Compatibility Score */}
      <div className="rounded-2xl p-6 shadow-soft" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-5" style={{ color: 'var(--foreground)' }}>Compatibility Score</h2>
        <ScoreBar score={result.compatibilityScore} />
      </div>

      {/* Strategy Tip */}
      <div className="rounded-2xl p-6 shadow-soft" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
          <Lightbulb size={19} style={{ color: 'oklch(0.7 0.19 55)' }} />
          Expert Strategy Tip
        </h2>
        <div className="rounded-xl p-4" style={{ background: 'oklch(0.7 0.19 55 / 0.06)', border: '1px solid oklch(0.7 0.19 55 / 0.25)' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{result.strategyTip}</p>
        </div>
      </div>
    </div>
  )
}
