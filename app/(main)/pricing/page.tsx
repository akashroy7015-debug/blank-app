import PricingSection from '@/components/PricingSection'

export default function PricingPage() {
  return (
    <main className="pt-8">
      <div className="text-center mb-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
          Simple Pricing
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Start free, upgrade when you&apos;re ready. No hidden fees.
        </p>
      </div>
      <PricingSection />
    </main>
  )
}
