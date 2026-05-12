import { Link } from "react-router-dom";

const links = [
  { slug: "terms", label: "Terms of Service" },
  { slug: "privacy", label: "Privacy Policy" },
  { slug: "community", label: "Community Guidelines" },
  { slug: "cookies", label: "Cookie Policy" },
  { slug: "refund", label: "Refund & Cancellation" },
  { slug: "safety", label: "Safety Center" },
  { slug: "moderation", label: "Content Moderation" },
  { slug: "age", label: "Age Restriction" },
  { slug: "data-deletion", label: "Data Deletion" },
  { slug: "consent", label: "Consent Management" },
  { slug: "dmca", label: "Copyright & DMCA" },
  { slug: "ai-disclosure", label: "AI Usage Disclosure" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-24 bg-[var(--surface)]">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="font-serif text-3xl mb-3">sparQ<span className="text-[var(--primary)]">.</span></div>
            <p className="text-sm text-[var(--muted)] leading-relaxed">A premium, trust-first dating experience designed for real connection.</p>
          </div>
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
            {links.map((l) => (
              <Link key={l.slug} to={`/legal/${l.slug}`} data-testid={`footer-legal-${l.slug}`} className="text-sm text-[var(--secondary-fg)] hover:text-[var(--primary)] transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="divider-line my-10" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-[var(--muted)]">© {new Date().getFullYear()} sparQ. All rights reserved.</p>
          <p className="text-xs text-[var(--muted)]">Designed for adults 18+. AI-assisted moderation enabled.</p>
        </div>
      </div>
    </footer>
  );
}

export { links as legalLinks };
