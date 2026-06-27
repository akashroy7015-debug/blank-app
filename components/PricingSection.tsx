'use client'

import { useState, useEffect } from 'react'
import { Check, Crown, Zap, Star, Coins } from 'lucide-react'
import { useLanguage, type Lang } from '@/lib/language'
import { createBrowserClient } from '@/lib/supabase'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Paddle?: any
  }
}

const copy: Record<Lang, { badge: string; heading: string; sub: string; popular: string; bestValue: string; loading: string; chooseAmount: string; perCredit: string; buyCredits: (n: number) => string }> = {
  en: { badge: 'Pricing', heading: 'Simple, Honest Pricing', sub: "Start free. Upgrade when you're ready. No hidden fees.", popular: 'POPULAR', bestValue: 'BEST VALUE', loading: 'Loading...', chooseAmount: 'Or choose your own amount', perCredit: '$1.00 per credit', buyCredits: n => `Buy ${n} Credits` },
  hi: { badge: 'Pricing', heading: 'Seedhi, Saaf Pricing', sub: 'Free mein shuru karo. Jab date pakki ho jaye, tab upgrade karna. Koi hidden fees nahi.', popular: 'POPULAR', bestValue: 'BEST VALUE', loading: 'Loading...', chooseAmount: 'Khud choose karo kitne credits chahiye', perCredit: '$1.00 per credit', buyCredits: n => `${n} Credits Kharido` },
  es: { badge: 'Precios', heading: 'Precios Simples y Honestos', sub: 'Empieza gratis. Mejora cuando estés listo. Sin cargos ocultos.', popular: 'POPULAR', bestValue: 'MEJOR VALOR', loading: 'Cargando...', chooseAmount: 'O elige tu propia cantidad', perCredit: '$1.00 por crédito', buyCredits: n => `Comprar ${n} Créditos` },
  fr: { badge: 'Tarifs', heading: 'Tarifs Simples et Honnêtes', sub: 'Commence gratuitement. Améliore quand tu es prêt. Pas de frais cachés.', popular: 'POPULAIRE', bestValue: 'MEILLEUR RAPPORT', loading: 'Chargement...', chooseAmount: 'Ou choisis ta propre quantité', perCredit: '1,00 $ par crédit', buyCredits: n => `Acheter ${n} Crédits` },
  pt: { badge: 'Preços', heading: 'Preços Simples e Honestos', sub: 'Comece grátis. Melhore quando estiver pronto. Sem taxas ocultas.', popular: 'POPULAR', bestValue: 'MELHOR VALOR', loading: 'Carregando...', chooseAmount: 'Ou escolha sua própria quantidade', perCredit: 'R$ 1,00 por crédito', buyCredits: n => `Comprar ${n} Créditos` },
  ar: { badge: 'الأسعار', heading: 'أسعار بسيطة وصادقة', sub: 'ابدأ مجاناً. قم بالترقية عندما تكون مستعداً. بدون رسوم خفية.', popular: 'الأكثر شعبية', bestValue: 'أفضل قيمة', loading: 'جاري التحميل...', chooseAmount: 'أو اختر كميتك الخاصة', perCredit: 'دولار واحد لكل رصيد', buyCredits: n => `اشترِ ${n} رصيداً` },
  de: { badge: 'Preise', heading: 'Einfache, Ehrliche Preise', sub: 'Starte kostenlos. Upgrade wann du bereit bist. Keine versteckten Gebühren.', popular: 'BELIEBT', bestValue: 'BESTES ANGEBOT', loading: 'Laden...', chooseAmount: 'Oder wähle deine eigene Menge', perCredit: '1,00 $ pro Credit', buyCredits: n => `${n} Credits kaufen` },
  zh: { badge: '定价', heading: '简单透明的定价', sub: '免费开始。准备好了再升级。没有隐藏费用。', popular: '热门', bestValue: '最超值', loading: '加载中...', chooseAmount: '或选择自定义数量', perCredit: '每积分 $1.00', buyCredits: n => `购买 ${n} 积分` },
  ja: { badge: '料金', heading: 'シンプルで誠実な料金体系', sub: '無料で始める。準備ができたらアップグレード。隠れた費用なし。', popular: '人気', bestValue: '最高コスパ', loading: '読み込み中...', chooseAmount: '自分で数量を選択', perCredit: 'クレジットあたり $1.00', buyCredits: n => `${n} クレジットを購入` },
  ko: { badge: '요금제', heading: '간단하고 정직한 요금제', sub: '무료로 시작하세요. 준비되면 업그레이드하세요. 숨겨진 요금 없음.', popular: '인기', bestValue: '최고 가치', loading: '로딩 중...', chooseAmount: '직접 수량 선택', perCredit: '크레딧당 $1.00', buyCredits: n => `크레딧 ${n}개 구매` },
}

