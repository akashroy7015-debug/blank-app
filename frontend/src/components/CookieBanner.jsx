import { useState, useEffect } from "react";
import api from "@/api";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("sparkd_cookies")) setShow(true);
  }, []);

  const accept = async (mode) => {
    const consent = mode === "all"
      ? { essential: true, analytics: true, marketing: true }
      : { essential: true, analytics: false, marketing: false };
    localStorage.setItem("sparkd_cookies", JSON.stringify(consent));
    try { await api.post("/privacy/cookie-consent", consent); } catch {}
    setShow(false);
  };

  if (!show) return null;
  return (
    <div
      data-testid="cookie-banner"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-50 glass rounded-2xl p-5 shadow-2xl"
    >
      <p className="smallcaps text-[var(--muted)] mb-2">Cookie consent</p>
      <p className="text-sm text-[var(--secondary-fg)] mb-4 leading-relaxed">
        Sparkd uses cookies to keep you signed in, measure performance, and personalize your experience.
        Read our <a href="/legal/cookies" className="underline text-[var(--accent)]">Cookie Policy</a>.
      </p>
      <div className="flex gap-2">
        <button data-testid="cookie-reject-non-essential" onClick={() => accept("essential")} className="btn-ghost flex-1 text-sm py-2">
          Essential only
        </button>
        <button data-testid="cookie-accept-all" onClick={() => accept("all")} className="btn-primary flex-1 text-sm py-2">
          Accept all
        </button>
      </div>
    </div>
  );
}
