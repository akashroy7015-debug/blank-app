'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, Heart, Zap, Star } from 'lucide-react'
import { useLanguage } from '@/lib/language'

const translations = {
  en: {
    badge: 'Powered by Gemini AI',
    heading1: 'Your AI',
    heading2: 'Dating Coach',
    subheading: 'Upload a chat screenshot — get 4 perfect replies, a compatibility score, and expert dating strategy. Works on Tinder, Bumble, Hinge, Instagram, WhatsApp & more.',
    cta: 'Try It Free',
    secondaryCta: 'See Pricing',
    stat1: { value: '10K+', label: 'Analyses Done' },
    stat2: { value: 'All Apps', label: 'Supported' },
    stat3: { value: 'Free', label: 'To Start' },
    compatLabel: 'Compatibility Score',
  },
  hi: {
    badge: 'Gemini AI se Powered',
    heading1: 'Tumhara AI',
    heading2: 'Dating Coach',
    subheading: 'Screenshot daalo, perfect reply pao. Tinder, Bumble, Hinge, TrulyMadly, Aisle, Instagram DMs — sab pe kaam karta hai.',
    cta: 'Free Mein Try Karo',
    secondaryCta: 'Pricing Dekho',
    stat1: { value: '10K+', label: 'Analyses Ho Chuke' },
    stat2: { value: 'Sab Apps', label: 'Pe Kaam Kare' },
    stat3: { value: 'Free', label: 'Mein Shuru' },
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
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 rounded-full px-4 py-2 text-pink-400 text-sm font-medium mb-8">
          <Sparkles size={14} />
          {text.badge}
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            {text.heading1}
          </span>
          <br />
          {text.heading2}
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {text.subheading}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="group bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl px-8 py-4 text-lg transition-all glow-pink flex items-center gap-2"
          >
            {text.cta}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/pricing"
            className="text-gray-300 hover:text-white font-semibold border border-white/10 hover:border-white/20 rounded-xl px-8 py-4 text-lg transition-all"
          >
            {text.secondaryCta}
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-16 mb-20">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{text.stat1.value}</div>
            <div className="text-gray-500 text-sm">{text.stat1.label}</div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-white/10" />
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{text.stat2.value}</div>
            <div className="text-gray-500 text-sm">{text.stat2.label}</div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-white/10" />
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{text.stat3.value}</div>
            <div className="text-gray-500 text-sm">{text.stat3.label}</div>
          </div>
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
