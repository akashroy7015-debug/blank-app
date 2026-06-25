'use client'

import PricingSection from '@/components/PricingSection'
import { useLanguage, type Lang } from '@/lib/language'

const headings: Record<Lang, { title: string; highlight: string; sub: string }> = {
  en: { title: 'Simple Pricing.',   highlight: 'No surprises.',        sub: "Start free, upgrade when you're ready. Cancel anytime." },
  hi: { title: 'Seedhi Pricing.',   highlight: 'Koi surprise nahi.',   sub: 'Free mein shuru karo, jab ready ho tab upgrade karo. Kabhi bhi cancel karo.' },
  es: { title: 'Precios simples.',  highlight: 'Sin sorpresas.',        sub: 'Empieza gratis, mejora cuando estés listo. Cancela cuando quieras.' },
  fr: { title: 'Tarifs simples.',   highlight: 'Sans surprises.',       sub: 'Commence gratuitement, améliore quand tu es prêt. Annule à tout moment.' },
  pt: { title: 'Preços simples.',   highlight: 'Sem surpresas.',        sub: 'Comece grátis, melhore quando estiver pronto. Cancele a qualquer momento.' },
  ar: { title: 'أسعار بسيطة.',      highlight: 'بلا مفاجآت.',            sub: 'ابدأ مجاناً، قم بالترقية عندما تكون مستعداً. الغِ في أي وقت.' },
  de: { title: 'Einfache Preise.',  highlight: 'Keine Überraschungen.', sub: 'Starte kostenlos, upgrade wann du bereit bist. Jederzeit kündbar.' },
  zh: { title: '简单定价。',           highlight: '无隐藏费用。',              sub: '免费开始，随时升级。随时取消。' },
  ja: { title: 'シンプルな料金。',     highlight: '追加料金なし。',            sub: '無料で始め、準備ができたらアップグレード。いつでもキャンセル可能。' },
  ko: { title: '간단한 요금제.',       highlight: '숨겨진 요금 없음.',          sub: '무료로 시작하고, 준비되면 업그레이드하세요. 언제든지 취소 가능.' },
}

export default function PricingPage() {
  const { lang } = useLanguage()
  const h = headings[lang]
  return (
    <main className="pt-8">
      <div className="text-center mb-4 px-4">
        <h1 className="font-display text-4xl md:text-5xl mb-4 italic" style={{ color: 'var(--foreground)' }}>
          {h.title}{' '}
          <span style={{ color: 'var(--primary)' }}>{h.highlight}</span>
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
          {h.sub}
        </p>
      </div>
      <PricingSection />
    </main>
  )
}
