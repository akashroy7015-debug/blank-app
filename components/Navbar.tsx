'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { Menu, X, LogOut, User } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { useLanguage } from '@/lib/language'

export default function Navbar() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { lang, setLang } = useLanguage()

  useEffect(() => {
    const supabase = createBrowserClient()
    if (!supabase) { setIsLoading(false); return }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createBrowserClient()
    if (supabase) await supabase.auth.signOut()
    router.push('/')
    setIsMenuOpen(false)
  }

  return (
    <nav className="border-b border-white/8 bg-[#08080f]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold">
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              💋 RizzAI
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-gray-400 hover:text-white transition-colors text-sm">
              Features
            </Link>
            <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors text-sm">
              Pricing
            </Link>
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
              Dashboard
            </Link>
          </div>

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="hidden md:flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 hover:border-pink-500/40 text-gray-400 hover:text-white transition-all"
          >
            {lang === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 EN'}
          </button>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                  <span className="hidden lg:block max-w-[160px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-300 hover:text-white transition-colors text-sm px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl px-4 py-2 text-sm transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-400 hover:text-white transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-white/8 bg-[#08080f] px-4 py-4 space-y-3">
          <Link
            href="/#features"
            onClick={() => setIsMenuOpen(false)}
            className="block text-gray-400 hover:text-white transition-colors py-2"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            onClick={() => setIsMenuOpen(false)}
            className="block text-gray-400 hover:text-white transition-colors py-2"
          >
            Pricing
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setIsMenuOpen(false)}
            className="block text-gray-400 hover:text-white transition-colors py-2"
          >
            Dashboard
          </Link>
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white w-fit transition-all"
          >
            {lang === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
          </button>
          <div className="pt-2 border-t border-white/8 flex flex-col gap-2">
            {user ? (
              <>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-300 hover:text-white transition-colors text-sm py-2"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl px-4 py-3 text-sm text-center transition-all"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
