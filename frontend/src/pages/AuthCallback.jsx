import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api";
import { useAuth } from "@/auth";

export default function AuthCallback() {
  const nav = useNavigate();
  const { loginWithToken } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    (async () => {
      const hash = window.location.hash || "";
      const m = hash.match(/session_id=([^&]+)/);
      if (!m) { nav("/login"); return; }
      const session_id = m[1];
      try {
        const { data } = await api.post("/auth/google/session", { session_id });
        await loginWithToken(data.token);
        // strip hash
        window.history.replaceState(null, "", window.location.pathname);
        nav(data.onboarded ? "/app/swipe" : "/onboarding");
      } catch {
        nav("/login");
      }
    })();
  }, [nav, loginWithToken]);

  return <div className="min-h-screen grid place-items-center text-[var(--muted)]">Signing you in…</div>;
}
