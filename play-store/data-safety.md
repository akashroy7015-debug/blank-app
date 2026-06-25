# Play Console — Data Safety form answers

Copy these into **Play Console → App content → Data safety**. Answers are
based on the actual data flow (Supabase auth, OpenAI analysis, Paddle
payments, Vercel hosting) and must stay consistent with `/privacy`.

> ⚠️ Keep this in sync with the privacy policy. If you change what the app
> collects, update both this file and `app/(main)/privacy/page.tsx`.

---

## Overview questions

| Question | Answer |
|----------|--------|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (HTTPS everywhere) |
| Do you provide a way for users to request that their data be deleted? | **Yes** — email privacy@flirtiq.app (and account deletion in-app if available) |

---

## Data types — what to declare

### 1. Personal info → Email address
- **Collected:** Yes · **Shared:** No
- **Processed ephemerally:** No (stored for the account)
- **Required or optional:** Required (needed to sign in)
- **Purposes:** Account management, App functionality
- *Why:* Supabase auth stores the user's email to create the account.

### 2. Photos and videos → Photos
- **Collected:** Yes · **Shared:** Yes (sent to OpenAI for analysis)
- **Processed ephemerally:** **Yes** — the screenshot is analyzed and
  discarded; it is not stored on our servers.
- **Required or optional:** Optional (only when the user uploads one)
- **Purposes:** App functionality
- *Why:* Chat screenshots are passed to OpenAI's API to generate replies.
  "Shared" is checked because the image is transmitted to a third party
  (OpenAI) to perform the function.

### 3. Financial info → Purchase history
- **Collected:** Yes · **Shared:** No
- **Required or optional:** Optional (only for paying users)
- **Purposes:** App functionality, Account management
- *Why:* We receive subscription/credit status from Paddle. **We do NOT
  collect card numbers or billing details** — Paddle (Merchant of Record)
  handles all payment data, so you do **not** declare "Payment info" as
  collected by the app.

### 4. App activity → App interactions
- **Collected:** Yes · **Shared:** No
- **Required or optional:** Required
- **Purposes:** App functionality (enforce the free daily limit / credits)
- *Why:* We store a per-user daily analysis count + date in Supabase.

### 5. App info and performance → Crash logs / Diagnostics  (only if true)
- Vercel collects standard server logs (IP, browser type) for security and
  performance. Declare under **Device or other IDs / Diagnostics** as
  **Collected: Yes, Shared: No, Purpose: Analytics / App functionality** if
  you want to be conservative. If you add no analytics SDK, you can keep
  this minimal.

---

## Things to confirm before submitting

1. **Fix the privacy policy mismatch** — `/privacy` section (c) says free-tier
   usage lives in `localStorage`. The app now tracks it **server-side in
   Supabase** (`free_analyses_count` / `free_analyses_date`). Update that
   sentence so the policy matches the Data Safety declaration. (Reviewers do
   cross-check.)
2. **Account deletion** — Google requires a deletion path. Make sure
   privacy@flirtiq.app is monitored, or add an in-app "Delete account" button.
3. **Privacy policy URL** must be live and reachable:
   https://blank-app-gules.vercel.app/privacy (or your custom domain).
4. **Data deletion URL** — you can reuse the privacy page or add a dedicated
   one; the form asks for it.
