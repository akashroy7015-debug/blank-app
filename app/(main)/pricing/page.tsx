'use client'

import PricingSection from '@/components/PricingSection'
import { useLanguage } from '@/lib/language'

export default function PricingPage() {
  const { lang } = useLanguage()
  return (
    <main className="pt-8">
      <div className="text-center mb-4 px-4">
        <h1 className="font-display text-4xl md:text-5xl mb-4 italic" style={{ color: 'var(--foreground)' }}>
          {lang === 'hi' ? <>Seedhi Pricing. <span style={{ color: 'var(--primary)' }}>Koi surprise nahi.</span></> : <>Simple Pricing.{' '}<span style={{ color: 'var(--primary)' }}>No surprises.</span></>}
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
          {lang === 'hi' ? 'Free mein shuru karo, jab ready ho tab upgrade karo. Kabhi bhi cancel karo.' : "Start free, upgrade when you're ready. Cancel anytime."}
        </p>
      </div>
      <PricingSection />
    </main>
  )
}
