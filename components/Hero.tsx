'use client'

import Link from 'next/link'
import { ArrowRight, Heart, Zap, Star } from 'lucide-react'
import { useLanguage } from '@/lib/language'

const translations = {
  en: {
    counter: 'people writing smarter right now',
    heading1: 'You matched.',
    heading2: 'Now what?',
    subheading: 'Upload your chat screenshot — FlirtIQ reads the tone, gives you 4 perfect replies and a compatibility score. Works on Tinder, Bumble, Hinge, Instagram, WhatsApp & more.',
    cta: 'Try It Free →',
    secondaryCta: 'See how it works',
    stats: [
      { value: '10M+', label: 'Replies Generated' },
      { value: '4', label: 'Reply Styles' },
      { value: 'Free', label: 'to Start' },
      { value: '★4.8', label: 'Rating' },
    ],
    compatLabel: 'Compatibility Score',
  },
  hi: {
    counter: 'log abhi smarter messages likh rahe hain',
    heading1: 'Match ho gaya.',
    heading2: 'Ab kya?',
    subheading: 'Screenshot daalo — FlirtIQ tone padhega, 4 perfect replies dega aur compatibility score batayega. Tinder, Bumble, Hinge, TrulyMadly, Aisle, Insta sab pe kaam karta hai.',
    cta: 'Free Mein Try Karo →',
    secondaryCta: 'Kaise kaam karta hai',
    stats: [
      { value: '10M+', label: 'Replies Bane' },
      { value: '4', label: 'Reply Styles' },
      { value: 'Free', label: 'Mein Shuru' },
      { value: '★4.8', label: 'Rating' },
    ],
    compatLabel: 'Compatibility Score',
  },
}

export default function Hero() {
  const { lang } = useLanguage()
  const text = translations[lang]

  return (
    <section className="relative overflow-hidden py-20 md:py-32 px-4">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto text-center">
        {/* Live counter */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <p className="text-gray-400 text-sm">
            <span className="text-white font-semibold">17,130</span>{' '}
            {text.counter}
          </p>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            {text.heading1}
          </span>
          <br />
          <span className="text-white">{text.heading2}</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {text.subheading}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Link
            href="/dashboard"
            className="group bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-xl px-8 py-4 text-lg transition-all shadow-lg shadow-pink-500/25 flex items-center gap-2"
          >
            {text.cta}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/#features"
            className="text-gray-300 hover:text-white font-semibold border border-white/10 hover:border-white/20 rounded-xl px-8 py-4 text-lg transition-all"
          >
            {text.secondaryCta}
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 mb-20">
          {text.stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-3">
              {i > 0 && <div className="hidden sm:block w-px h-8 bg-white/10" />}
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-gray-500 text-xs mt-0.5">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Mock UI — decorative reply card preview */}
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080f] to-transparent z-10 pointer-events-none rounded-2xl" />
          <div className="bg-[#12121f] border border-white/8 rounded-2xl p-6 text-left">
            {/* Mock compatibility score */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-400 text-sm font-medium">{text.compatLabel}</span>
              <span className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">82%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 mb-6">
              <div className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600" style={{ width: '82%' }} />
            </div>

            {/* Mock reply cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart size={14} className="text-pink-400" />
                  <span className="text-pink-400 text-xs font-semibold">FLIRTY</span>
                </div>
                <p className="text-white text-sm">&ldquo;You&apos;re making it really hard to focus on anything else 😏&rdquo;</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-blue-400" />
                  <span className="text-blue-400 text-xs font-semibold">CONFIDENT</span>
                </div>
                <p className="text-white text-sm">&ldquo;I know exactly where this is going, and I like it&rdquo;</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-600/5 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-400 text-sm">😄</span>
                  <span className="text-yellow-400 text-xs font-semibold">FUNNY</span>
                </div>
                <p className="text-white text-sm">&ldquo;My dog said you seem cool, and he&apos;s a great judge of character&rdquo;</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-teal-600/5 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={14} className="text-green-400" />
                  <span className="text-green-400 text-xs font-semibold">SWEET</span>
                </div>
                <p className="text-white text-sm">&ldquo;Honestly, talking to you is the best part of my day&rdquo;</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
