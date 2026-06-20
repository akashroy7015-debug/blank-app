'use client'

import { useLanguage } from '@/lib/language'

export default function Story() {
  const { lang } = useLanguage()

  const en = {
    label: 'Why RizzAI exists',
    heading: 'A message\'s RizzAI journey.',
    body: [
      'People match — but after the first message, the conversation can freeze. RizzAI was built to solve that gap with AI: finding the right tone, replying more intelligently, and making digital connection less stressful.',
      'The problem is usually not lack of interest. It\'s writing too much at the wrong time, staying too short, missing the tone, or not reading the other person\'s intent. RizzAI analyzes the context inside your screenshot, reads the energy of the conversation, and offers reply options that aren\'t stuck in a single template.',
      'The result feels less like a generic AI line and closer to your own voice: clearer, more confident, and more natural.',
    ],
    steps: [
      { emoji: '📸', step: 'Step 1', desc: 'Upload a screenshot. RizzAI reads the chat and catches the context.' },
      { emoji: '🧠', step: 'Step 2', desc: 'AI analyzes it. Tone, intent, energy, and compatibility score come together.' },
      { emoji: '🎭', step: 'Step 3', desc: 'Choose your style. Pick from Flirty, Confident, Funny, or Sweet replies.' },
      { emoji: '🚀', step: 'Send it', desc: 'Copy and send. Let your message sound clearer, more natural, more like you.' },
    ],
  }

  const hi = {
    label: 'RizzAI kyun bana?',
    heading: 'Ek message ka RizzAI safar.',
    body: [
      'Log match karte hain — lekin pehle message ke baad conversation freeze ho jaati hai. RizzAI usi gap ko solve karne ke liye bana: sahi tone dhundhne ke liye, smarter replies ke liye, aur digital connection ko less stressful banane ke liye.',
      'Problem aksar interest ki kami nahi hoti. Galat waqt par zyada likhna, bahut chhota rehna, tone miss karna, ya doosre ki intent na samajhna — yahi hota hai. RizzAI tumhare screenshot ka context analyze karta hai, conversation ki energy padhta hai, aur aisi replies deta hai jo generic template se alag feel hoti hain.',
      'Result tumhari apni awaaz jaisi lagti hai: clearer, more confident, aur more natural.',
    ],
    steps: [
      { emoji: '📸', step: 'Step 1', desc: 'Screenshot upload karo. RizzAI chat padhta hai aur context pakadta hai.' },
      { emoji: '🧠', step: 'Step 2', desc: 'AI analyze karta hai. Tone, intent, energy, aur compatibility score ek saath.' },
      { emoji: '🎭', step: 'Step 3', desc: 'Apna style chuno. Flirty, Confident, Funny, ya Sweet — jo sahi lage.' },
      { emoji: '🚀', step: 'Bhejo', desc: 'Copy karo aur bhejo. Tumhara message clearer, natural, aur tumhare jaisa lagega.' },
    ],
  }

  const text = lang === 'hi' ? hi : en

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-pink-400 text-sm font-semibold uppercase tracking-widest mb-3">❤️ {text.label}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{text.heading}</h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {text.steps.map((s, i) => (
            <div key={i} className="relative bg-[#12121f] border border-white/8 rounded-2xl p-5 text-center hover:border-pink-500/30 transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {i + 1}
              </div>
              <div className="text-3xl mb-3 mt-2">{s.emoji}</div>
              <p className="text-pink-400 text-xs font-semibold mb-2">{s.step}</p>
              <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Story text */}
        <div className="bg-[#12121f] border border-white/8 rounded-2xl p-8 space-y-4">
          {text.body.map((para, i) => (
            <p key={i} className="text-gray-400 leading-relaxed text-sm md:text-base">
              {para}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
