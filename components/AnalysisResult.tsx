'use client'

import { useState, useEffect, useRef } from 'react'
import { Copy, Check, Lightbulb, Heart, Zap, Smile, Star } from 'lucide-react'
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

interface AnalysisResultProps {
  result: AnalysisResultData | null
  isLoading: boolean
}

interface ReplyCard {
  key: keyof AnalysisResultData['replies']
  label: string
  emoji: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  gradient: string
  iconColor: string
  borderColor: string
}

const replyCards: ReplyCard[] = [
  {
    key: 'flirty',
    label: 'Flirty',
    emoji: '💋',
    icon: Heart,
    gradient: 'from-pink-500/10 to-pink-600/5',
    iconColor: 'text-pink-400',
    borderColor: 'border-pink-500/20',
  },
  {
    key: 'confident',
    label: 'Confident',
    emoji: '⚡',
    icon: Zap,
    gradient: 'from-blue-500/10 to-blue-600/5',
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
  },
  {
    key: 'funny',
    label: 'Funny',
    emoji: '😄',
    icon: Smile,
    gradient: 'from-yellow-500/10 to-orange-600/5',
    iconColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/20',
  },
  {
    key: 'sweet',
    label: 'Sweet',
    emoji: '🌸',
    icon: Star,
    gradient: 'from-green-500/10 to-teal-600/5',
    iconColor: 'text-green-400',
    borderColor: 'border-green-500/20',
  },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
      title="Copy to clipboard"
    >
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
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

    // Count up animation
    const duration = 1500
    const steps = 60
    const increment = score / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setDisplayScore(score)
        setWidth(score)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.floor(current))
        setWidth(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score])

  const getScoreColor = () => {
    if (score >= 75) return 'from-green-400 to-emerald-500'
    if (score >= 50) return 'from-yellow-400 to-orange-500'
    return 'from-pink-500 to-purple-600'
  }

  const getScoreLabel = () => {
    if (score >= 80) return 'High Chemistry 🔥'
    if (score >= 60) return 'Good Vibes ✨'
    if (score >= 40) return 'Some Interest 💭'
    return 'Keep Going 💪'
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-gray-400 text-sm font-medium">Conversation Vibe</p>
          <p className="text-white text-xs mt-0.5">{getScoreLabel()}</p>
        </div>
        <div className={clsx('text-5xl font-extrabold bg-gradient-to-r bg-clip-text text-transparent score-animate', getScoreColor())}>
          {displayScore}%
        </div>
      </div>
      <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
        <div
          className={clsx('h-full rounded-full bg-gradient-to-r transition-all', getScoreColor())}
          style={{ width: `${width}%`, transition: 'width 0.05s linear' }}
        />
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#12121f] border border-white/8 rounded-2xl p-5 h-32">
            <div className="w-16 h-3 bg-white/10 rounded mb-3" />
            <div className="w-full h-3 bg-white/5 rounded mb-2" />
            <div className="w-4/5 h-3 bg-white/5 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-[#12121f] border border-white/8 rounded-2xl p-6">
        <div className="w-32 h-4 bg-white/10 rounded mb-4" />
        <div className="w-full h-3 bg-white/5 rounded mb-2" />
        <div className="w-full h-10 bg-white/5 rounded-full" />
      </div>
      <div className="bg-[#12121f] border border-white/8 rounded-2xl p-6">
        <div className="w-24 h-4 bg-white/10 rounded mb-4" />
        <div className="w-full h-3 bg-white/5 rounded mb-2" />
        <div className="w-3/4 h-3 bg-white/5 rounded" />
      </div>
    </div>
  )
}

export default function AnalysisResult({ result, isLoading }: AnalysisResultProps) {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!result) {
    return null
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Reply Cards */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Your 4 Perfect Replies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {replyCards.map((card) => {
            const Icon = card.icon
            const replyText = result.replies[card.key]
            return (
              <div
                key={card.key}
                className={clsx(
                  'bg-gradient-to-br rounded-2xl p-5 border',
                  card.gradient,
                  card.borderColor
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className={card.iconColor} />
                    <span className={clsx('text-xs font-bold uppercase tracking-wide', card.iconColor)}>
                      {card.label}
                    </span>
                  </div>
                  <CopyButton text={replyText} />
                </div>
                <p className="text-white text-sm leading-relaxed">
                  &ldquo;{replyText}&rdquo;
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Compatibility Score */}
      <div className="bg-[#12121f] border border-white/8 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-5">Compatibility Score</h2>
        <ScoreBar score={result.compatibilityScore} />
      </div>

      {/* Strategy Tip */}
      <div className="bg-[#12121f] border border-white/8 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Lightbulb size={20} className="text-yellow-400" />
          Expert Strategy Tip
        </h2>
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
          <p className="text-gray-300 text-sm leading-relaxed">{result.strategyTip}</p>
        </div>
      </div>
    </div>
  )
}
