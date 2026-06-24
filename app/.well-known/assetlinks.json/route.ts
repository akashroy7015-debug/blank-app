import { NextResponse } from 'next/server'

// SHA-256 fingerprint of the Android signing certificate.
// Set ANDROID_SHA256_CERT in Vercel env vars once you have the keystore.
// Format: "AB:CD:EF:..." (colon-separated uppercase hex)
// Get it from: Play Console → Setup → App Signing → App signing key certificate
const CERT_FINGERPRINT = process.env.ANDROID_SHA256_CERT ?? 'PLACEHOLDER'

export async function GET() {
  const assetLinks = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'app.flirtiq.twa',
        sha256_cert_fingerprints: [CERT_FINGERPRINT],
      },
    },
  ]

  return new NextResponse(JSON.stringify(assetLinks, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
