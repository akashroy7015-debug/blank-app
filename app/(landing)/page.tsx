'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/language'

const HEARTS = ['💌', '💕', '✨', '💬', '❤️', '💗', '🌷', '🫶']

const MOMENTS = [
  { emoji: '✨', en: 'What should I say first?',  hi: 'Pehla message kya bhejun?',  tag: 'Aura'     },
  { emoji: '⏳', en: 'They replied late…',         hi: 'Late reply aaya hai…',        tag: 'Calm'     },
  { emoji: '📍', en: 'How do I ask to meet?',      hi: 'Date ke liye kaise puchu?',   tag: 'Bold'     },
  { emoji: '🔥', en: 'Make it a little flirty',    hi: 'Thoda flirty karna hai',      tag: 'Cool'     },
  { emoji: '🧠', en: 'The chat stalled',           hi: 'Baat ruk gayi hai',           tag: 'Strategy' },
  { emoji: '📸', en: 'Read my screenshot',         hi: 'Screenshot analyze karo',     tag: 'AI'       },
]

const FEATURES = [
  { emoji: '💌', en: { t: 'AI reply generation',       s: 'context-aware messages'      }, hi: { t: 'AI reply generation',       s: 'context-aware messages'      }, chips: ['AI+'],           chipSub: 'in seconds'          },
  { emoji: '🔍', en: { t: 'Chat analysis',              s: 'tone, intent, interest'      }, hi: { t: 'Chat analysis',              s: 'tone, intent, vibe'          }, chips: ['87%'],           chipSub: 'compatibility score' },
  { emoji: '🎭', en: { t: '4 reply styles',             s: 'Aura, Cool, Bold, Gentleman' }, hi: { t: '4 reply styles',             s: 'Aura, Cool, Bold, Gentleman' }, chips: ['4x'],            chipSub: 'a tone for every chat'},
  { emoji: '📸', en: { t: 'Screenshot reading',         s: 'PNG and JPG supported'       }, hi: { t: 'Screenshot reading',         s: 'PNG aur JPG supported'       }, chips: ['JPG', 'PNG'],    chipSub: 'fast analysis'       },
  { emoji: '🧭', en: { t: 'Strategy note',              s: 'what to write, when'         }, hi: { t: 'Strategy note',              s: 'kya likhein, kab likhein'    }, chips: ['next'],          chipSub: 'clearer next move'   },
  { emoji: '🌍', en: { t: 'Multilingual intelligence',  s: '29 languages supported'      }, hi: { t: 'Multilingual intelligence',  s: '29 languages supported'      }, chips: ['TR', 'EN', 'DE'], chipSub: 'one app'             },
]

const STYLES = [
  { name: 'FLIRTY',    color: 'from-rose-400 to-pink-500',     en: "You're making it really hard to focus on anything else 😏",           hi: 'Tumse baat karte karte sab bhool jaata hoon 😏'         },
  { name: 'CONFIDENT', color: 'from-fuchsia-500 to-purple-500', en: "I know exactly where this is going, and I like it",                   hi: 'Mujhe pata hai yeh kahan ja raha hai — aur mujhe pasand hai' },
  { name: 'FUNNY',     color: 'from-amber-400 to-orange-500',   en: "My dog said you seem cool, and he's a great judge of character 🐶",   hi: 'Mere dog ne bola tum cool ho, aur uska taste kaafi accha hai 🐶' },
  { name: 'SWEET',     color: 'from-pink-300 to-rose-300',      en: "Honestly, talking to you is the best part of my day",                 hi: 'Sachchi, tumse baat karna din ka sabse accha hissa hai'   },
]

