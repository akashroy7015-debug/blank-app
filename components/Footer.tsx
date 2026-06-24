import Link from 'next/link'
import { Twitter, Instagram, Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)' }} className="py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl text-sm text-white shadow-pill"
                style={{ background: 'var(--gradient-primary)' }}>💗</span>
              <span className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>FlirtIQ</span>
            </Link>
            <p className="text-sm max-w-xs" style={{ color: 'var(--muted-foreground)' }}>
              Upload a chat screenshot and get 4 perfect replies, a compatibility score, and expert strategy — powered by AI.
            </p>
            <div className="flex items-center gap-4 mt-5">
              {[Twitter, Instagram, Github].map((Icon, i) => (
                <a key={i} href="#" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--muted-foreground)' }}>
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--foreground)' }}>Product</h3>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              <li><Link href="/dashboard" className="hover:opacity-80 transition-opacity">Dashboard</Link></li>
              <li><Link href="/pricing" className="hover:opacity-80 transition-opacity">Pricing</Link></li>
              <li><Link href="/#features" className="hover:opacity-80 transition-opacity">Features</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--foreground)' }}>Legal</h3>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              <li><Link href="/privacy" className="hover:opacity-80 transition-opacity">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:opacity-80 transition-opacity">Terms of Service</Link></li>
              <li><a href="mailto:hello@flirtiq.app" className="hover:opacity-80 transition-opacity">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-3"
          style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            © {new Date().getFullYear()} FlirtIQ. All rights reserved.
          </p>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Made with 💗 for romantics everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}
