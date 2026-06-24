'use client'

import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'
import Logo from '@/components/Logo'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return
    // Don't show if dismissed in this session
    if (sessionStorage.getItem('pwa-banner-dismissed')) return

    const isIosBrowser = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window.navigator as { standalone?: boolean }).standalone
    if (isIosBrowser) {
      setIsIos(true)
      setShow(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShow(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    sessionStorage.setItem('pwa-banner-dismissed', '1')
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl p-4 flex items-center gap-3 shadow-card animate-fade-up"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', maxWidth: 420, margin: '0 auto' }}
      role="banner"
      aria-label="Install FlirtIQ app">
      <Logo size={40} className="shrink-0 rounded-[10px] shadow-pill" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>Add FlirtIQ to Home Screen</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          {isIos
            ? 'Tap the Share button → "Add to Home Screen"'
            : 'Install for instant access — works offline too'}
        </p>
      </div>
      {!isIos && (
        <button
          onClick={handleInstall}
          className="shrink-0 flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white shadow-pill transition-transform hover:scale-105"
          style={{ background: 'var(--gradient-primary)' }}
          aria-label="Install app">
          <Download size={13} /> Install
        </button>
      )}
      <button
        onClick={handleDismiss}
        className="shrink-0 p-1.5 rounded-full hover:opacity-70 transition-opacity"
        style={{ color: 'var(--muted-foreground)' }}
        aria-label="Dismiss install banner">
        <X size={16} />
      </button>
    </div>
  )
}