const PLANS = [
  { key: 'free',    en: { name: 'Free',    price: '$0',     period: '/forever', cta: 'Get Started Free',  desc: '3 analyses per day'          }, hi: { name: 'Free',   price: '$0',   period: '/hamesha', cta: 'Free Mein Shuru Karo', desc: 'Roz 3 analyses free'         }, href: '/dashboard', gradient: 'from-gray-400 to-gray-500' },
  { key: 'weekly',  en: { name: 'Weekly',  price: '$4.99',  period: '/week',    cta: 'Start Weekly',      desc: 'Perfect for a first date sprint' }, hi: { name: 'Weekly', price: '$4.99', period: '/hafta', cta: 'Weekly Shuru Karo', desc: 'Pehli date ke liye perfect' }, href: '/pricing',   gradient: 'from-pink-500 to-rose-500' },
  { key: 'monthly', en: { name: 'Monthly', price: '$9.99',  period: '/month',   cta: 'Start Monthly',     desc: 'Most popular — save 50%'     }, hi: { name: 'Monthly', price: '$9.99', period: '/mahina', cta: 'Monthly Shuru Karo', desc: 'Sabse popular — 50% save'  }, href: '/pricing',   gradient: 'from-rose-500 to-fuchsia-600', popular: true },
  { key: 'yearly',  en: { name: 'Yearly',  price: '$39.99', period: '/year',    cta: 'Start Yearly',      desc: 'Best value — save 67%!'      }, hi: { name: 'Yearly', price: '$39.99', period: '/saal', cta: 'Yearly Shuru Karo', desc: 'Sabse sasta — 67% save!'   }, href: '/pricing',   gradient: 'from-fuchsia-500 to-purple-600' },
]

const TESTIMONIALS = [
  { name: 'Rahul M.',  loc: 'Mumbai',    text: "FlirtIQ gave me exactly the right flirty comeback. She said yes to coffee." },
  { name: 'Sarah K.',  loc: 'London',    text: "The compatibility score told me the chat was going cold before I even felt it." },
  { name: 'Arjun S.',  loc: 'Delhi',     text: "Been using it for a month. Three dates. Would not go back to texting alone." },
  { name: 'Priya T.',  loc: 'Bangalore', text: "The Funny style is my go-to. Broke the ice every single time." },
  { name: 'James L.',  loc: 'New York',  text: "Matched on Hinge, conversation died. FlirtIQ saved it. We met last week." },
  { name: 'Aisha R.',  loc: 'Dubai',     text: "Works in Arabic-English too! The AI picked the right language automatically." },
]

const FAQS_EN = [
  { q: 'Is my data private?',               a: "Yes. Screenshots go to Google Gemini for analysis and are never stored on our servers." },
  { q: 'Which apps does it work with?',     a: "Any app you can screenshot — Tinder, Bumble, Hinge, Instagram DMs, WhatsApp, and more." },
  { q: "What's the free limit?",            a: '3 analyses per day. No card required. Resets at midnight.' },
  { q: 'Does it work in other languages?',  a: 'Yes — FlirtIQ detects the language and replies in the same language automatically.' },
  { q: 'Can I cancel anytime?',             a: 'Yes. Cancel from your account at any time. Access continues until the billing period ends.' },
  { q: 'How accurate is the AI?',           a: 'Compatibility scores are a guide, not a guarantee. Replies are suggestions — edit as needed.' },
]
const FAQS_HI = [
  { q: 'Kya mera data private hai?',        a: "Haan. Screenshots Google Gemini se analyze hoti hain aur hamare servers par store nahi hoti." },
  { q: 'Kaun se apps ke saath kaam karta?', a: "Koi bhi app jisme screenshot le sako — Tinder, Bumble, Hinge, Instagram DMs, WhatsApp, aur zyada." },
  { q: 'Free limit kya hai?',               a: 'Roz 3 analyses. Koi card nahi chahiye. Midnight par reset hoti hai.' },
  { q: 'Kya hindi mein kaam karta?',        a: 'Haan — FlirtIQ language detect karta hai aur usi mein reply deta hai.' },
  { q: 'Kya kabhi bhi cancel kar sakte?',   a: 'Haan. Account se kisi bhi waqt cancel karo. Billing period khatam hone tak access milta hai.' },
  { q: 'AI kitna accurate hai?',            a: 'Compatibility score ek guide hai, guarantee nahi. Replies suggestions hain — edit karo jaise chahiye.' },
]

