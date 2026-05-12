import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "@/api";
import { useAuth } from "@/auth";
import { CheckCircle, XCircle, CircleNotch } from "@phosphor-icons/react";
import { formatMoney } from "@/currency";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState("checking");
  const [details, setDetails] = useState(null);
  const { refresh } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    const sid = params.get("session_id");
    if (!sid) { setStatus("error"); return; }
    let attempts = 0;
    let cancelled = false;
    const poll = async () => {
      if (cancelled) return;
      if (attempts >= 8) { setStatus("timeout"); return; }
      attempts++;
      try {
        const { data } = await api.get(`/checkout/status/${sid}`);
        if (data.payment_status === "paid") {
          setStatus("paid"); setDetails(data); await refresh();
          return;
        }
        if (data.status === "expired") { setStatus("expired"); return; }
        setTimeout(poll, 2000);
      } catch { setTimeout(poll, 2000); }
    };
    poll();
    return () => { cancelled = true; };
  }, [params, refresh]);

  return (
    <div className="min-h-screen grid place-items-center bg-[var(--bg)] px-6">
      <div className="surface p-10 max-w-md w-full text-center" data-testid="payment-result">
        {status === "checking" && <><CircleNotch size={48} className="mx-auto text-[var(--primary)] animate-spin" /><p className="font-serif text-3xl mt-6">Confirming payment…</p></>}
        {status === "paid" && <>
          <CheckCircle size={56} weight="fill" className="mx-auto text-[var(--success)]" />
          <h1 className="font-serif text-4xl mt-6">You're in.</h1>
          <p className="text-[var(--muted)] mt-3">{formatMoney((details?.amount_total || 0) / 100, details?.currency)}</p>
          <div className="mt-8 flex gap-2">
            <Link to="/app/swipe" className="btn-primary flex-1" data-testid="success-back-swipe">Start swiping</Link>
            <Link to="/app/billing" className="btn-ghost flex-1" data-testid="success-billing">Billing</Link>
          </div>
        </>}
        {(status === "expired" || status === "timeout" || status === "error") && <>
          <XCircle size={56} weight="fill" className="mx-auto text-[var(--error)]" />
          <h1 className="font-serif text-3xl mt-6">Payment issue</h1>
          <p className="text-[var(--muted)] mt-3">{status === "expired" ? "Session expired" : "We couldn't confirm your payment. Please check Billing."}</p>
          <Link to="/app/plans" className="btn-primary mt-8 inline-block" data-testid="success-retry">Try again</Link>
        </>}
      </div>
    </div>
  );
}
