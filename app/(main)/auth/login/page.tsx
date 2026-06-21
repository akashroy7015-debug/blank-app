'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const supabase = createBrowserClient()
      if (!supabase) { setError('Auth not configured. Add Supabase env vars in Vercel.'); setIsLoading(false); return }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); return }
      router.push('/dashboard')
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--muted)',
    border: '1px solid var(--border)',
    borderRadius: '0.75rem',
    padding: '0.75rem 1rem',
    color: 'var(--foreground)',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.15s',
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center gap-2 mb-6">
            <span className="grid h-10 w-10 place-items-center rounded-2xl text-lg text-white shadow-pill"
              style={{ background: 'var(--gradient-primary)' }}>💗</span>
            <span className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>FlirtIQ</span>
          </Link>
          <h1 className="font-display text-3xl mb-2" style={{ color: 'var(--foreground)' }}>Welcome back</h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Sign in to your account</p>
        </div>

        <div className="rounded-3xl p-8 shadow-card" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="rounded-xl p-4 flex items-center gap-3"
                style={{ background: 'oklch(0.577 0.245 27.325 / 0.08)', border: '1px solid oklch(0.577 0.245 27.325 / 0.3)' }}>
                <AlertCircle size={17} style={{ color: 'oklch(0.577 0.245 27.325)', flexShrink: 0 }} />
                <p className="text-sm" style={{ color: 'oklch(0.577 0.245 27.325)' }}>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                style={inputStyle} placeholder="you@example.com"
                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                  style={{ ...inputStyle, paddingRight: '3rem' }} placeholder="••••••••"
                  onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--muted-foreground)' }}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full rounded-full py-3 font-semibold text-white transition-all flex items-center justify-center gap-2 shadow-pill hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'var(--gradient-primary)' }}>
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-semibold hover:opacity-70 transition-opacity" style={{ color: 'var(--primary)' }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
