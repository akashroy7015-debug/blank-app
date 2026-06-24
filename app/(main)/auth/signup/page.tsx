'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import Logo from '@/components/Logo'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setIsLoading(true)
    try {
      const supabase = createBrowserClient()
      if (!supabase) { setError('Auth not configured. Add Supabase env vars in Vercel.'); setIsLoading(false); return }
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/dashboard` } })
      if (error) { setError(error.message); return }
      setSuccess(true)
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
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-3xl p-10 text-center shadow-card" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'oklch(0.6 0.18 160 / 0.12)' }}>
              <CheckCircle size={32} style={{ color: 'oklch(0.6 0.18 160)' }} />
            </div>
            <h2 className="font-display text-3xl mb-2" style={{ color: 'var(--foreground)' }}>Check your email</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
              We&apos;ve sent a confirmation link to <strong style={{ color: 'var(--foreground)' }}>{email}</strong>.
              Click it to activate your account.
            </p>
            <Link href="/auth/login"
              className="inline-block rounded-full px-6 py-3 font-semibold text-white shadow-pill transition-transform hover:scale-105"
              style={{ background: 'var(--gradient-primary)' }}>
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center gap-2 mb-6">
            <Logo size={40} className="shadow-pill rounded-xl" />
            <span className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>FlirtIQ</span>
          </Link>
          <h1 className="font-display text-3xl mb-2" style={{ color: 'var(--foreground)' }}>Create your account</h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Start free — no credit card required</p>
        </div>

        <div className="rounded-3xl p-8 shadow-card" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <form onSubmit={handleSignup} className="space-y-5">
            {error && (
              <div className="rounded-xl p-4 flex items-center gap-3"
                style={{ background: 'oklch(0.577 0.245 27.325 / 0.08)', border: '1px solid oklch(0.577 0.245 27.325 / 0.3)' }}>
                <AlertCircle size={17} style={{ color: 'oklch(0.577 0.245 27.325)', flexShrink: 0 }} />
                <p className="text-sm" style={{ color: 'oklch(0.577 0.245 27.325)' }}>{error}</p>
              </div>
            )}

            {[
              { label: 'Email address', type: 'email', value: email, set: setEmail, placeholder: 'you@example.com' },
              { label: 'Password', type: showPassword ? 'text' : 'password', value: password, set: setPassword, placeholder: 'Min. 8 characters', toggle: () => setShowPassword(!showPassword), shown: showPassword },
              { label: 'Confirm password', type: showConfirmPassword ? 'text' : 'password', value: confirmPassword, set: setConfirmPassword, placeholder: 'Repeat password', toggle: () => setShowConfirmPassword(!showConfirmPassword), shown: showConfirmPassword },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>{field.label}</label>
                <div className="relative">
                  <input type={field.type} value={field.value} onChange={(e) => field.set(e.target.value)} required
                    style={{ ...inputStyle, paddingRight: field.toggle ? '3rem' : '1rem' }}
                    placeholder={field.placeholder}
                    onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                  {field.toggle && (
                    <button type="button" onClick={field.toggle}
                      className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--muted-foreground)' }}>
                      {field.shown ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="submit" disabled={isLoading}
              className="w-full rounded-full py-3 font-semibold text-white transition-all flex items-center justify-center gap-2 shadow-pill hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'var(--gradient-primary)' }}>
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
              ) : 'Create Account — Free'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold hover:opacity-70 transition-opacity" style={{ color: 'var(--primary)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
