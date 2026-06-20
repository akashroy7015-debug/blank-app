'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/language'

const moments = [
  { emoji: '✨', en: 'What should I say first?',  hi: 'Pehla message kya bhejun?',   color: 'from-pink-500/20 to-purple-500/20',  border: 'border-pink-500/20',  tag: 'Starter'  },
  { emoji: '⏳', en: 'They replied late…',         hi: 'Late reply aaya hai…',         color: 'from-blue-500/20 to-cyan-500/20',    border: 'border-blue-500/20',   tag: 'Calm'     },
  { emoji: '📍', en: 'How do I ask to meet?',      hi: 'Date ke liye kaise puchu?',    color: 'from-orange-500/20 to-yellow-500/20',border: 'border-orange-500/20', tag: 'Bold'     },
  { emoji: '🔥', en: 'Make it a little flirty',    hi: 'Thoda flirty karna hai',       color: 'from-red-500/20 to-pink-500/20',     border: 'border-red-500/20',    tag: 'Flirty'   },
  { emoji: '🧠', en: 'The chat stalled',           hi: 'Baat ruk gayi hai',            color: 'from-purple-500/20 to-indigo-500/20',border: 'border-purple-500/20', tag: 'Strategy' },
  { emoji: '📸', en: 'Read my screenshot',         hi: 'Mera screenshot analyze karo', color: 'from-green-500/20 to-teal-500/20',   border: 'border-green-500/20',  tag: 'AI'       },
]

export default function MessageMoments() {
  const { lang } = useLanguage()

  const heading = lang === 'hi' ? 'Sabse common chat situations' : 'Most common message moments'
  const sub     = lang === 'hi'
    ? 'Apni situation choose karo — FlirtIQ perfect reply dega'
    : 'Pick your situation — FlirtIQ knows exactly what to say'

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-transparent to-white/[0.02]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-pink-400 text-sm font-semibold uppercase tracking-widest mb-3">💬 {lang === 'hi' ? 'Message Moments' : 'Message Moments'}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{heading}</h2>
          <p className="text-gray-400 text-lg">{sub}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {moments.map((m) => (
            <Link
              key={m.en}
              href="/dashboard"
              className={`group relative bg-gradient-to-br ${m.color} border ${m.border} rounded-2xl p-5 hover:scale-[1.02] transition-all cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-gray-300">{m.tag}</span>
              </div>
              <p className="text-white font-medium text-sm leading-snug">
                {lang === 'hi' ? m.hi : m.en}
              </p>
              <div className="mt-3 text-xs text-gray-500 group-hover:text-pink-400 transition-colors">
                {lang === 'hi' ? 'Try karo →' : 'Try this →'}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
