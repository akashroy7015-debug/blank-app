import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api";
import AppShell from "@/components/AppShell";
import { toast } from "sonner";
import { Crown, Lightning, CaretDown } from "@phosphor-icons/react";
import { detectCurrency, setCurrency as persistCurrency, CURRENCIES, formatMoney } from "@/currency";

export default function Plans() {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState("");
  const [currency, setCurrency] = useState(detectCurrency());
  const nav = useNavigate();

  const load = (cur) => api.get(`/plans?currency=${cur}`).then(r => setData(r.data));
  useEffect(() => { load(currency); }, [currency]);

  const switchCurrency = (c) => {
    persistCurrency(c);
    setCurrency(c);
  };

  const checkout = async (pid) => {
    setBusy(pid);
    try {
      const { data } = await api.post("/checkout/session", { package_id: pid, origin_url: window.location.origin, currency });
      window.location.href = data.url;
    } catch (e) { toast.error(e?.response?.data?.detail || "Checkout error"); setBusy(""); }
  };

  if (!data) return <AppShell><div className="p-10 text-[var(--muted)]">Loading…</div></AppShell>;

  const subs = data.plans.filter(p => p.kind === "subscription");
  const pack = data.plans.find(p => p.id === "swipe_pack");
  const cmp = data.comparison;
  const meta = data.currency_meta;
  const fmt = (n) => formatMoney(n, currency, meta);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="smallcaps text-[var(--primary)]">Plans</p>
            <h1 className="font-serif text-5xl mt-2">Premium that costs less.</h1>
            <p className="text-[var(--muted)] mt-3 max-w-xl">Every plan is priced below Tinder and Bumble. Cancel anytime. Auto-renews monthly with clear consent.</p>
          </div>
          <div className="surface px-4 py-3 flex items-center gap-3" data-testid="currency-switcher">
            <span className="smallcaps text-[var(--muted)]">Currency</span>
            <div className="flex items-center gap-1">
              {CURRENCIES.map(c => (
                <button
                  key={c.code}
                  onClick={() => switchCurrency(c.code)}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${currency === c.code ? "bg-[var(--primary)] text-[var(--primary-fg)]" : "text-[var(--secondary-fg)] hover:text-[var(--text)]"}`}
                  data-testid={`currency-${c.code}`}
                >
                  {c.symbol} {c.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {subs.map((p) => {
            const featured = p.id === "premium_monthly";
            return (
              <div key={p.id} className={`surface p-7 relative ${featured ? "ring-1 ring-[var(--primary)]" : ""}`} data-testid={`plan-${p.id}`}>
                {featured && <p className="smallcaps text-[var(--primary)] absolute -top-3 left-7 bg-[var(--bg)] px-2">Most popular</p>}
                {p.id === "platinum_monthly" && <Crown size={22} className="text-[var(--gold)] absolute top-5 right-5" weight="fill" />}
                <p className="smallcaps text-[var(--muted)]">{p.name}</p>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="font-serif text-5xl">{fmt(p.amount)}</span>
                  <span className="text-sm text-[var(--muted)]">/mo</span>
                </p>
                <ul className="mt-6 space-y-2 text-sm text-[var(--secondary-fg)]">
                  {p.perks.map(pe => <li key={pe}>— {pe}</li>)}
                </ul>
                <button onClick={() => checkout(p.id)} disabled={busy === p.id} className={`w-full mt-7 ${featured ? "btn-primary" : "btn-ghost"}`} data-testid={`plan-${p.id}-cta`}>{busy === p.id ? "Redirecting…" : "Choose"}</button>
              </div>
            );
          })}
        </div>

        {pack && (
          <div className="surface p-7 mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4" data-testid="plan-swipe_pack">
            <div>
              <p className="smallcaps text-[var(--primary)]">Pay as you go</p>
              <p className="font-serif text-3xl mt-1">{pack.name}</p>
              <p className="text-sm text-[var(--muted)] mt-1">Run out of free swipes? Top up — only when you need it.</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-4xl">{fmt(pack.amount)}</span>
              <span className="text-sm text-[var(--muted)]">one-time</span>
            </div>
            <button onClick={() => checkout("swipe_pack")} disabled={busy === "swipe_pack"} className="btn-primary" data-testid="plan-swipe_pack-cta">{busy === "swipe_pack" ? "Redirecting…" : <><Lightning size={16} className="inline -mt-0.5 mr-1"/> Buy pack</>}</button>
          </div>
        )}

        <div className="mt-16">
          <p className="smallcaps text-[var(--muted)]">Comparison ({meta.code})</p>
          <h2 className="font-serif text-3xl mt-2">How we stack up</h2>
          <div className="surface mt-6 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--border)]">
                <tr className="text-left text-[var(--muted)]">
                  <th className="p-4 smallcaps">Tier</th>
                  <th className="p-4 smallcaps">Sparkd</th>
                  <th className="p-4 smallcaps">Tinder</th>
                  <th className="p-4 smallcaps">Bumble</th>
                </tr>
              </thead>
              <tbody className="text-[var(--secondary-fg)]">
                <tr className="border-b border-[var(--border)]"><td className="p-4">Entry</td><td className="p-4 text-[var(--primary)] font-serif">{fmt(subs[0]?.amount)}</td><td className="p-4">{fmt(cmp.tinder.plus)}</td><td className="p-4">—</td></tr>
                <tr className="border-b border-[var(--border)]"><td className="p-4">Premium</td><td className="p-4 text-[var(--primary)] font-serif">{fmt(subs[1]?.amount)}</td><td className="p-4">{fmt(cmp.tinder.gold)}</td><td className="p-4">{fmt(cmp.bumble.premium)}</td></tr>
                <tr><td className="p-4">Top tier</td><td className="p-4 text-[var(--primary)] font-serif">{fmt(subs[2]?.amount)}</td><td className="p-4">{fmt(cmp.tinder.platinum)}</td><td className="p-4">{fmt(cmp.bumble.premium_plus)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-[var(--muted)] mt-10 max-w-2xl">
          Subscriptions auto-renew until canceled. Cancel anytime in <a href="/app/billing" className="underline">Billing</a>.
          See our <a href="/legal/refund" className="underline">Refund Policy</a> for details. Payments are processed securely via Stripe (PCI-compliant).
          Pricing for India is shown in ₹ (INR). Other regions default to USD; you can override with the currency toggle above.
        </p>
      </div>
    </AppShell>
  );
}
