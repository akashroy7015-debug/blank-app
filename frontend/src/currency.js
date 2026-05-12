// Detect user's preferred currency. Returns "inr" for India, otherwise "usd".
// Persists user override in localStorage.

const KEY = "sparq_currency";

export function detectCurrency() {
  // 1. respect explicit user choice
  const saved = localStorage.getItem(KEY);
  if (saved === "inr" || saved === "usd") return saved;

  // 2. infer from browser locale (e.g., "hi-IN", "en-IN", "ta-IN")
  try {
    const langs = [navigator.language, ...(navigator.languages || [])];
    if (langs.some(l => /[-_]IN\b/i.test(l || ""))) return "inr";
  } catch (e) { console.warn("currency: locale detect failed", e); }

  // 3. infer from timezone (Asia/Kolkata, Asia/Calcutta)
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (/Kolkata|Calcutta/i.test(tz)) return "inr";
  } catch (e) { console.warn("currency: tz detect failed", e); }

  return "usd";
}

export function setCurrency(c) {
  if (c !== "inr" && c !== "usd") return;
  localStorage.setItem(KEY, c);
}

export function formatMoney(amount, currency, meta) {
  const symbol = meta?.symbol || (currency === "inr" ? "₹" : "$");
  const decimals = meta?.decimals ?? (currency === "inr" ? 0 : 2);
  return `${symbol}${Number(amount).toFixed(decimals)}`;
}

export const CURRENCIES = [
  { code: "usd", label: "USD ($)", symbol: "$", country: "Global" },
  { code: "inr", label: "INR (₹)", symbol: "₹", country: "India" },
];
