'use client'

import { useLanguage } from '@/lib/language'

const reviews = [
  {
    name: 'Rahul M.',
    location: 'Mumbai',
    rating: 5,
    text: "I had no idea how to reply after she said 'depends on your suggestion'. FlirtIQ gave me exactly the right flirty comeback. She said yes to coffee.",
  },
  {
    name: 'Sarah K.',
    location: 'London',
    rating: 5,
    text: "The compatibility score is actually useful — it told me the chat was going cold before I even felt it. The strategy tip saved the conversation.",
  },
  {
    name: 'Arjun S.',
    location: 'Delhi',
    rating: 5,
    text: "Tone choice is everything. Sometimes I want bold, sometimes sweet. Four styles make it easy to match my mood and the vibe of the chat.",
  },
  {
    name: 'Emma T.',
    location: 'Toronto',
    rating: 5,
    text: "Screenshot in, perfect reply out. I was overthinking a message for 20 mins. FlirtIQ solved it in 5 seconds. Simple and actually good.",
  },
  {
    name: 'Priya D.',
    location: 'Bangalore',
    rating: 5,
    text: "The Hinglish replies are surprisingly natural — doesn't feel like AI at all. My friends thought I got more confident suddenly 😂",
  },
  {
    name: 'James L.',
    location: 'Sydney',
    rating: 5,
    text: "Matched on Hinge, conversation was dying. FlirtIQ's funny reply made her laugh and we're going on a date this weekend.",
  },
]

const translations = {
  en: {
    strip: '★★★★★  Loved by daters in 50+ countries',
    badge: '★★★★★',
    ratingLabel: '4.8 rating',
    heading: 'That fast feeling users love.',
    subheading: 'Real results from real conversations.',
  },
  hi: {
    strip: '★★★★★  50+ deshon ke daters ka pyaara',
    badge: '★★★★★',
    ratingLabel: '4.8 rating',
    heading: 'Users ka woh instant feel.',
    subheading: 'Asli conversations ke asli results.',
  },
}

export default function Testimonials() {
  const { lang } = useLanguage()
  const text = translations[lang]

  return (
    <section className="py-20 px-4" id="testimonials">
      {/* Top strip */}
      <div className="bg-gradient-to-r from-pink-500/10 to-purple-600/10 border-y border-pink-500/15 py-3 mb-16 -mx-4 px-4 text-center">
        <p className="text-pink-400 text-sm font-semibold tracking-wide">{text.strip}</p>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-yellow-400 text-2xl tracking-tight">{text.badge}</span>
            <span className="text-gray-400 text-sm font-medium">{text.ratingLabel}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">{text.heading}</h2>
          <p className="text-gray-400 mt-3">{text.subheading}</p>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="bg-[#12121f] border border-white/8 rounded-2xl p-6 flex flex-col gap-4 hover:border-pink-500/25 transition-all"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: review.rating }).map((_, s) => (
                  <span key={s} className="text-yellow-400 text-sm">★</span>
                ))}
              </div>

              {/* Review text */}
              <p className="text-gray-300 text-sm leading-relaxed flex-1">&ldquo;{review.text}&rdquo;</p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {review.name[0]}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{review.name}</p>
                  <p className="text-gray-500 text-xs">{review.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
