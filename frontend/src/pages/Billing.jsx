import { useEffect, useState } from "react";
import api from "@/api";
import AppShell from "@/components/AppShell";
import { toast } from "sonner";
import { useAuth } from "@/auth";
import { formatMoney } from "@/currency";

export default function Billing() {
  const [tx, setTx] = useState([]);
  const { user, refresh } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get("/billing/history").then(r => setTx(r.data.transactions)); }, []);

  const cancel = async () => {
    setBusy(true);
    try { await api.post("/billing/cancel"); toast.success("Subscription canceled."); await refresh(); }
    catch { toast.error("Could not cancel"); }
    finally { setBusy(false); }
  };

  const plan = user?.subscription?.plan || "free";
  const planName = { free: "Free", basic_monthly: "Basic", premium_monthly: "Premium", platinum_monthly: "Platinum" }[plan];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
        <p className="smallcaps text-[var(--primary)]">Billing</p>
        <h1 className="font-serif text-4xl mt-2 mb-8">Subscription & invoices</h1>

        <div className="surface p-6 flex items-center justify-between">
          <div>
            <p className="smallcaps text-[var(--muted)]">Current plan</p>
            <p className="font-serif text-3xl mt-1">{planName}</p>
            {user?.subscription?.active && user?.subscription?.renews_at && (
              <p className="text-xs text-[var(--muted)] mt-1">Renews {new Date(user.subscription.renews_at).toLocaleDateString()}</p>
            )}
          </div>
          {user?.subscription?.active && (
            <button onClick={cancel} disabled={busy} className="btn-ghost text-sm" data-testid="cancel-subscription-btn">{busy ? "…" : "Cancel"}</button>
          )}
        </div>

        <div className="mt-8">
          <p className="smallcaps text-[var(--muted)] mb-3">History</p>
          {tx.length === 0 ? <p className="text-sm text-[var(--muted)] surface p-6">No transactions yet.</p> : (
            <div className="surface overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                  <tr><th className="p-3 smallcaps">Date</th><th className="p-3 smallcaps">Package</th><th className="p-3 smallcaps">Amount</th><th className="p-3 smallcaps">Status</th></tr>
                </thead>
                <tbody className="text-[var(--secondary-fg)]">
                  {tx.map(t => (
                    <tr key={t.tx_id} className="border-b border-[var(--border)]" data-testid={`tx-row-${t.tx_id}`}>
                      <td className="p-3">{new Date(t.created_at).toLocaleString()}</td>
                      <td className="p-3">{t.package_id}</td>
                      <td className="p-3 font-serif">{formatMoney(t.amount, t.currency)}</td>
                      <td className="p-3"><span className={`tag-chip ${t.payment_status === "paid" ? "text-[var(--success)] border-[var(--success)]" : ""}`}>{t.payment_status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
