import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/lib/language'
import InstallBanner from '@/components/InstallBanner'
import { SpeedInsights } from '@vercel/speed-insights/next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://flirtiq.online'
const TITLE = 'FlirtIQ — AI Dating Assistant: Perfect Replies & Rizz Generator'
const DESCRIPTION = 'FlirtIQ is your AI dating coach. Upload a chat screenshot and get 4 perfect replies, a compatibility score, and what to say next. Works on Tinder, Bumble, Hinge, Instagram & WhatsApp — in 10+ languages.'

const KEYWORDS = [
  'AI dating assistant', 'rizz app', 'rizz generator', 'AI rizz', 'dating reply generator',
  'pickup line generator', 'Tinder reply helper', 'Bumble opener', 'Hinge prompts',
  'what to reply on dating apps', 'AI flirting assistant', 'chat reply AI', 'dating coach app',
  'conversation starter generator', 'flirt AI', 'dating message helper', 'screenshot reply AI',
]

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: TITLE,
    template: '%s — FlirtIQ',
  },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: 'FlirtIQ',
  authors: [{ name: 'FlirtIQ' }],
  creator: 'FlirtIQ',
  publisher: 'FlirtIQ',
  category: 'lifestyle',
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  formatDetection: {
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
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
    locale: 'en_US',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'FlirtIQ — AI Dating Assistant' }],
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

// Structured data (JSON-LD) — helps Google show rich results
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${APP_URL}/#organization`,
      name: 'FlirtIQ',
      url: APP_URL,
      logo: `${APP_URL}/icon-512.png`,
    },
    {
      '@type': 'WebSite',
      '@id': `${APP_URL}/#website`,
      url: APP_URL,
      name: 'FlirtIQ',
      description: DESCRIPTION,
      publisher: { '@id': `${APP_URL}/#organization` },
      inLanguage: 'en',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'FlirtIQ',
      operatingSystem: 'Web, Android, iOS',
      applicationCategory: 'LifestyleApplication',
      description: DESCRIPTION,
      url: APP_URL,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free tier with 3 analyses per day; paid credits and subscriptions available.',
      },
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body>
        <LanguageProvider>
          {children}
          <InstallBanner />
        </LanguageProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
