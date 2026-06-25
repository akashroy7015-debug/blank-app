'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { Menu, X, LogOut, User, Globe, ChevronDown } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { useLanguage, LANGS } from '@/lib/language'
import Logo from '@/components/Logo'

export default function Navbar() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    const supabase = createBrowserClient()
    if (supabase) await supabase.auth.signOut()
    router.push('/')
    setIsMenuOpen(false)
  }

  const currentLang = LANGS.find(l => l.code === lang) ?? LANGS[0]

  return (
    <nav style={{
      borderBottom: '1px solid var(--border)',
      background: 'oklch(0.985 0.005 60 / 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} className="shadow-pill rounded-[9px]" />
            <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>FlirtIQ</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
            <Link href="/#features" className="hover:opacity-80 transition-opacity">Features</Link>
            <Link href="/pricing" className="hover:opacity-80 transition-opacity">Pricing</Link>
            <Link href="/dashboard" className="hover:opacity-80 transition-opacity">Dashboard</Link>
          </div>

          {/* Language picker (desktop) */}
          <div className="hidden md:block relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(o => !o)}
              aria-label="Switch language"
              aria-expanded={langOpen}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border hover:opacity-80 transition-opacity"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
            >
              <Globe size={13} />
              <span>{currentLang.flag} {currentLang.code.toUpperCase()}</span>
              <ChevronDown size={11} style={{ transform: langOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 rounded-2xl shadow-lg overflow-hidden z-50"
                style={{ background: 'oklch(0.99 0.003 60)', border: '1px solid var(--border)', minWidth: 160 }}>
                {LANGS.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:opacity-80 transition-opacity text-left"
                    style={{
                      color: 'var(--foreground)',
                      background: l.code === lang ? 'oklch(0.64 0.24 5 / 0.08)' : 'transparent',
                      fontWeight: l.code === lang ? 600 : 400,
                    }}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: 'var(--muted)' }} />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ background: 'var(--gradient-primary)' }}>
                    <User size={14} />
                  </div>
                  <span className="hidden lg:block max-w-[160px] truncate">{user.email}</span>
                </div>
                <button onClick={handleLogout}
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-full hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--muted-foreground)' }}>
                  <LogOut size={15} /> Logout
                </button>
              </div>
            ) : (
              <>
                <Link href="/auth/login"
                  className="text-sm px-4 py-2 hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--muted-foreground)' }}>
                  Login
                </Link>
                <Link href="/auth/signup"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-pill transition-transform hover:scale-105"
                  style={{ background: 'var(--gradient-primary)' }}>
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            className="md:hidden hover:opacity-70 transition-opacity"
            style={{ color: 'var(--muted-foreground)' }}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 py-4 space-y-3"
          style={{ borderTop: '1px solid var(--border)', background: 'oklch(0.985 0.005 60 / 0.97)' }}>
          {[['Features', '/#features'], ['Pricing', '/pricing'], ['Dashboard', '/dashboard']].map(([label, href]) => (
            <Link key={label} href={href} onClick={() => setIsMenuOpen(false)}
              className="block py-2 text-sm hover:opacity-70 transition-opacity"
              style={{ color: 'var(--muted-foreground)' }}>
              {label}
            </Link>
          ))}

          {/* Mobile language picker */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>Language</p>
            <div className="grid grid-cols-2 gap-1.5">
              {LANGS.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setIsMenuOpen(false) }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-left transition-opacity hover:opacity-80"
                  style={{
                    background: l.code === lang ? 'oklch(0.64 0.24 5 / 0.1)' : 'var(--muted)',
                    color: l.code === lang ? 'var(--primary)' : 'var(--muted-foreground)',
                    border: l.code === lang ? '1px solid oklch(0.64 0.24 5 / 0.3)' : '1px solid transparent',
                    fontWeight: l.code === lang ? 600 : 400,
                  }}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
            {user ? (
              <>
                <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{user.email}</p>
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm"
                  style={{ color: 'var(--muted-foreground)' }}>
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}
                  className="text-sm py-2" style={{ color: 'var(--muted-foreground)' }}>Login</Link>
                <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}
                  className="rounded-full px-4 py-3 text-sm font-semibold text-white text-center shadow-pill"
                  style={{ background: 'var(--gradient-primary)' }}>Sign Up Free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