export default function LandingPage() {
  const { lang, setLang } = useLanguage()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const floaters = useMemo(
    () => Array.from({ length: 18 }).map((_, i) => ({
      emoji: HEARTS[i % HEARTS.length],
      left: `${(i * 53) % 100}%`,
      delay: `${(i * 0.8) % 14}s`,
      duration: `${10 + ((i * 1.7) % 8)}s`,
      size: `${18 + ((i * 7) % 22)}px`,
    })),
    [],
  )

  const faqs = lang === 'hi' ? FAQS_HI : FAQS_EN

  return (
    <div className="landing-page relative overflow-x-hidden">
      {/* Floating hearts */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {floaters.map((f, i) => (
          <span key={i} className="animate-float-up absolute opacity-60"
            style={{ left: f.left, animationDelay: f.delay, animationDuration: f.duration, fontSize: f.size }}>
            {f.emoji}
          </span>
        ))}
      </div>

      {/* NAV */}
      <header className="relative z-20">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl text-lg text-white shadow-pill" style={{ background: 'var(--gradient-primary)' }}>💗</span>
            <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>FlirtIQ</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium md:flex" style={{ color: 'var(--muted-foreground)' }}>
            <a href="#features" className="hover:opacity-80 transition-opacity">{lang === 'hi' ? 'features' : 'features'}</a>
            <a href="#how" className="hover:opacity-80 transition-opacity">{lang === 'hi' ? 'kaise kaam karta' : 'how it works'}</a>
            <a href="#pricing" className="hover:opacity-80 transition-opacity">{lang === 'hi' ? 'pricing' : 'pricing'}</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="hidden md:flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
            >
              {lang === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 EN'}
            </button>
            <Link href="/dashboard"
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 shadow-pill"
              style={{ background: 'var(--gradient-primary)' }}>
              {lang === 'hi' ? 'free try karo' : 'try free'}
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-10 pb-20 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium backdrop-blur"
          style={{ borderColor: 'oklch(0.92 0.015 340 / 0.6)', background: 'oklch(1 0 0 / 0.8)' }}>
          <span className="animate-pulse-glow h-2 w-2 rounded-full bg-green-500" />
          17,130 {lang === 'hi' ? 'log abhi smarter messages likh rahe hain' : 'people writing smarter right now'}
        </div>

        <h1 className="font-display mt-8 text-6xl leading-[0.95] tracking-tight md:text-8xl" style={{ color: 'var(--foreground)' }}>
          {lang === 'hi' ? 'Match ho gaya.' : 'You matched.'}
          <br />
          <span className="italic" style={{ color: 'var(--primary)' }}>{lang === 'hi' ? 'ab kya?' : 'now what?'}</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg" style={{ color: 'var(--muted-foreground)' }}>
          {lang === 'hi'
            ? 'Screenshot daalo — FlirtIQ tone padhega, 4 perfect replies dega aur compatibility score batayega. Tinder, Bumble, Hinge, Insta, WhatsApp sab pe kaam karta hai.'
            : 'Upload your chat screenshot — FlirtIQ reads the tone, gives you 4 perfect replies and a compatibility score. Works on Tinder, Bumble, Hinge, Instagram, WhatsApp & more.'}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm backdrop-blur"
            style={{ background: 'oklch(1 0 0 / 0.8)', borderColor: 'var(--border)' }}>
            <span className="grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: 'var(--gradient-primary)' }}>AI</span>
            <span className="font-semibold" style={{ color: 'var(--foreground)' }}>10M+</span>
            <span style={{ color: 'var(--muted-foreground)' }}>{lang === 'hi' ? 'replies bane' : 'replies generated'}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm backdrop-blur"
            style={{ background: 'oklch(1 0 0 / 0.8)', borderColor: 'var(--border)' }}>
            <span style={{ color: 'var(--primary)' }}>★★★★★</span>
            <span className="font-semibold" style={{ color: 'var(--foreground)' }}>4.8</span>
            <span style={{ color: 'var(--muted-foreground)' }}>rating</span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white transition-transform hover:scale-105 shadow-pill"
            style={{ background: 'var(--gradient-primary)' }}>
            {lang === 'hi' ? 'Free Mein Try Karo' : 'Try It Free'} <span>→</span>
          </Link>
          <a href="#how"
            className="inline-flex items-center gap-2 rounded-full border px-7 py-3.5 font-semibold backdrop-blur transition-colors"
            style={{ borderColor: 'oklch(0.92 0.015 340 / 0.8)', background: 'oklch(1 0 0 / 0.8)', color: 'var(--foreground)' }}>
            ▶ {lang === 'hi' ? 'Kaise kaam karta hai' : 'See how it works'}
          </a>
        </div>

        {/* Phone mockup */}
        <div className="relative mx-auto mt-16 w-full max-w-sm">
          <div className="animate-float-soft shadow-card relative rounded-[2.5rem] p-1" style={{ border: '10px solid oklch(0.18 0.03 340 / 0.9)', background: 'oklch(0.18 0.03 340 / 0.9)' }}>
            <div className="overflow-hidden rounded-[2rem] p-5" style={{ background: 'var(--card)' }}>
              <div className="mb-4 flex items-center justify-between text-xs" style={{ color: 'var(--muted-foreground)' }}>
                <span className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                </span>
                <span className="font-medium">FlirtIQ Analysis</span>
              </div>

              <div className="space-y-2 text-left text-sm">
                <div className="inline-block max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-2" style={{ background: 'var(--muted)', color: 'var(--foreground)' }}>
                  Got any plans tonight? 😊
                </div>
                <div className="flex justify-end">
                  <div className="inline-block max-w-[80%] rounded-2xl rounded-br-sm px-4 py-2 text-white" style={{ background: 'var(--gradient-primary)' }}>
                    Maybe — depends on your offer.
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl border px-4 py-3" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <div className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--muted-foreground)' }}>Compatibility</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>87%</div>
                </div>
                <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="oklch(0.92 0.015 340)" strokeWidth="4" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="oklch(0.64 0.24 5)" strokeWidth="4" strokeLinecap="round" strokeDasharray="82 100" />
                </svg>
              </div>

              <div className="mt-3 rounded-2xl p-4 text-left text-white" style={{ background: 'var(--gradient-primary)' }}>
                <div className="text-[10px] font-bold tracking-widest uppercase opacity-80">AI suggestion</div>
                <div className="mt-1 text-sm leading-snug">&ldquo;I had plans, but my schedule could update if a better offer rolls in 😄&rdquo;</div>
                <div className="mt-3 flex gap-1.5 text-[10px] font-semibold flex-wrap">
                  {['Flirty', 'Confident', 'Funny', 'Sweet'].map((s) => (
                    <span key={s} className="rounded-full bg-white/20 px-2 py-1">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <span className="animate-float-soft absolute -top-4 -left-8 text-4xl" style={{ animationDelay: '1s' }}>💗</span>
          <span className="animate-float-soft absolute -top-2 -right-10 text-3xl" style={{ animationDelay: '2s' }}>✨</span>
          <span className="animate-float-soft absolute -bottom-4 -left-12 text-3xl" style={{ animationDelay: '0.5s' }}>💌</span>
          <span className="animate-float-soft absolute -right-8 bottom-10 text-4xl" style={{ animationDelay: '1.5s' }}>❤️</span>
        </div>
      </section>

      {/* MARQUEE moments */}
      <section className="relative z-10 overflow-hidden py-12">
        <div className="mb-6 text-center text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
          💬 {lang === 'hi' ? 'sabse common message moments' : 'most common message moments'}
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24" style={{ background: 'linear-gradient(to right, var(--background), transparent)' }} />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24" style={{ background: 'linear-gradient(to left, var(--background), transparent)' }} />
          <div className="animate-marquee flex gap-4 whitespace-nowrap">
            {[...MOMENTS, ...MOMENTS, ...MOMENTS].map((m, i) => (
              <div key={i} className="flex shrink-0 items-center gap-3 rounded-2xl border px-5 py-3 backdrop-blur shadow-soft"
                style={{ background: 'oklch(1 0 0 / 0.9)', borderColor: 'var(--border)' }}>
                <span className="text-2xl">{m.emoji}</span>
                <span className="font-medium" style={{ color: 'var(--foreground)' }}>{lang === 'hi' ? m.hi : m.en}</span>
                <span className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white" style={{ background: 'var(--gradient-primary)' }}>{m.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <div className="text-sm font-semibold tracking-widest uppercase" style={{ color: 'var(--primary)' }}>features</div>
          <h2 className="font-display mt-3 text-5xl tracking-tight md:text-6xl" style={{ color: 'var(--foreground)' }}>
            {lang === 'hi' ? 'Smart cards.' : 'Warm cards.'}{' '}
            <span className="italic" style={{ color: 'var(--primary)' }}>{lang === 'hi' ? 'Real intelligence.' : 'Real intelligence.'}</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {FEATURES.map((f) => {
            const copy = f[lang]
            return (
              <div key={f.emoji} className="group relative overflow-hidden rounded-3xl border p-6 backdrop-blur transition-transform hover:-translate-y-1 shadow-soft"
                style={{ background: 'oklch(1 0 0 / 0.9)', borderColor: 'var(--border)' }}>
                <div className="text-4xl">{f.emoji}</div>
                <h3 className="mt-4 text-xl font-bold" style={{ color: 'var(--foreground)' }}>{copy.t}</h3>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>{copy.s}</p>
                <div className="mt-5 flex items-center gap-2 border-t pt-4 text-sm flex-wrap" style={{ borderColor: 'var(--border)' }}>
                  {f.chips.map((c) => (
                    <span key={c} className="rounded-lg px-2 py-1 text-xs font-bold text-white" style={{ background: 'var(--gradient-primary)' }}>{c}</span>
                  ))}
                  <span style={{ color: 'var(--muted-foreground)' }}>{f.chipSub}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* STYLES */}
      <section id="styles" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <div className="text-sm font-semibold tracking-widest uppercase" style={{ color: 'var(--primary)' }}>4 reply styles</div>
          <h2 className="font-display mt-3 text-5xl tracking-tight md:text-6xl" style={{ color: 'var(--foreground)' }}>
            {lang === 'hi' ? 'Har chat ke liye' : 'A tone for'}{' '}
            <span className="italic" style={{ color: 'var(--primary)' }}>{lang === 'hi' ? 'sahi tone.' : 'every chat.'}</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STYLES.map((s, i) => (
            <div key={s.name} className={`shadow-card rounded-3xl bg-gradient-to-br ${s.color} text-white p-6 transition-transform hover:-translate-y-2`}
              style={{ transform: `rotate(${(i - 1.5) * 1.5}deg)` }}>
              <div className="text-[10px] font-bold tracking-widest opacity-80">{s.name}</div>
              <p className="font-display mt-4 text-xl leading-snug">&ldquo;{lang === 'hi' ? s.hi : s.en}&rdquo;</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <div className="text-sm font-semibold tracking-widest uppercase" style={{ color: 'var(--primary)' }}>{lang === 'hi' ? 'kaise kaam karta hai' : 'how it works'}</div>
          <h2 className="font-display mt-3 text-5xl tracking-tight md:text-6xl" style={{ color: 'var(--foreground)' }}>
            {lang === 'hi' ? 'Teen taps mein' : 'Three taps to'}{' '}
            <span className="italic" style={{ color: 'var(--primary)' }}>{lang === 'hi' ? 'smooth.' : 'smooth.'}</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {(lang === 'hi'
            ? [
              { n: '01', t: 'Screenshot daalo', d: 'Apna DM snap karo, drag karo. FlirtIQ poora vibe padh leta hai.' },
              { n: '02', t: 'Compatibility score pao', d: 'Tone, intent, interest — 1 se 100 tak score milega.' },
              { n: '03', t: 'Reply chuno', d: 'Chaar voices ready hain copy karne ke liye. Edit karo, bhejo, date pakki karo.' },
            ]
            : [
              { n: '01', t: 'Drop a screenshot', d: "Snap your DM, drag it in. FlirtIQ reads the whole vibe." },
              { n: '02', t: 'Get a compatibility read', d: 'Tone, intent, interest — scored from 1 to 100.' },
              { n: '03', t: 'Pick your reply', d: 'Four voices ready to copy. Edit, send, get a date.' },
            ]
          ).map((s) => (
            <div key={s.n} className="rounded-3xl border p-7 backdrop-blur shadow-soft" style={{ background: 'oklch(1 0 0 / 0.9)', borderColor: 'var(--border)' }}>
              <div className="font-display text-5xl" style={{ color: 'var(--primary)' }}>{s.n}</div>
              <h3 className="mt-2 text-xl font-bold" style={{ color: 'var(--foreground)' }}>{s.t}</h3>
              <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-12">
          <div className="text-sm font-semibold tracking-widest uppercase" style={{ color: 'var(--primary)' }}>loved by daters</div>
          <h2 className="font-display mt-3 text-5xl tracking-tight md:text-6xl" style={{ color: 'var(--foreground)' }}>
            {lang === 'hi' ? 'Real results,' : 'Real results,'}{' '}
            <span className="italic" style={{ color: 'var(--primary)' }}>{lang === 'hi' ? 'real dates.' : 'real dates.'}</span>
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-3xl border p-6 shadow-soft backdrop-blur" style={{ background: 'oklch(1 0 0 / 0.9)', borderColor: 'var(--border)' }}>
              <div className="flex gap-0.5 mb-3" style={{ color: 'var(--primary)' }}>★★★★★</div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>&ldquo;{t.text}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-bold text-sm text-white" style={{ background: 'var(--gradient-primary)' }}>
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{t.name}</div>
                  <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{t.loc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* APP DOWNLOAD */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-[2.5rem] overflow-hidden shadow-card" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left: text */}
            <div className="p-10 md:p-14 flex flex-col justify-center">
              <div className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--primary)' }}>
                📱 {lang === 'hi' ? 'App download karo' : 'Get the app'}
              </div>
              <h2 className="font-display text-4xl md:text-5xl tracking-tight mb-4" style={{ color: 'var(--foreground)' }}>
                {lang === 'hi' ? 'Kahin bhi,\n' : 'Your co-pilot,\n'}
                <span className="italic" style={{ color: 'var(--primary)' }}>
                  {lang === 'hi' ? 'kisi bhi waqt.' : 'everywhere.'}
                </span>
              </h2>
              <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--muted-foreground)' }}>
                {lang === 'hi'
                  ? 'FlirtIQ ab aapke phone par available hai. Tinder, Bumble ya WhatsApp se screenshot lo aur seedha app mein analyze karo.'
                  : 'FlirtIQ is available on your phone. Screenshot directly from Tinder, Bumble, or WhatsApp and analyze without switching apps.'}
              </p>

              {/* Store badges */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* App Store */}
                <a href="#" onClick={e => e.preventDefault()}
                  className="flex items-center gap-3 rounded-2xl px-5 py-3.5 transition-transform hover:scale-105 shadow-soft"
                  style={{ background: 'var(--foreground)', color: 'var(--background)' }}
                  title="iOS App — coming soon">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 shrink-0" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div>
                    <div className="text-[10px] opacity-70 leading-none">{lang === 'hi' ? 'Coming Soon on' : 'Coming Soon on'}</div>
                    <div className="text-base font-bold leading-tight">App Store</div>
                  </div>
                </a>

                {/* Google Play */}
                <a href="#" onClick={e => e.preventDefault()}
                  className="flex items-center gap-3 rounded-2xl px-5 py-3.5 transition-transform hover:scale-105 shadow-soft"
                  style={{ background: 'var(--foreground)', color: 'var(--background)' }}
                  title="Android App — coming soon">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 shrink-0" fill="currentColor">
                    <path d="M3.18 23.76c.3.17.64.24.99.2l12.23-12.24L13 8.32 3.18 23.76zM20.72 9.58l-3.06-1.76-3.4 3.4 3.4 3.4 3.09-1.78c.88-.51.88-1.75-.03-2.26zM2.1.49C1.82.64 1.65.95 1.65 1.37v21.26c0 .42.17.73.46.88L14.1 11.55 2.1.49zM16.34 3.4L4.12.2c-.35-.1-.68-.03-.99.14L15.99 11.2l.35-.35L16.34 3.4z"/>
                  </svg>
                  <div>
                    <div className="text-[10px] opacity-70 leading-none">{lang === 'hi' ? 'Coming Soon on' : 'Coming Soon on'}</div>
                    <div className="text-base font-bold leading-tight">Google Play</div>
                  </div>
                </a>
              </div>

              {/* PWA install note */}
              <p className="mt-5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {lang === 'hi'
                  ? '💡 Abhi ke liye: browser mein "Add to Home Screen" karke install karo — bilkul app jaisi feel hai.'
                  : '💡 Right now: tap "Add to Home Screen" in your browser to install — works exactly like a native app.'}
              </p>
            </div>

            {/* Right: phone preview */}
            <div className="relative flex items-center justify-center p-10 md:p-14"
              style={{ background: 'var(--gradient-primary)' }}>
              {/* Decorative blobs */}
              <div className="absolute top-8 right-8 text-5xl opacity-20">💗</div>
              <div className="absolute bottom-8 left-8 text-4xl opacity-20">✨</div>
              <div className="absolute top-1/2 left-4 text-3xl opacity-10">💌</div>

              {/* Mini phone mockup */}
              <div className="relative w-52">
                <div className="rounded-[2rem] p-1 shadow-card" style={{ border: '8px solid rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.9)' }}>
                  <div className="rounded-[1.5rem] overflow-hidden" style={{ background: 'var(--background)' }}>
                    {/* Status bar */}
                    <div className="flex items-center justify-between px-4 pt-3 pb-1 text-[8px]" style={{ color: 'var(--foreground)' }}>
                      <span className="font-semibold">9:41</span>
                      <div className="flex gap-1">
                        <span>▲</span><span>●●●●</span>
                      </div>
                    </div>
                    {/* App header */}
                    <div className="px-4 py-2 text-center">
                      <div className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>💗 FlirtIQ</div>
                    </div>
                    {/* Chat bubbles */}
                    <div className="px-3 py-2 space-y-2">
                      <div className="text-[9px] rounded-xl rounded-tl-sm px-3 py-1.5 max-w-[80%]"
                        style={{ background: 'var(--muted)', color: 'var(--foreground)' }}>
                        Hey! Plans tonight? 😊
                      </div>
                      <div className="text-[9px] rounded-xl rounded-tr-sm px-3 py-1.5 max-w-[80%] ml-auto text-white"
                        style={{ background: 'var(--gradient-primary)' }}>
                        Depends on your offer 😏
                      </div>
                    </div>
                    {/* Score */}
                    <div className="mx-3 mb-2 rounded-xl p-2 text-center" style={{ background: 'var(--muted)' }}>
                      <div className="text-[8px] font-semibold" style={{ color: 'var(--muted-foreground)' }}>COMPATIBILITY</div>
                      <div className="text-lg font-bold" style={{ color: 'var(--primary)' }}>87%</div>
                    </div>
                    {/* Style chips */}
                    <div className="px-3 pb-3 flex flex-wrap gap-1">
                      {['Flirty', 'Confident', 'Funny', 'Sweet'].map(s => (
                        <span key={s} className="text-[7px] font-bold px-1.5 py-0.5 rounded-full text-white"
                          style={{ background: 'var(--gradient-primary)' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Floating hearts */}
                <span className="animate-float-soft absolute -top-3 -right-4 text-2xl" style={{ animationDelay: '0.3s' }}>💕</span>
                <span className="animate-float-soft absolute -bottom-2 -left-4 text-xl" style={{ animationDelay: '1s' }}>✨</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-12">
          <div className="text-sm font-semibold tracking-widest uppercase" style={{ color: 'var(--primary)' }}>pricing</div>
          <h2 className="font-display mt-3 text-5xl tracking-tight md:text-6xl" style={{ color: 'var(--foreground)' }}>
            {lang === 'hi' ? 'Simple pricing.' : 'Simple pricing.'}{' '}
            <span className="italic" style={{ color: 'var(--primary)' }}>{lang === 'hi' ? 'Koi hidden fees nahi.' : 'No hidden fees.'}</span>
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan) => {
            const p = plan[lang]
            return (
              <div key={plan.key} className={`relative rounded-3xl border p-6 shadow-soft backdrop-blur transition-transform hover:-translate-y-1 ${plan.popular ? 'ring-2' : ''}`}
                style={{ background: 'oklch(1 0 0 / 0.9)', borderColor: 'var(--border)', ...(plan.popular ? { ringColor: 'var(--primary)' } : {}) }}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: 'var(--gradient-primary)' }}>
                    {lang === 'hi' ? 'POPULAR' : 'POPULAR'}
                  </div>
                )}
                <div className="text-2xl font-extrabold mt-2" style={{ color: 'var(--foreground)' }}>{p.price}</div>
                <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{p.period}</div>
                <div className="mt-2 font-bold text-lg" style={{ color: 'var(--foreground)' }}>{p.name}</div>
                <div className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>{p.desc}</div>
                <Link href={plan.href}
                  className="mt-5 block rounded-full py-2.5 text-center text-sm font-semibold text-white transition-transform hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${plan.gradient.replace('from-', '').replace(' to-', ', ')})` }}>
                  {p.cta}
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-20">
        <div className="text-center mb-12">
          <div className="text-sm font-semibold tracking-widest uppercase" style={{ color: 'var(--primary)' }}>faq</div>
          <h2 className="font-display mt-3 text-5xl tracking-tight" style={{ color: 'var(--foreground)' }}>
            {lang === 'hi' ? 'Common sawaal.' : 'Common questions.'}{' '}
            <span className="italic" style={{ color: 'var(--primary)' }}>{lang === 'hi' ? 'Simple jawab.' : 'Simple answers.'}</span>
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-2xl border overflow-hidden" style={{ background: 'oklch(1 0 0 / 0.9)', borderColor: 'var(--border)' }}>
              <button className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-sm"
                style={{ color: 'var(--foreground)' }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {f.q}
                <span className="shrink-0 ml-2 transition-transform" style={{ transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)', color: 'var(--primary)' }}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-[2.5rem] p-12 text-center text-white md:p-20 shadow-card" style={{ background: 'var(--gradient-primary)' }}>
          <div className="absolute -top-20 -left-20 text-9xl opacity-10">💗</div>
          <div className="absolute -right-12 -bottom-16 text-9xl opacity-10">✨</div>
          <h2 className="font-display relative text-5xl md:text-7xl">
            {lang === 'hi' ? 'Keyboard ghurna band karo.' : 'Stop staring at the keyboard.'}
            <br />
            <span className="italic">{lang === 'hi' ? 'Date pakki karo.' : 'Start a date.'}</span>
          </h2>
          <p className="relative mx-auto mt-5 max-w-lg opacity-90">
            {lang === 'hi' ? 'Free mein shuru karo. Koi card nahi. Har app pe kaam karta hai.' : 'Free to start. No card. Works on every app you already use.'}
          </p>
          <Link href="/dashboard"
            className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold transition-transform hover:scale-105 shadow-pill"
            style={{ color: 'var(--primary)' }}>
            {lang === 'hi' ? 'FlirtIQ Free Try Karo' : 'Try FlirtIQ Free'} <span>→</span>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t py-10 px-6" style={{ borderColor: 'oklch(0.92 0.015 340 / 0.6)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="grid h-8 w-8 place-items-center rounded-xl text-base text-white" style={{ background: 'var(--gradient-primary)' }}>💗</span>
                <span className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>FlirtIQ</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {lang === 'hi' ? 'Perfect message likhne ka AI assistant.' : 'AI dating assistant for perfect replies.'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3" style={{ color: 'var(--foreground)' }}>Product</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <li><Link href="/dashboard" className="hover:opacity-80">Dashboard</Link></li>
                <li><Link href="/pricing" className="hover:opacity-80">Pricing</Link></li>
                <li><a href="#features" className="hover:opacity-80">Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3" style={{ color: 'var(--foreground)' }}>Legal</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <li><Link href="/privacy" className="hover:opacity-80">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:opacity-80">Terms of Service</Link></li>
                <li><a href="mailto:hello@flirtiq.app" className="hover:opacity-80">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-6 text-center text-sm" style={{ borderColor: 'oklch(0.92 0.015 340 / 0.6)', color: 'var(--muted-foreground)' }}>
            © {new Date().getFullYear()} FlirtIQ — made with 💗 for awkward openers everywhere.
          </div>
        </div>
      </footer>
    </div>
  )
}
