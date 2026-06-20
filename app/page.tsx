import Hero from '@/components/Hero'
import MessageMoments from '@/components/MessageMoments'
import HowItWorks from '@/components/HowItWorks'
import Story from '@/components/Story'
import PricingSection from '@/components/PricingSection'

export default function Home() {
  return (
    <main>
      <Hero />
      <MessageMoments />
      <HowItWorks />
      <Story />
      <PricingSection />
    </main>
  )
}
