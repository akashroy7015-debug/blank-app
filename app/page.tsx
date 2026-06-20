import Hero from '@/components/Hero'
import MessageMoments from '@/components/MessageMoments'
import BeforeAfter from '@/components/BeforeAfter'
import HowItWorks from '@/components/HowItWorks'
import Testimonials from '@/components/Testimonials'
import Story from '@/components/Story'
import PricingSection from '@/components/PricingSection'
import FAQ from '@/components/FAQ'

export default function Home() {
  return (
    <main>
      <Hero />
      <MessageMoments />
      <BeforeAfter />
      <HowItWorks />
      <Testimonials />
      <Story />
      <PricingSection />
      <FAQ />
    </main>
  )
}
