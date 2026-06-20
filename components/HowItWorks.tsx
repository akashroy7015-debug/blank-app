'use client'

import { Camera, Sparkles, MessageSquare, Heart } from 'lucide-react'
import { useLanguage } from '@/lib/language'

const translations = {
  en: {
    badge: 'How It Works',
    heading: 'Perfect Replies in 3 Steps',
    subheading: 'Works on every dating and messaging app worldwide — any language, any conversation.',
    steps: [
      {
        emoji: '📸',
        icon: Camera,
        title: 'Upload Screenshot',
        desc: 'Take a screenshot of any chat — Tinder, Bumble, Hinge, OkCupid, TrulyMadly, Aisle, Instagram DMs, WhatsApp — and upload it here.',
      },
      {
        emoji: '🤖',
        icon: Sparkles,
        title: 'AI Analyzes',
        desc: 'Gemini Vision reads the conversation tone, interest level, and context. Works in any language — English, Hindi, Hinglish, Spanish, French, and more.',
      },
      {
        emoji: '💬',
        icon: MessageSquare,
        title: 'Copy & Send',
        desc: '4 reply styles + compatibility score + expert strategy tip, ready to copy and send. Never wonder what to say again.',
      },
    ],
    appLabel: 'Works on:',
    apps: ['Tinder', 'Bumble', 'Hinge', 'OkCupid', 'TrulyMadly', 'Aisle', 'Instagram DMs', 'WhatsApp'],
  },
  hi: {
    badge: 'Kaise Kaam Karta Hai',
    heading: 'Teen Steps Mein Perfect Reply',
    subheading: 'Bumble India, Tinder, TrulyMadly, Aisle, Instagram DMs, WhatsApp — sab pe kaam karta hai.',
    steps: [
      {
        emoji: '📸',
        icon: Camera,
        title: 'Screenshot Upload Karo',
        desc: 'Bumble India, Tinder, TrulyMadly, Aisle, Instagram DMs ya WhatsApp ka screenshot lo aur yahan upload karo.',
      },
      {
        emoji: '🤖',
        icon: Sparkles,
        title: 'AI Analyse Karega',
        desc: 'Gemini Vision conversation ki vibe samjhega aur tumhare liye English ya Hinglish mein perfect replies banayega.',
      },
      {
        emoji: '💬',
        icon: MessageSquare,
        title: 'Copy Karo & Bhejo',
        desc: '4 reply styles + compatibility score + expert tip — sab ready milega. Apna reply copy karo aur bhejo! 😉',
      },
    ],
    appLabel: 'Kaam karta hai:',
    apps: ['Bumble India', 'Tinder', 'TrulyMadly', 'Aisle', 'Instagram DMs', 'WhatsApp'],
  },
}

export default function HowItWorks() {
  const { lang } = useLanguage()
  const text = translations[lang]

  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 text-purple-400 text-sm font-medium mb-4">
            <Heart size={14} />
            {text.badge}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {text.heading}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {text.subheading}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {text.steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={i} className="relative bg-[#12121f] border border-white/8 rounded-2xl p-7 hover:border-pink-500/30 transition-all group">
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {i + 1}
                </div>
                {/* Emoji + Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center mb-5 group-hover:from-pink-500/30 group-hover:to-purple-600/30 transition-all text-2xl">
                  {step.emoji}
                </div>
                <h3 className="text-white font-semibold text-lg mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            )
          })}
        </div>

        {/* App badges */}
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4 uppercase tracking-wider font-medium">{text.appLabel}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {text.apps.map((app) => (
              <span
                key={app}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-300 text-sm font-medium hover:border-pink-500/30 hover:text-white transition-all"
              >
                {app}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
