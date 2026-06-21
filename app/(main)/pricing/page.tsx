import PricingSection from '@/components/PricingSection'

export default function PricingPage() {
  return (
    <main className="pt-8">
      <div className="text-center mb-4 px-4">
        <h1 className="font-display text-4xl md:text-5xl mb-4 italic" style={{ color: 'var(--foreground)' }}>
          Simple Pricing.{' '}
          <span style={{ color: 'var(--primary)' }}>No surprises.</span>
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
          Start free, upgrade when you&apos;re ready. Cancel anytime.
        </p>
      </div>
      <PricingSection />
    </main>
  )
}
