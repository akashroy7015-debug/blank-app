import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Heart, ShieldCheck, Sparkle, Lock, Crown, UsersThree } from "@phosphor-icons/react";

const HERO = "https://images.unsplash.com/photo-1713528757608-cac0e6c26155?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTF8MHwxfHNlYXJjaHwyfHxiZWF1dGlmdWwlMjBkaXZlcnNlJTIweW91bmclMjBwZW9wbGUlMjBwb3J0cmFpdCUyMGZhc2hpb258ZW58MHx8fHwxNzc4NTg4OTc3fDA&ixlib=rb-4.1.0&q=85";
const HERO2 = "https://images.unsplash.com/photo-1594250945179-6ace32113329?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTF8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjBkaXZlcnNlJTIweW91bmclMjBwZW9wbGUlMjBwb3J0cmFpdCUyMGZhc2hpb258ZW58MHx8fHwxNzc4NTg4OTc3fDA&ixlib=rb-4.1.0&q=85";
const SAFETY_BG = "https://images.unsplash.com/photo-1614064745490-83abb17303e1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwxfHxzZWN1cmUlMjBzYWZldHklMjBwcml2YWN5JTIwYWJzdHJhY3QlMjBtaW5pbWFsfGVufDB8fHx8MTc3ODU4ODk3N3ww&ixlib=rb-4.1.0&q=85";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] grain">
      {/* Header */}
      <header className="absolute top-0 inset-x-0 z-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
          <Link to="/" className="font-serif text-2xl tracking-tight" data-testid="brand-link">
            Sparkd<span className="text-[var(--primary)]">.</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link to="/login" data-testid="header-login" className="text-sm smallcaps text-[var(--secondary-fg)] hover:text-[var(--text)]">
              Log in
            </Link>
            <Link to="/signup" data-testid="header-signup" className="btn-primary text-sm py-2 px-5">
              Join
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-32 md:pt-44 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="smallcaps text-[var(--primary)] mb-6"
            >
              Made for grown-ups · 18+
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }}
              className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.02]"
            >
              Date with <em className="italic text-[var(--primary)]">intention.</em><br />
              Connect with <span className="text-[var(--accent)]">trust.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-7 text-lg text-[var(--secondary-fg)] max-w-xl leading-relaxed"
            >
              Sparkd is a premium dating app built around safety, verified profiles, and meaningful matches.
              10 free swipes a day.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Link to="/signup" data-testid="hero-cta-signup" className="btn-primary">Create your profile</Link>
              <Link to="/app/plans" data-testid="hero-cta-plans" className="btn-ghost">See plans</Link>
            </motion.div>
            <div className="mt-10 flex flex-wrap gap-3">
              <span className="tag-chip"><ShieldCheck size={14} /> ID-verified badge</span>
              <span className="tag-chip"><Lock size={14} /> GDPR · CCPA · DPDP</span>
              <span className="tag-chip"><Sparkle size={14} /> AI-assisted safety</span>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, y: 30, rotate: -3 }} animate={{ opacity: 1, y: 0, rotate: -3 }} transition={{ duration: 0.8 }}
              className="absolute -top-4 -left-6 w-56 h-72 rounded-2xl overflow-hidden border border-[var(--border)] shadow-2xl"
            >
              <img src={HERO2} alt="" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30, rotate: 4 }} animate={{ opacity: 1, y: 0, rotate: 4 }} transition={{ duration: 0.8, delay: 0.15 }}
              className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-[var(--border)] shadow-2xl"
            >
              <img src={HERO} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="smallcaps text-[var(--accent)] mb-1">Verified · 27</p>
                <p className="font-serif text-3xl">Ava, the architect</p>
                <p className="text-sm text-[var(--secondary-fg)] mt-1">"Looking for someone with their own world."</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-24 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="smallcaps text-[var(--primary)] mb-2">Plans</p>
              <h2 className="font-serif text-4xl md:text-5xl tracking-tight">Premium that fits your wallet.</h2>
            </div>
            <Link to="/app/plans" data-testid="see-all-plans" className="hidden md:inline-block text-sm smallcaps text-[var(--accent)] hover:text-[var(--primary)]">See full pricing →</Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Basic", perks: ["Unlimited likes", "Rewind last swipe", "5 super likes / day"] },
              { name: "Premium", featured: true, perks: ["See who liked you", "Weekly boost", "Read receipts", "10 super likes / day"] },
              { name: "Platinum", perks: ["Message before match", "Priority likes", "Daily boost", "Unlimited super likes"] },
            ].map((p) => (
              <div key={p.name} className={`surface p-8 ${p.featured ? "ring-1 ring-[var(--primary)]" : ""}`} data-testid={`plan-preview-${p.name.toLowerCase()}`}>
                {p.featured && <span className="smallcaps text-[var(--primary)]">Most popular</span>}
                <h3 className="font-serif text-3xl mt-2">{p.name}</h3>
                <ul className="mt-6 space-y-2 text-sm text-[var(--secondary-fg)]">
                  {p.perks.map(perk => <li key={perk}>— {perk}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-[var(--muted)] mt-8">Also available: <span className="text-[var(--accent)]">Pay-as-you-go Swipe Packs</span> when you just need a few more.</p>
        </div>
      </section>

      {/* Safety section */}
      <section className="py-24 border-t border-[var(--border)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={SAFETY_BG} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12">
          <div>
            <p className="smallcaps text-[var(--primary)] mb-2">Safety</p>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight">A dating app that takes care of its women.</h2>
            <p className="mt-6 text-[var(--secondary-fg)] leading-relaxed max-w-md">
              Verified-only mode, blurred photos until match, location masking, one-tap reporting,
              and fast-track harassment review — built in from day one.
            </p>
            <Link to="/legal/safety" data-testid="explore-safety" className="mt-8 inline-block btn-ghost">Visit Safety Center</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: ShieldCheck, t: "Verified-only", d: "Match only with ID-verified profiles." },
              { icon: Lock, t: "Blur until match", d: "Photos blur until both like." },
              { icon: UsersThree, t: "Trusted reports", d: "Fast-track human review." },
              { icon: Heart, t: "Emergency help", d: "One-tap safety alert." },
            ].map(f => (
              <div key={f.t} className="surface p-5">
                <f.icon size={28} className="text-[var(--primary)] mb-3" weight="duotone" />
                <p className="font-serif text-lg">{f.t}</p>
                <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
