import Link from 'next/link'

export const metadata = {
  title: 'Refund Policy — FlirtIQ',
  description: 'Refund and cancellation policy for FlirtIQ.',
}

export default function RefundsPage() {
  return (
    <main className="min-h-screen py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <Link href="/" className="text-sm transition-opacity hover:opacity-70" style={{color:"var(--primary)"}}>
            ← Back to FlirtIQ
          </Link>
        </div>

        <h1 className="font-display text-4xl italic mb-3" style={{ color: 'var(--foreground)' }}>Refund Policy</h1>
        <p className="text-sm mb-12" style={{ color: 'var(--muted-foreground)' }}>Last updated: June 24, 2026</p>

        <div className="max-w-none space-y-10 text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>

          <section>
            <h2 className="text-xl font-semibold mb-4">1. Overview</h2>
            <p>
              FlirtIQ (&ldquo;the Service&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is a digital software product delivered instantly online. All purchases — subscriptions and one-time credit packs — are processed by <strong>Paddle</strong>, our payment processor and Merchant of Record. Paddle handles billing, taxes, and refund disbursement on our behalf. This policy explains when and how you can request a refund.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Digital Goods &amp; Instant Access</h2>
            <p>
              Because FlirtIQ provides immediate access to AI-powered features upon purchase, all sales are generally considered final. However, we genuinely want you to be satisfied, so we offer refunds in the circumstances described below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. When You Are Eligible for a Refund</h2>
            <p>We will issue a full or partial refund if any of the following apply:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>You were charged but never received access to the paid features due to a technical error on our side.</li>
              <li>You were charged more than once for the same purchase (duplicate or accidental billing).</li>
              <li>You request a refund within <strong>7 days</strong> of your first subscription purchase and have used fewer than <strong>10 analyses</strong> during that period.</li>
              <li>You were billed for a subscription renewal that you had already cancelled before the renewal date.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Credits (Pay As You Go)</h2>
            <p>
              One-time credit packs are non-refundable once credits have been used, as they grant immediate access to analyses. If you purchased credits and have <strong>not used any of them</strong>, you may request a full refund within <strong>14 days</strong> of purchase. Partially used credit packs are not eligible for a refund.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Subscription Cancellations</h2>
            <p>
              You may cancel a subscription (Weekly, Monthly, or Yearly) at any time from your account or by contacting us. Cancellation stops future renewals — you retain access to paid features until the end of your current billing period. Cancelling does not automatically trigger a refund for the current period unless you also qualify under Section 3 above.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. How to Request a Refund</h2>
            <p>
              To request a refund, email <a href="mailto:support@flirtiq.online" className="hover:underline" style={{color:"var(--primary)"}}>support@flirtiq.online</a> with:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>The email address used for your purchase</li>
              <li>Your Paddle order ID or receipt number (found in your purchase confirmation email)</li>
              <li>A brief reason for the refund request</li>
            </ul>
            <p className="mt-3">
              We review every request individually and respond within <strong>2 business days</strong>. Approved refunds are processed by Paddle and typically appear on your original payment method within <strong>5–10 business days</strong>, depending on your bank or card provider.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Statutory Rights</h2>
            <p>
              If you are a consumer in the European Union, United Kingdom, or another jurisdiction with mandatory consumer-protection laws, you retain all statutory refund and withdrawal rights granted to you by law, which are not affected by this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Contact</h2>
            <p>
              Questions about this Refund Policy? Reach us at:<br />
              <a href="mailto:support@flirtiq.online" className="hover:underline" style={{color:"var(--primary)"}}>support@flirtiq.online</a>
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
