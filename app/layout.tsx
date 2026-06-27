import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/lib/language'
import InstallBanner from '@/components/InstallBanner'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://flirtiq.online'
const TITLE = 'FlirtIQ — Write the perfect message.'
const DESCRIPTION = 'Upload your chat screenshot — FlirtIQ reads the tone, gives you 4 perfect replies and a compatibility score. Works on Tinder, Bumble, Hinge, Instagram, WhatsApp & more.'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: TITLE,
  description: DESCRIPTION,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FlirtIQ',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: APP_URL,
    siteName: 'FlirtIQ',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'FlirtIQ — Write the perfect message.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />
        <meta name="theme-color" content="#E8395A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FlirtIQ" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <LanguageProvider>
          {children}
          <InstallBanner />
        </LanguageProvider>
      </body>
    </html>
  )
}
