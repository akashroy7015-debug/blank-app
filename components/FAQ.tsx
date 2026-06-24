'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useLanguage } from '@/lib/language'

const faqs = {
  en: [
    {
      q: 'Is my conversation data private?',
      a: "Yes. Screenshots are sent to our AI for analysis and are never stored on our servers. We don't save your chat content.",
    },
    {
      q: 'Which apps does FlirtIQ work with?',
      a: "Any app where you can take a screenshot — Tinder, Bumble, Hinge, OkCupid, TrulyMadly, Aisle, Instagram DMs, WhatsApp, iMessage, and more.",
    },
    {
      q: "What's the free tier limit?",
      a: 'You get 3 analyses per day, completely free. No credit card required. Upgrade for unlimited.',
    },
    {
      q: 'Does it work in languages other than English?',
      a: 'Yes! FlirtIQ detects the language of your conversation and replies in that same language — English, Hindi/Hinglish, Spanish, French, and 20+ more.',
    },
    {
      q: 'What are the 4 reply styles?',
      a: 'Flirty (playful tension), Confident (high value, assertive), Funny (witty and charming), and Sweet (genuine and heartfelt). Pick what feels most like you.',
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Yes. Weekly, monthly, and yearly plans can be cancelled anytime. No lock-in, no questions asked.',
    },
  ],
  hi: [
    {
      q: 'Kya meri conversation private hai?',
      a: "Haan. Screenshots hamare AI ko bheje jaate hain analyze karne ke liye aur hamare servers pe kabhi store nahi hote. Hum tumhara chat content save nahi karte.",
    },
    {
      q: 'FlirtIQ kaun se apps pe kaam karta hai?',
      a: "Jis bhi app pe screenshot le sako — Tinder, Bumble, Hinge, OkCupid, TrulyMadly, Aisle, Instagram DMs, WhatsApp, iMessage, aur aur bhi.",
    },
    {
      q: 'Free plan mein kitna milta hai?',
      a: 'Roz 3 analyses bilkul free milte hain. Koi credit card nahi chahiye. Unlimited ke liye upgrade karo.',
    },
    {
      q: 'Kya ye English ke alawa doosri languages mein kaam karta hai?',
      a: 'Haan! FlirtIQ tumhari conversation ki language detect karta hai aur usi language mein reply deta hai — English, Hindi/Hinglish, Spanish, French, aur 20+ aur.',
    },
    {
      q: '4 reply styles kya hain?',
      a: 'Flirty (playful tension), Confident (high value, assertive), Funny (witty aur charming), aur Sweet (genuine aur heartfelt). Jo tumhe suit kare wo chuno.',
    },
    {
      q: 'Kya kabhi bhi cancel kar sakte hain?',
      a: 'Haan. Weekly, monthly, aur yearly sab plans kabhi bhi cancel ho sakte hain. Koi lock-in nahi, koi sawaal nahi.',
    },
  ],
}

const translations = {
  en: {
    badge: 'FAQ',
    heading: 'Questions? We got you.',
    subheading: "Everything you need to know before you start.",
  },
  hi: {
    badge: 'FAQ',
    heading: 'Sawaal? Hum hain na.',
    subheading: 'Shuru karne se pehle jo bhi jaanna ho.',
  },
}

export default function FAQ() {
  const { lang } = useLanguage()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const text = translations[lang]
  const items = faqs[lang]

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i)
  }

  return (
    <section className="py-20 px-4" id="faq">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 rounded-full px-4 py-2 text-pink-400 text-sm font-medium mb-4">
            {text.badge}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{text.heading}</h2>
          <p className="text-gray-400">{text.subheading}</p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {items.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                className={`bg-[#12121f] border rounded-2xl overflow-hidden transition-all ${
                  isOpen ? 'border-pink-500/40' : 'border-white/8 hover:border-white/15'
                }`}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className={`font-semibold text-sm md:text-base transition-colors ${isOpen ? 'text-white' : 'text-gray-200'}`}>
                    {item.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-pink-400' : 'text-gray-500'}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