type PlanLang = 'en' | 'hi'
// Per-plan text only in EN/HI; other languages fall back to English
const getPlanLang = (lang: Lang): PlanLang => lang === 'hi' ? 'hi' : 'en'

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


const PRICE_IDS: Record<string, string | undefined> = {
  weekly:         process.env.NEXT_PUBLIC_PADDLE_PRICE_WEEKLY,
  monthly:        process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY,
  yearly:         process.env.NEXT_PUBLIC_PADDLE_PRICE_YEARLY,
  credits_custom: process.env.NEXT_PUBLIC_PADDLE_PRICE_CREDITS_CUSTOM,
}

export default function PricingSection() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [customCredits, setCustomCredits] = useState(25)
  const { lang } = useLanguage()
  const c = copy[lang]
  const planLang = getPlanLang(lang)

  const [paddleReady, setPaddleReady] = useState(false)

  useEffect(() => {
    const init = () => {
      const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
      if (token && window.Paddle) {
        window.Paddle.Initialize({ token })
        setPaddleReady(true)
      }
    }
    if (window.Paddle) { init(); return }
    const script = document.createElement('script')
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'
    script.onload = init
    document.head.appendChild(script)
  }, [])

  const handleCheckout = async (plan: string, quantity?: number) => {
    setLoadingPlan(plan)
    setCheckoutError(null)
    try {
      const supabase = createBrowserClient()
      if (!supabase) throw new Error('Service not configured')
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setCheckoutError('Please sign in before purchasing.')
        return
      }

      const priceId = PRICE_IDS[plan]
      if (!priceId) {
        setCheckoutError(`Price not configured for plan: ${plan}. Check NEXT_PUBLIC_PADDLE_PRICE_* env vars.`)
        return
      }

      if (!window.Paddle) {
        setCheckoutError('Paddle is still loading. Please try again in a moment.')
        return
      }

      const qty = (plan === 'credits_custom' && typeof quantity === 'number' && quantity >= 1)
        ? Math.min(Math.floor(quantity), 10000)
        : 1

      // Paddle supports a limited set of locales; fall back to English for others (e.g. Hindi)
      const PADDLE_LOCALES = ['en', 'es', 'fr', 'pt', 'de', 'zh', 'ja', 'ko', 'ar']
      const locale = PADDLE_LOCALES.includes(lang) ? lang : 'en'

      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: qty }],
        customData: { user_id: session.user.id },
        customer: session.user.email ? { email: session.user.email } : undefined,
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          locale,
          successUrl: `${window.location.origin}/dashboard?success=true`,
        },
      })
    } catch (err) {
      console.error('Checkout failed', err)
      setCheckoutError(err instanceof Error ? err.message : 'Checkout failed. Please try again.')
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
        {checkoutError && (
          <div className="mb-6 rounded-xl px-4 py-3 text-sm text-center font-medium"
            style={{ background: 'oklch(0.4 0.2 25 / 0.12)', border: '1px solid oklch(0.4 0.2 25 / 0.3)', color: 'oklch(0.55 0.2 25)' }}>
            {checkoutError}
          </div>
        )}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium mb-4"
            style={{ background: 'oklch(0.64 0.24 5 / 0.1)', border: '1px solid oklch(0.64 0.24 5 / 0.2)', color: 'var(--primary)' }}>
            <Crown size={14} />
            {c.badge}
          </div>
          <h2 className="font-display text-3xl md:text-4xl mb-4 italic" style={{ color: 'var(--foreground)' }}>{c.heading}</h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>{c.sub}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon
            const p = plan[planLang]
            const badgeLabel = getBadgeLabel(plan.badge)
            return (
              <div
                key={plan.key}
                className={`relative flex flex-col rounded-2xl p-6 transition-all hover:-translate-y-1 shadow-soft ${plan.highlight ? 'ring-2' : ''}`}
                style={{ background: 'var(--card)', border: `1px solid var(--border)`, ...(plan.highlight ? { ringColor: 'var(--primary)' } : {}) }}
              >
                {badgeLabel && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${plan.gradient}`}>
                    {badgeLabel}
                  </div>
                )}

                <div className="mb-4 mt-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'oklch(0.64 0.24 5 / 0.1)' }}>
                    <Icon size={20} style={{ color: 'var(--primary)' }} />
                  </div>
                  <h3 className="font-bold text-xl" style={{ color: 'var(--foreground)' }}>{p.name}</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{p.desc}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-extrabold" style={{ color: 'var(--foreground)' }}>{p.price}</span>
                  <span className="text-sm ml-1" style={{ color: 'var(--muted-foreground)' }}>{p.period}</span>
                </div>

                <ul className="space-y-2 mb-8 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--foreground)' }}>
                      <Check size={15} style={{ color: 'var(--primary)', marginTop: '0.125rem', flexShrink: 0 }} />
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

        {/* Pay As You Go Credits */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium mb-3"
              style={{ background: 'oklch(0.7 0.19 55 / 0.1)', border: '1px solid oklch(0.7 0.19 55 / 0.2)', color: 'oklch(0.6 0.19 55)' }}>
              <Coins size={14} />
              Pay As You Go
            </div>
            <h3 className="font-display text-2xl md:text-3xl italic" style={{ color: 'var(--foreground)' }}>
              Just need a few?{' '}
              <span style={{ color: 'var(--primary)' }}>Buy credits.</span>
            </h3>
            <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>
              No subscription. Credits never expire. 1 credit = 1 analysis.
            </p>
          </div>

          {/* Custom credit amount */}
          <div className="max-w-sm mx-auto rounded-2xl p-6 text-center"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              {c.chooseAmount}
            </p>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => setCustomCredits(n => Math.max(1, n - 1))}
                className="w-9 h-9 rounded-xl text-lg font-bold flex items-center justify-center transition-all hover:opacity-80"
                style={{ background: 'oklch(0.7 0.19 55 / 0.12)', color: 'oklch(0.5 0.19 55)', border: '1px solid oklch(0.7 0.19 55 / 0.3)' }}>
                −
              </button>
              <input
                type="number"
                min={1}
                max={10000}
                value={customCredits}
                onChange={e => setCustomCredits(Math.max(1, Math.min(10000, parseInt(e.target.value) || 1)))}
                className="flex-1 text-center text-xl font-extrabold rounded-xl py-2 bg-transparent outline-none"
                style={{ color: 'var(--foreground)', border: '1px solid var(--border)' }}
              />
              <button
                onClick={() => setCustomCredits(n => Math.min(10000, n + 1))}
                className="w-9 h-9 rounded-xl text-lg font-bold flex items-center justify-center transition-all hover:opacity-80"
                style={{ background: 'oklch(0.7 0.19 55 / 0.12)', color: 'oklch(0.5 0.19 55)', border: '1px solid oklch(0.7 0.19 55 / 0.3)' }}>
                +
              </button>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
              ${(customCredits * 1).toFixed(2)} · {c.perCredit}
            </p>
            <button
              onClick={() => handleCheckout('credits_custom', customCredits)}
              disabled={loadingPlan === 'credits_custom'}
              className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
              style={{ background: 'oklch(0.7 0.19 55 / 0.12)', color: 'oklch(0.5 0.19 55)', border: '1px solid oklch(0.7 0.19 55 / 0.3)' }}>
              {loadingPlan === 'credits_custom' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  {c.loading}
                </span>
              ) : c.buyCredits(customCredits)}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
