# Sparkd — Product Requirements Document

**Created:** 2026-02
**Last updated:** 2026-02

## Original problem statement
Build a dating app on Emergent. Minimal, engaging, aesthetic interface. Optional connect with Instagram/Facebook. 10 free swipes daily, auto-renew every 24h. Three subscription plans priced lower than Tinder/Bumble plus a pay-as-you-go option. Full legal, compliance, privacy, trust & safety systems for a global dating app: 12 legal pages, 18+ age gate, GDPR/CCPA/DPDP compliance, AI content moderation, women safety tools (verified-only, blur, location masking, emergency contact), user reporting, admin compliance dashboard, secure auth (JWT+OTP+OAuth), PCI-compliant Stripe payments, data export & right-to-be-forgotten.

## User personas
- **Daters (primary, 18+):** want trustworthy connections, hate scams/abuse, will pay for quality.
- **Women & marginalized users:** need verifiable trust signals and safety controls by default.
- **Admins/moderators:** need a compliance dashboard to review reports, suspend/ban, and audit actions.

## Architecture
- **Backend:** FastAPI (`/app/backend/server.py`), MongoDB via Motor, JWT auth + Emergent Google OAuth, Stripe via emergentintegrations, Claude Sonnet 4.5 via Emergent LLM key for moderation + icebreakers.
- **Frontend:** React 19 + react-router-dom 7, Tailwind, Shadcn/UI, Framer Motion (swipe deck), @phosphor-icons/react, Fraunces (serif) + Manrope (sans) typography, dark editorial theme (#0F0E0D bg, #C45A45 terracotta primary, #D4AF37 gold safety badge).
- **State:** AuthProvider context with /api/auth/me verification; localStorage for JWT.

## Core requirements (static)
1. Age gate 18+ (DOB + confirmation checkbox; blocked at register API).
2. Strict consent acceptance: ToS + Privacy + Community at signup.
3. 10 free swipes/day, auto-renew at UTC midnight (real-time countdown UI).
4. 3 subscription plans ($7.99 / $14.99 / $24.99) + $0.99 swipe pack.
5. Stripe checkout (test key sk_test_emergent), backend-set prices, idempotent status polling, webhook finalize.
6. JWT auth + OTP email verification + Emergent Google social login.
7. Instagram/Facebook "coming soon" buttons (stubbed).
8. AI content moderation (Claude Sonnet 4.5) for bio + chat + report flow; rule-based fallback.
9. Women safety tools: verified-only mode, blur photos until match, location masking, private browsing, emergency contact.
10. Reporting + blocking; auto shadow-ban at 3+ open reports.
11. Admin compliance dashboard: stats, reports queue, user mgmt, action history audit log.
12. Privacy dashboard: granular toggles, data export JSON, account delete (right-to-be-forgotten).
13. Cookie consent banner (essential / analytics / marketing) persisted in DB.
14. 12 legal pages (Terms, Privacy, Community, Cookies, Refund, Safety, Moderation, Age, Data Deletion, Consent, DMCA, AI Disclosure) — editorial design.

## Implemented (Feb 2026)
- ✅ All 12 legal pages with editorial 2-column layout
- ✅ Landing page with hero, pricing preview, safety section, footer
- ✅ Auth: register (+OTP +consent gate +18 check), login, OTP verify, Google OAuth callback, /auth/me, logout
- ✅ 4-step onboarding flow with progress bar
- ✅ Swipe deck with Framer Motion physics, daily counter, UTC midnight countdown
- ✅ Matches list, 1:1 chat with AI moderation + icebreakers
- ✅ Plans page with comparison table, Stripe checkout, /payment/success polling
- ✅ Billing dashboard (history + cancel subscription)
- ✅ Settings (6 privacy toggles, data export, account delete)
- ✅ Safety Center (4 toggles + emergency contact)
- ✅ Admin compliance dashboard (4 tabs: overview, reports, users, audit)
- ✅ Cookie consent banner
- ✅ Reporting + blocking modal in chat
- ✅ 12 seeded demo profiles + admin + demo user
- ✅ Backend tests: 39/40 pass (97.5%). Stripe status hardened to be webhook-aware (returns open instead of 502 if sandbox can't retrieve session).

## Backlog (P1)
- Real Instagram/Facebook OAuth (requires Meta dev keys)
- Photo upload via object storage (currently URL paste)
- Push notifications (web push or FCM)
- Real-time chat (WebSocket)
- Subscription gating: gate "see who liked you" to Premium+
- Real ID verification provider (Persona, Veriff)
- i18n for legal pages (currently EN only)
- Rate limiting on auth endpoints
- Modularize server.py into auth/swipes/matches/safety/admin/checkout modules

## Backlog (P2)
- AI age estimation from photos (currently warning only)
- Stripe Connect for creator monetization
- Boost/super-like billing increments
- Email service (Resend/SendGrid) for OTP delivery
- Razorpay for INR
- Annual transparency report generator

## Next tasks
- Hook real photo upload (object storage)
- Modularize backend into submodules
- Add rate limiting and 2FA
