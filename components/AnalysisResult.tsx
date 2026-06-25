'use client'

import { useState, useEffect, useRef } from 'react'
import { Copy, Check, Lightbulb, LucideIcon, Heart, Zap, Flame, Sparkles, RefreshCw, CopyCheck } from 'lucide-react'

interface AnalysisResultData {
  replies: { aura: string; cool: string; bold: string; gentleman: string }
  compatibilityScore: number
  strategyNote: string
}

interface ReplyCard {
  key: keyof AnalysisResultData['replies']
  label: string
  icon: LucideIcon
  bgGradient: string
  borderColor: string
  iconColor: string
}

interface AnalysisResultProps {
  result: AnalysisResultData | null
  isLoading: boolean
  onRegenerate?: (key: string) => Promise<string | null>
}

const replyCards: ReplyCard[] = [
  { key: 'aura',      label: 'Aura',      icon: Sparkles, bgGradient: 'from-violet-50 to-purple-50',  borderColor: 'oklch(0.88 0.06 290)', iconColor: 'oklch(0.6 0.22 290)'  },
  { key: 'cool',      label: 'Cool',      icon: Zap,      bgGradient: 'from-sky-50 to-cyan-50',       borderColor: 'oklch(0.88 0.05 220)', iconColor: 'oklch(0.6 0.17 220)'  },
  { key: 'bold',      label: 'Bold',      icon: Flame,    bgGradient: 'from-orange-50 to-amber-50',   borderColor: 'oklch(0.9 0.09 60)',   iconColor: 'oklch(0.65 0.2 40)'   },
  { key: 'gentleman', label: 'Gentleman', icon: Heart,    bgGradient: 'from-rose-50 to-pink-50',      borderColor: 'oklch(0.88 0.08 5)',   iconColor: 'oklch(0.64 0.24 5)'   },
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
      aria-label={copied ? 'Copied to clipboard' : 'Copy reply to clipboard'}
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
      <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: 'var(--muted)' }}
        role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}
        aria-label={`Compatibility score: ${score} percent`}>
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

export default function AnalysisResult({ result, isLoading, onRegenerate }: AnalysisResultProps) {
  const [replies, setReplies] = useState<AnalysisResultData['replies'] | null>(null)
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  useEffect(() => {
    if (result) setReplies(result.replies)
  }, [result])

  if (isLoading) return <LoadingSkeleton />
  if (!result || !replies) return null

  const handleRegenerate = async (key: string) => {
    if (!onRegenerate || regeneratingKey) return
    setRegeneratingKey(key)
    try {
      const newReply = await onRegenerate(key)
      if (newReply) {
        setReplies(prev => prev ? { ...prev, [key]: newReply } : prev)
      }
    } finally {
      setRegeneratingKey(null)
    }
  }

  const handleCopyAll = async () => {
    const allReplies = replyCards.map(c => `${c.label}: "${replies[c.key]}"`).join('\n\n')
    try {
      await navigator.clipboard.writeText(allReplies)
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    } catch { /* noop */ }
  }

  return (
    <div className="space-y-6">
      {/* Reply Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Your 4 Perfect Replies</h2>
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', background: 'var(--card)' }}
            aria-label={copiedAll ? 'All replies copied' : 'Copy all replies to clipboard'}>
            {copiedAll
              ? <><CopyCheck size={12} style={{ color: 'oklch(0.6 0.18 160)' }} /><span style={{ color: 'oklch(0.6 0.18 160)' }}>Copied!</span></>
              : <><Copy size={12} />Copy All</>}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {replyCards.map((card) => {
            const Icon = card.icon
            const isRegenerating = regeneratingKey === card.key
            return (
              <div key={card.key} className={`card-hover rounded-2xl p-5 bg-gradient-to-br ${card.bgGradient} ${isRegenerating ? 'opacity-60' : ''}`}
                style={{ border: `1px solid ${card.borderColor}`, borderLeft: `4px solid ${card.iconColor}`, boxShadow: 'var(--shadow-soft)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon size={15} style={{ color: card.iconColor }} />
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: card.iconColor }}>{card.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {onRegenerate && (
                      <button
                        onClick={() => handleRegenerate(card.key)}
                        disabled={!!regeneratingKey}
                        className="p-1.5 rounded-lg transition-all hover:opacity-70 disabled:cursor-not-allowed"
                        style={{ color: 'var(--muted-foreground)' }}
                        aria-label={`Regenerate ${card.label} reply`}
                        title="Get a different reply">
                        <RefreshCw size={13} className={isRegenerating ? 'animate-spin' : ''} />
                      </button>
                    )}
                    <CopyButton text={replies[card.key]} />
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
                  {isRegenerating
                    ? <span className="italic" style={{ color: 'var(--muted-foreground)' }}>Getting a fresh reply…</span>
                    : <>&ldquo;{replies[card.key]}&rdquo;</>}
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

      {/* Strategy Note */}
      <div className="rounded-2xl p-6 shadow-soft" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
          <Lightbulb size={19} style={{ color: 'oklch(0.7 0.19 55)' }} />
          Strategy Note
        </h2>
        <div className="rounded-xl p-4" style={{ background: 'oklch(0.7 0.19 55 / 0.06)', border: '1px solid oklch(0.7 0.19 55 / 0.25)' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{result.strategyNote}</p>
        </div>
      </div>
    </div>
  )
}
