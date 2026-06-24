import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — FlirtIQ',
  description: 'Terms of Service for FlirtIQ AI dating assistant.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <Link href="/" className="text-sm transition-opacity hover:opacity-70" style={{color:"var(--primary)"}}>
            ← Back to FlirtIQ
          </Link>
        </div>

        <h1 className="font-display text-4xl italic mb-3" style={{ color: 'var(--foreground)' }}>Terms of Service</h1>
        <p className="text-sm mb-12" style={{ color: 'var(--muted-foreground)' }}>Last updated: June 20, 2026</p>

        <div className="max-w-none space-y-10 text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>

          <section>
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using FlirtIQ (&ldquo;the Service&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These Terms apply to all visitors, users, and subscribers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
            <p>
              FlirtIQ is an AI-powered dating chat assistant. You upload a screenshot of a conversation from a dating app or messaging platform, and our AI analyzes the tone and context to generate reply suggestions, a compatibility score, and conversation strategy tips. FlirtIQ is powered by advanced AI technology.
            </p>
            <p className="mt-3">
              FlirtIQ is a tool to assist communication — it does not guarantee any romantic outcome, date, or relationship. Replies are AI-generated suggestions, not professional advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Eligibility</h2>
            <p>
              You must be at least <strong className="">18 years of age</strong> to use FlirtIQ. By using the Service, you confirm that you are 18 or older. We do not knowingly allow minors to use the Service. If we discover a user is under 18, we will terminate their account immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Account Registration</h2>
            <p>
              To access certain features, you must create an account using a valid email address. You are responsible for maintaining the security of your account credentials. You agree to notify us immediately at <a href="mailto:legal@flirtiq.app" className="hover:underline" style={{color:"var(--primary)"}}>legal@flirtiq.app</a> if you suspect any unauthorized use of your account.
            </p>
            <p className="mt-3">
              You may not create accounts using automated methods, use another person&apos;s identity, or create multiple free accounts to circumvent usage limits.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Free Tier</h2>
            <p>
              FlirtIQ offers a free tier allowing 3 analyses per day. Free tier usage is tracked locally in your browser and resets at midnight. We reserve the right to change, reduce, or discontinue the free tier at any time with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Paid Subscriptions</h2>
            <p>
              FlirtIQ offers paid subscription plans (Weekly, Monthly, Yearly) that provide unlimited analyses. Subscriptions are billed through <strong className="">Paddle</strong>, our payment processor and Merchant of Record. By purchasing a subscription, you agree to Paddle&apos;s terms at <a href="https://www.paddle.com/legal/terms" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{color:"var(--primary)"}}>paddle.com/legal/terms</a>.
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li><strong className="">Billing:</strong> Subscriptions renew automatically at the end of each billing period (weekly, monthly, or yearly) until cancelled.</li>
              <li><strong className="">Cancellation:</strong> You may cancel at any time through your account or by contacting us. Cancellation takes effect at the end of the current billing period. You retain access until then.</li>
              <li><strong className="">Price changes:</strong> We will notify you at least 14 days before any price change. Continuing to use the Service after the change constitutes acceptance.</li>
              <li><strong className="">Taxes:</strong> Paddle, as Merchant of Record, handles all applicable taxes (GST, VAT, sales tax) globally.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Refund Policy</h2>
            <p>
              Due to the digital nature of the Service and immediate access upon purchase, all sales are generally final. However, we offer refunds in the following circumstances:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>You were charged but never received access to paid features (technical error)</li>
              <li>You request a refund within <strong className="">7 days</strong> of your first purchase and have used fewer than 10 analyses</li>
              <li>Duplicate charges due to a billing error</li>
            </ul>
            <p className="mt-3">
              To request a refund, email <a href="mailto:support@flirtiq.app" className="hover:underline" style={{color:"var(--primary)"}}>support@flirtiq.app</a> with your order ID. Refund requests are processed within 5–7 business days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Acceptable Use</h2>
            <p>You agree not to use FlirtIQ to:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>Upload screenshots containing content of minors</li>
              <li>Generate messages intended to harass, stalk, threaten, or harm others</li>
              <li>Impersonate another person in a harmful or deceptive manner</li>
              <li>Attempt to reverse-engineer, scrape, or extract our AI systems</li>
              <li>Use automated tools to bypass usage limits or access the API without authorization</li>
              <li>Violate any applicable laws, including the Information Technology Act, 2000 (India) or any equivalent international regulation</li>
            </ul>
            <p className="mt-3">
              We reserve the right to terminate accounts that violate these rules without notice or refund.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. AI Disclaimer</h2>
            <p>
              FlirtIQ uses artificial intelligence to generate reply suggestions. All outputs are AI-generated and for entertainment and communication assistance purposes only. We make no guarantees about the accuracy, appropriateness, or effectiveness of any generated content. Use your own judgement before sending any AI-suggested message.
            </p>
            <p className="mt-3">
              FlirtIQ is not a therapist, relationship counsellor, or licensed professional. Nothing on this platform constitutes professional advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Intellectual Property</h2>
            <p>
              All content on FlirtIQ — including the name, logo, UI design, and proprietary AI prompts — is owned by FlirtIQ and protected by applicable intellectual property laws. You may not copy, reproduce, or redistribute any part of the Service without explicit written permission.
            </p>
            <p className="mt-3">
              Screenshots you upload remain your property. By uploading them, you grant FlirtIQ a limited, temporary license to process them solely for generating your requested output. We do not store your screenshots (see Privacy Policy).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">11. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, FlirtIQ and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service — including but not limited to loss of data, loss of revenue, relationship outcomes, or emotional distress.
            </p>
            <p className="mt-3">
              Our total liability to you for any claim arising out of these Terms shall not exceed the amount you paid us in the 30 days preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">12. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless FlirtIQ, its owners, and affiliates from any claims, damages, or expenses (including legal fees) arising from your use of the Service, violation of these Terms, or infringement of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">13. Governing Law</h2>
            <p>
              These Terms are governed by the laws of <strong className="">India</strong>, including the Information Technology Act, 2000. Any disputes shall be subject to the exclusive jurisdiction of the courts in India. If you are a user in the European Union, you retain your statutory rights under applicable EU consumer protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">14. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of material changes by posting a notice on the website or emailing registered users at least 7 days before changes take effect. Continued use of the Service after the effective date constitutes your acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">15. Contact</h2>
            <p>
              For any questions about these Terms, contact us at:<br />
              <a href="mailto:legal@flirtiq.app" className="hover:underline" style={{color:"var(--primary)"}}>legal@flirtiq.app</a>
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
