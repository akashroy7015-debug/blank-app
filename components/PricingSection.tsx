'use client'

import { useState } from 'react'
import { Check, Crown, Zap, Star } from 'lucide-react'
import { useLanguage } from '@/lib/language'

const copy = {
  en: {
    badge: 'Pricing',
    heading: 'Simple, Honest Pricing',
    sub: "Start free. Upgrade when you're ready. No hidden fees.",
    popular: 'POPULAR',
    bestValue: 'BEST VALUE',
    loading: 'Loading...',
  },
  hi: {
    badge: 'Pricing',
    heading: 'Seedhi, Saaf Pricing',
    sub: 'Free mein shuru karo. Koi hidden fees nahi.',
    popular: 'POPULAR',
    bestValue: 'BEST VALUE',
    loading: 'Loading...',
  },
}

const PLANS = [
  {
    key: 'free',
    en: { name: 'Free', price: '$0', period: '/forever', desc: '3 analyses per day, no card required.', cta: 'Get Started Free', features: ['3 analyses/day', '4 reply styles', 'Compatibility score', 'Strategy tip'] },
    hi: { name: 'Free', price: '$0', period: '/hamesha', desc: 'Roz 3 analyses, koi card nahi chahiye.', cta: 'Free Mein Shuru Karo', features: ['3 analyses/din', '4 reply styles', 'Compatibility score', 'Strategy tip'] },
    icon: Star, highlight: false, badge: null as null | string,
    gradient: 'from-gray-500 to-gray-600', border: 'border-white/8',
  },
  {
    key: 'weekly',
    en: { name: 'Weekly', price: '$4.99', period: '/week', desc: 'Perfect for a first date sprint.', cta: 'Start Weekly', features: ['Unlimited analyses', '4 reply styles', 'Compatibility score', 'Strategy tip', 'Priority support'] },
    hi: { name: 'Weekly', price: '$4.99', period: '/hafta', desc: 'Pehli date ke liye perfect.', cta: 'Weekly Shuru Karo', features: ['Unlimited analyses', '4 reply styles', 'Compatibility score', 'Strategy tip', 'Priority support'] },
    icon: Zap, highlight: false, badge: null as null | string,
    gradient: 'from-pink-500 to-purple-600', border: 'border-white/8',
  },
  {
    key: 'monthly',
    en: { name: 'Monthly', price: '$9.99', period: '/month', desc: 'Most popular — save 50% vs weekly.', cta: 'Start Monthly', features: ['Unlimited analyses', '4 reply styles', 'Compatibility score', 'Strategy tip', 'Priority support', 'Early access to features'] },
    hi: { name: 'Monthly', price: '$9.99', period: '/mahina', desc: 'Active daters ke liye sabse popular.', cta: 'Monthly Shuru Karo', features: ['Unlimited analyses', '4 reply styles', 'Compatibility score', 'Strategy tip', 'Priority support', 'Nayi features pehle milegi'] },
    icon: Crown, highlight: true, badge: 'popular' as string,
    gradient: 'from-pink-500 to-purple-600', border: 'border-pink-500/50',
  },
  {
    key: 'yearly',
    en: { name: 'Yearly', price: '$39.99', period: '/year', desc: 'Best value — save 67%!', cta: 'Start Yearly', features: ['Unlimited analyses', '4 reply styles', 'Compatibility score', 'Strategy tip', 'Priority support', 'Early access to features', 'Exclusive tips newsletter'] },
    hi: { name: 'Yearly', price: '$39.99', period: '/saal', desc: 'Sabse sasta — 67% save karo!', cta: 'Yearly Shuru Karo', features: ['Unlimited analyses', '4 reply styles', 'Compatibility score', 'Strategy tip', 'Priority support', 'Nayi features pehle milegi', 'Exclusive tips newsletter'] },
    icon: Star, highlight: false, badge: 'bestValue' as string,
    gradient: 'from-purple-500 to-blue-600', border: 'border-purple-500/30',
  },
]

export default function PricingSection() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const { lang } = useLanguage()
  const c = copy[lang]

  const handleCheckout = async (plan: string) => {
    setLoadingPlan(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error('Checkout failed', err)
    } finally {
      setLoadingPlan(null)
    }
  }

  const getBadgeLabel = (badge: string | null) => {
    if (!badge) return null
    if (badge === 'popular') return c.popular
    if (badge === 'bestValue') return c.bestValue
    return badge
  }

  return (
    <section className="py-20 px-4" id="pricing">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 rounded-full px-4 py-2 text-pink-400 text-sm font-medium mb-4">
            <Crown size={14} />
            {c.badge}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{c.heading}</h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">{c.sub}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon
            const p = plan[lang]
            const badgeLabel = getBadgeLabel(plan.badge)
            return (
              <div
                key={plan.key}
                className={`relative flex flex-col bg-[#12121f] border ${plan.border} rounded-2xl p-6 transition-all hover:border-pink-500/40 ${plan.highlight ? 'ring-1 ring-pink-500/30' : ''}`}
              >
                {badgeLabel && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${plan.gradient}`}>
                    {badgeLabel}
                  </div>
                )}

                <div className="mb-4 mt-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(236,72,153,0.15)' }}>
                    <Icon size={20} className="text-pink-400" />
                  </div>
                  <h3 className="text-white font-bold text-xl">{p.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{p.desc}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-white">{p.price}</span>
                  <span className="text-gray-500 text-sm ml-1">{p.period}</span>
                </div>

                <ul className="space-y-2 mb-8 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check size={15} className="text-pink-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {plan.key === 'free' ? (
                  <a href="/dashboard" className="block text-center py-3 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/30 font-semibold text-sm transition-all">
                    {p.cta}
                  </a>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.key)}
                    disabled={loadingPlan === plan.key}
                    className={`w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r ${plan.gradient} hover:opacity-90 transition-all disabled:opacity-60`}
                  >
                    {loadingPlan === plan.key ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {c.loading}
                      </span>
                    ) : p.cta}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
