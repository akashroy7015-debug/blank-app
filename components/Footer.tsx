import Link from 'next/link'
import { Heart, Twitter, Instagram, Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[#08080f] py-12 px-4 mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                ✨ FlirtIQ
              </span>
            </Link>
            <p className="text-gray-400 mt-3 text-sm max-w-xs">
              Write the perfect message. Upload a chat screenshot and get 4 perfect replies, a compatibility score, and expert strategy — powered by Gemini AI.
            </p>
            <div className="flex items-center gap-4 mt-5">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-400 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-400 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-400 transition-colors">
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/#features" className="text-gray-400 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="mailto:hello@flirtiq.app" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} FlirtIQ. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            Made with <Heart size={14} className="text-pink-500" /> for romantics everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}
