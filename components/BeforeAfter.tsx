'use client'

import { useLanguage } from '@/lib/language'

const translations = {
  en: {
    badge: 'The difference',
    heading: 'Before FlirtIQ vs After FlirtIQ',
    beforeLabel: 'WITHOUT FLIRTIQ',
    beforeTheirMsg: "Hey! How are you? 😊",
    beforeThought: "umm... 'I\\'m good you?' feels boring... what do I say??",
    beforeReply: "I'm good, you? 😊",
    beforeResult: 'Conversation died 💀',
    afterLabel: 'WITH FLIRTIQ',
    afterTheirMsg: "Hey! How are you? 😊",
    afterBadge: '✨ FlirtIQ • Analyzed in 3 seconds',
    afterStyles: ['Flirty', 'Confident', 'Funny', 'Sweet'],
    afterSelected: "Honestly? Better now that you asked 😏",
    afterResult: 'Date confirmed 🔥',
  },
  hi: {
    badge: 'Fark samjho',
    heading: 'FlirtIQ se pehle vs baad mein',
    beforeLabel: 'FLIRTIQ KE BINA',
    beforeTheirMsg: "Hey! Kaisi ho? 😊",
    beforeThought: "hmm... 'Theek hoon' bolun? Boring lagega... kya bolun??",
    beforeReply: "Theek hoon, tum batao? 😊",
    beforeResult: 'Baat khatam ho gayi 💀',
    afterLabel: 'FLIRTIQ KE SAATH',
    afterTheirMsg: "Hey! Kaisi ho? 😊",
    afterBadge: '✨ FlirtIQ • 3 seconds mein analyze kiya',
    afterStyles: ['Flirty', 'Confident', 'Funny', 'Sweet'],
    afterSelected: "Sachme? Tumse baat karke aur bhi better 😏",
    afterResult: 'Date pakki 🔥',
  },
}

export default function BeforeAfter() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <section className="py-20 px-4" id="compare">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-pink-400 text-sm font-semibold uppercase tracking-widest mb-3">{t.badge}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">{t.heading}</h2>
        </div>

        {/* Comparison grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BEFORE card */}
          <div className="bg-[#12121f] border border-red-500/20 rounded-2xl p-6 flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5 w-fit">
              <span className="text-red-400 text-xs font-bold tracking-wide">{t.beforeLabel} ❌</span>
            </div>

            {/* Their message bubble */}
            <div className="flex justify-start">
              <div className="bg-white/8 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%]">
                <p className="text-white text-sm">{t.beforeTheirMsg}</p>
              </div>
            </div>

            {/* User thought bubble */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-3 text-center">
              <p className="text-red-300/70 text-xs italic">{t.beforeThought}</p>
            </div>

            {/* Typed reply */}
            <div className="flex justify-end">
              <div className="bg-gray-600/40 border border-white/5 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
                <p className="text-gray-300 text-sm">{t.beforeReply}</p>
              </div>
            </div>

            {/* Result badge */}
            <div className="mt-auto pt-4 border-t border-white/5">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-center">
                <p className="text-red-400 font-semibold text-sm">{t.beforeResult}</p>
              </div>
            </div>
          </div>

          {/* AFTER card */}
          <div className="bg-[#12121f] border border-green-500/25 rounded-2xl p-6 flex flex-col gap-4 ring-1 ring-green-500/10">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5 w-fit">
              <span className="text-green-400 text-xs font-bold tracking-wide">{t.afterLabel} ✅</span>
            </div>

            {/* Their message bubble */}
            <div className="flex justify-start">
              <div className="bg-white/8 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%]">
                <p className="text-white text-sm">{t.afterTheirMsg}</p>
              </div>
            </div>

            {/* FlirtIQ analysis badge */}
            <div className="bg-gradient-to-r from-pink-500/10 to-purple-600/10 border border-pink-500/20 rounded-xl px-4 py-2.5 text-center">
              <p className="text-pink-400 text-xs font-semibold">{t.afterBadge}</p>
            </div>

            {/* 4 mini reply options */}
            <div className="grid grid-cols-2 gap-2">
              {t.afterStyles.map((style, i) => (
                <div
                  key={i}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold text-center border transition-all ${
                    style === 'Confident'
                      ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                      : 'bg-white/4 border-white/8 text-gray-400'
                  }`}
                >
                  {style}
                </div>
              ))}
            </div>

            {/* Selected reply */}
            <div className="flex justify-end">
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/30 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%]">
                <p className="text-white text-sm">{t.afterSelected}</p>
              </div>
            </div>

            {/* Result badge */}
            <div className="mt-auto pt-4 border-t border-white/5">
              <div className="bg-green-500/10 border border-green-500/25 rounded-xl px-4 py-2.5 text-center">
                <p className="text-green-400 font-semibold text-sm">{t.afterResult}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
