import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { LanguageProvider } from '@/lib/language'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "FlirtIQ — Write the perfect message.",
  description: "Upload your chat screenshot — FlirtIQ reads the tone, gives you 4 perfect replies and a compatibility score. Works on Tinder, Bumble, Hinge, Instagram, WhatsApp & more.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#08080f] text-white min-h-screen flex flex-col`}>
        <LanguageProvider>
          <Navbar />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}
