import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — FlirtIQ',
  description: 'Privacy Policy for FlirtIQ AI dating assistant.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <Link href="/" className="text-pink-400 hover:text-pink-300 text-sm transition-colors">
            ← Back to FlirtIQ
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-12">Last updated: June 20, 2026</p>

        <div className="prose prose-invert max-w-none space-y-10 text-gray-300 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Who We Are</h2>
            <p>
              FlirtIQ (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the website and service at flirtiq.app. We are the data controller for information collected through our platform.
            </p>
            <p className="mt-3">
              Contact: <a href="mailto:privacy@flirtiq.app" className="text-pink-400 hover:underline">privacy@flirtiq.app</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. What Data We Collect</h2>

            <h3 className="text-base font-semibold text-white mt-5 mb-2">a) Account Data</h3>
            <p>
              When you register, we collect your <strong className="text-white">email address</strong> via Supabase authentication. We do not collect your name, phone number, or any social profile unless you voluntarily provide it.
            </p>

            <h3 className="text-base font-semibold text-white mt-5 mb-2">b) Screenshots You Upload</h3>
            <p>
              Screenshots are transmitted directly to Google&apos;s Gemini API for AI analysis. <strong className="text-white">We do not store screenshots on our servers.</strong> Once the analysis is returned to you, the image is discarded. Google&apos;s use of this data is governed by <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline">Google&apos;s Privacy Policy</a>.
            </p>

            <h3 className="text-base font-semibold text-white mt-5 mb-2">c) Usage Data</h3>
            <p>
              Free tier usage (count of daily analyses) is stored in your browser&apos;s <strong className="text-white">localStorage</strong> — it never leaves your device and is not transmitted to us. Paid tier usage is tracked server-side in Supabase (date and count only, no content).
            </p>

            <h3 className="text-base font-semibold text-white mt-5 mb-2">d) Payment Data</h3>
            <p>
              Payments are processed entirely by <strong className="text-white">Lemon Squeezy</strong> (our Merchant of Record). We never see or store your card number, bank details, or billing address. We receive only a customer ID and subscription status from Lemon Squeezy.
            </p>

            <h3 className="text-base font-semibold text-white mt-5 mb-2">e) Technical Data</h3>
            <p>
              Our hosting provider (Vercel) may collect standard server logs including IP addresses, browser type, and pages visited. This data is used for security and performance monitoring and is subject to <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline">Vercel&apos;s Privacy Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To create and manage your account</li>
              <li>To provide the AI analysis service</li>
              <li>To process your subscription and verify access</li>
              <li>To send important service emails (billing receipts, policy updates)</li>
              <li>To enforce our Terms of Service and prevent abuse</li>
            </ul>
            <p className="mt-3">
              We do <strong className="text-white">not</strong> sell your data, use it for advertising, or share it with third parties beyond what is listed in Section 4.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Third-Party Services</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-white/10 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-white/5">
                    <th className="text-left px-4 py-3 text-white font-semibold">Service</th>
                    <th className="text-left px-4 py-3 text-white font-semibold">Purpose</th>
                    <th className="text-left px-4 py-3 text-white font-semibold">Data Shared</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  <tr>
                    <td className="px-4 py-3 text-pink-400">Google Gemini</td>
                    <td className="px-4 py-3">AI screenshot analysis</td>
                    <td className="px-4 py-3">Your uploaded screenshot (not stored)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-pink-400">Supabase</td>
                    <td className="px-4 py-3">Authentication &amp; database</td>
                    <td className="px-4 py-3">Email, subscription status</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-pink-400">Lemon Squeezy</td>
                    <td className="px-4 py-3">Payment processing</td>
                    <td className="px-4 py-3">Email, payment details</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-pink-400">Vercel</td>
                    <td className="px-4 py-3">Hosting &amp; infrastructure</td>
                    <td className="px-4 py-3">Server logs, IP address</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Legal Basis for Processing (GDPR)</h2>
            <p>If you are in the European Economic Area (EEA), our legal bases are:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li><strong className="text-white">Contract performance</strong> — to provide the service you signed up for</li>
              <li><strong className="text-white">Legitimate interests</strong> — for fraud prevention, security, and service improvement</li>
              <li><strong className="text-white">Legal obligation</strong> — to comply with applicable laws</li>
              <li><strong className="text-white">Consent</strong> — for any optional communications (you may withdraw at any time)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Data Retention</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white">Account data:</strong> Retained while your account is active. Deleted within 30 days of account deletion.</li>
              <li><strong className="text-white">Screenshots:</strong> Never stored — discarded immediately after AI processing.</li>
              <li><strong className="text-white">Subscription records:</strong> Retained for 7 years for legal and tax compliance purposes.</li>
              <li><strong className="text-white">Usage logs:</strong> Retained for up to 90 days for abuse prevention.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Your Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li><strong className="text-white">Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong className="text-white">Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong className="text-white">Erasure:</strong> Request deletion of your account and personal data</li>
              <li><strong className="text-white">Portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong className="text-white">Objection:</strong> Object to processing based on legitimate interests</li>
              <li><strong className="text-white">Restriction:</strong> Request that we limit how we use your data</li>
            </ul>
            <p className="mt-3">
              To exercise any right, email <a href="mailto:privacy@flirtiq.app" className="text-pink-400 hover:underline">privacy@flirtiq.app</a>. We will respond within 30 days. Indian users also have rights under the Information Technology (Reasonable Security Practices) Rules, 2011.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Data Security</h2>
            <p>
              We use industry-standard security measures including HTTPS encryption, Supabase Row Level Security (RLS) policies, and secure environment variable management. However, no system is 100% secure. If you suspect a security breach, contact us immediately at <a href="mailto:security@flirtiq.app" className="text-pink-400 hover:underline">security@flirtiq.app</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">9. International Data Transfers</h2>
            <p>
              FlirtIQ operates globally. Your data may be processed in countries outside your own (including the United States via Google, Supabase, and Vercel). We ensure appropriate safeguards are in place, including Standard Contractual Clauses where required by GDPR.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">10. Cookies</h2>
            <p>
              FlirtIQ uses minimal cookies. We use a session cookie set by Supabase for authentication. We use <strong className="text-white">localStorage</strong> (not cookies) for language preference and free tier tracking — this data stays in your browser and is not sent to our servers.
            </p>
            <p className="mt-3">
              We do not use advertising cookies, tracking pixels, or third-party analytics cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">11. Children&apos;s Privacy</h2>
            <p>
              FlirtIQ is not intended for anyone under the age of 18. We do not knowingly collect personal data from minors. If you believe a minor has created an account, contact us at <a href="mailto:privacy@flirtiq.app" className="text-pink-400 hover:underline">privacy@flirtiq.app</a> and we will delete the account promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you of significant changes via email or a notice on the website at least 7 days before they take effect. The &ldquo;Last updated&rdquo; date at the top reflects the most recent revision.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">13. Contact &amp; Complaints</h2>
            <p>
              For privacy questions or to exercise your rights:<br />
              <a href="mailto:privacy@flirtiq.app" className="text-pink-400 hover:underline">privacy@flirtiq.app</a>
            </p>
            <p className="mt-3">
              If you are in the EU and are not satisfied with our response, you have the right to lodge a complaint with your local Data Protection Authority.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
