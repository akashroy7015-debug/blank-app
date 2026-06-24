'use client'

import { useState } from 'react'
import { Sparkles, AlertCircle, Copy, Check, Lightbulb, Heart, Zap, Flame, RefreshCw, CopyCheck } from 'lucide-react'

interface OpenerResult {
  replies: { aura: string; cool: string; bold: string; gentleman: string }
  tip: string
}

const PLATFORMS = ['Tinder', 'Bumble', 'Hinge', 'Instagram', 'WhatsApp', 'OkCupid', 'Other']

const replyCards = [
  { key: 'aura'      as const, label: 'Aura',      Icon: Sparkles, color: 'oklch(0.6 0.22 290)',  bg: 'from-violet-50 to-purple-50',  border: 'oklch(0.88 0.06 290)' },
  { key: 'cool'      as const, label: 'Cool',      Icon: Zap,      color: 'oklch(0.6 0.17 220)',  bg: 'from-sky-50 to-cyan-50',       border: 'oklch(0.88 0.05 220)' },
  { key: 'bold'      as const, label: 'Bold',      Icon: Flame,    color: 'oklch(0.65 0.2 40)',   bg: 'from-orange-50 to-amber-50',   border: 'oklch(0.9 0.09 60)'   },
  { key: 'gentleman' as const, label: 'Gentleman', Icon: Heart,    color: 'oklch(0.64 0.24 5)',   bg: 'from-rose-50 to-pink-50',      border: 'oklch(0.88 0.08 5)'   },
]

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* noop */ }
  }
  return (
    <button onClick={handleCopy} aria-label={copied ? 'Copied' : 'Copy'} title="Copy"
      className="p-1.5 rounded-lg transition-all hover:opacity-70" style={{ color: 'var(--muted-foreground)' }}>
      {copied ? <Check size={14} style={{ color: 'oklch(0.6 0.18 160)' }} /> : <Copy size={14} />}
    </button>
  )
}

interface Props {
  accessToken: string | null
  onUsageUpdate: (count: number) => void
}

export default function OpenerGenerator({ accessToken, onUsageUpdate }: Props) {
  const [name, setName] = useState('')
  const [platform, setPlatform] = useState('')
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState('')
  const [photoDesc, setPhotoDesc] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<OpenerResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  const handleGenerate = async () => {
    if (!bio && !interests && !name && !photoDesc) {
      setError('Add at least one detail about your match to get personalized openers.')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`
      const res = await fetch('/api/opener', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name, platform, bio, interests, photoDesc }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to generate openers.')
      }
      const data = await res.json()
      setResult(data)
      if (data.freeTierCount !== undefined) onUsageUpdate(data.freeTierCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyAll = async () => {
    if (!result) return
    const all = replyCards.map(c => `${c.label}: "${result.replies[c.key]}"`).join('\n\n')
    try { await navigator.clipboard.writeText(all); setCopiedAll(true); setTimeout(() => setCopiedAll(false), 2000) } catch { /* noop */ }
  }

  const canGenerate = !!(bio || interests || name || photoDesc)

  return (
    <div className="space-y-6">
      {/* Input form */}
      <div className="rounded-3xl p-6 md:p-8 shadow-soft" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Match name */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
              Their name <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Sofia"
              maxLength={50}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid transparent' }}
              onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.target.style.borderColor = 'transparent')}
            />
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
              Platform <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>(optional)</span>
            </label>
            <select
              value={platform}
              onChange={e => setPlatform(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: 'var(--muted)', color: platform ? 'var(--foreground)' : 'var(--muted-foreground)', border: '1px solid transparent' }}
            >
              <option value="">Select a platform…</option>
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
              Their bio / about section
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="e.g. Dog mom. Hiking obsessed. Looking for someone to watch terrible reality TV with 😂"
              rows={3}
              maxLength={500}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
              style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid transparent' }}
              onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.target.style.borderColor = 'transparent')}
            />
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
              Interests / hobbies shown
            </label>
            <input
              type="text"
              value={interests}
              onChange={e => setInterests(e.target.value)}
              placeholder="e.g. hiking, cooking, K-pop, yoga"
              maxLength={200}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid transparent' }}
              onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.target.style.borderColor = 'transparent')}
            />
          </div>

          {/* Photo description */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
              Profile photo description
            </label>
            <input
              type="text"
              value={photoDesc}
              onChange={e => setPhotoDesc(e.target.value)}
              placeholder="e.g. hiking in mountains, with a golden retriever"
              maxLength={200}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid transparent' }}
              onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.target.style.borderColor = 'transparent')}
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl p-4 flex items-center gap-3"
            style={{ background: 'oklch(0.577 0.245 27.325 / 0.07)', border: '1px solid oklch(0.577 0.245 27.325 / 0.3)' }}>
            <AlertCircle size={17} style={{ color: 'oklch(0.577 0.245 27.325)', flexShrink: 0 }} />
            <p className="text-sm" style={{ color: 'oklch(0.577 0.245 27.325)' }}>{error}</p>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!canGenerate || isLoading}
          className="mt-6 w-full rounded-full py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-pill hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
          style={!canGenerate
            ? { background: 'var(--muted)', color: 'var(--muted-foreground)' }
            : { background: 'var(--gradient-primary)', color: 'white' }}>
          {isLoading
            ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Crafting openers…</>
            : <><Sparkles size={19} /> Write My Opener</>}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Your 4 Opening Lines</h2>
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', background: 'var(--card)' }}>
              {copiedAll
                ? <><CopyCheck size={12} style={{ color: 'oklch(0.6 0.18 160)' }} /><span style={{ color: 'oklch(0.6 0.18 160)' }}>Copied!</span></>
                : <><Copy size={12} />Copy All</>}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {replyCards.map(({ key, label, Icon, color, bg, border }) => (
              <div key={key} className={`rounded-2xl p-5 bg-gradient-to-br ${bg}`} style={{ border: `1px solid ${border}` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon size={15} style={{ color }} />
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>{label}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={handleGenerate}
                      disabled={isLoading}
                      className="p-1.5 rounded-lg transition-all hover:opacity-70 disabled:cursor-not-allowed"
                      style={{ color: 'var(--muted-foreground)' }}
                      aria-label={`Regenerate ${label} opener`}
                      title="Get a different opener">
                      <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <CopyBtn text={result.replies[key]} />
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
                  &ldquo;{result.replies[key]}&rdquo;
                </p>
              </div>
            ))}
          </div>

          {result.tip && (
            <div className="rounded-2xl p-6 shadow-soft" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <Lightbulb size={17} style={{ color: 'oklch(0.7 0.19 55)' }} /> Conversation Tip
              </h3>
              <div className="rounded-xl p-4" style={{ background: 'oklch(0.7 0.19 55 / 0.06)', border: '1px solid oklch(0.7 0.19 55 / 0.25)' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{result.tip}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
