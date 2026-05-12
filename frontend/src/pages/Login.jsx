import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/api";
import { useAuth } from "@/auth";
import { toast } from "sonner";
import { GoogleLogo, InstagramLogo, FacebookLogo } from "@phosphor-icons/react";

export default function Login() {
  const nav = useNavigate();
  const { loginWithToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      await loginWithToken(data.token);
      nav(data.onboarded ? "/app/swipe" : "/onboarding");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally { setBusy(false); }
  };

  const google = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/app/swipe";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[var(--bg)]">
      <div className="hidden md:block relative">
        <img src="https://images.unsplash.com/photo-1594250945179-6ace32113329?crop=entropy&cs=srgb&fm=jpg&w=1000&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12">
          <Link to="/" className="font-serif text-2xl">sparQ<span className="text-[var(--primary)]">.</span></Link>
          <p className="font-serif text-4xl mt-8 leading-tight">"Real people. Real intent."</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 md:px-16 py-16">
        <div className="w-full max-w-md">
          <Link to="/" className="md:hidden font-serif text-2xl">sparQ<span className="text-[var(--primary)]">.</span></Link>
          <p className="smallcaps text-[var(--primary)] mt-12 md:mt-0">Welcome back</p>
          <h1 className="font-serif text-4xl mt-2">Log in</h1>

          <button onClick={google} data-testid="google-login-btn" className="mt-8 w-full btn-ghost flex items-center justify-center gap-3">
            <GoogleLogo size={20} /> Continue with Google
          </button>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button data-testid="instagram-login-btn" disabled className="btn-ghost flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"><InstagramLogo size={18}/> Instagram</button>
            <button data-testid="facebook-login-btn" disabled className="btn-ghost flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"><FacebookLogo size={18}/> Facebook</button>
          </div>
          <p className="text-xs text-[var(--muted)] mt-2">Instagram & Facebook coming soon.</p>

          <div className="flex items-center gap-3 my-8">
            <div className="divider-line flex-1" />
            <span className="smallcaps text-[var(--muted)]">or with email</span>
            <div className="divider-line flex-1" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" data-testid="login-email-input" />
            <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" data-testid="login-password-input" />
            <button disabled={busy} type="submit" className="btn-primary w-full" data-testid="login-submit-btn">{busy ? "Signing in…" : "Sign in"}</button>
          </form>
          <p className="text-sm text-[var(--muted)] mt-6">
            New here? <Link to="/signup" className="text-[var(--primary)]" data-testid="link-to-signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
