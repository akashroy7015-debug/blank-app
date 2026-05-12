import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/api";
import { useAuth } from "@/auth";
import { toast } from "sonner";
import { GoogleLogo, ShieldCheck } from "@phosphor-icons/react";

export default function Signup() {
  const nav = useNavigate();
  const { loginWithToken } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", email: "", password: "", dob: "",
    accept_terms: false, accept_privacy: false, accept_community: false,
    age18: false,
  });
  const [otpCode, setOtpCode] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const onAgeContinue = (e) => {
    e.preventDefault();
    if (!form.age18) { toast.error("You must confirm you are 18 or older"); return; }
    if (!form.dob) { toast.error("Please enter your date of birth"); return; }
    const age = (Date.now() - new Date(form.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (age < 18) { toast.error("sparQ is for adults 18+"); return; }
    setStep(2);
  };

  const onRegister = async (e) => {
    e.preventDefault();
    if (!(form.accept_terms && form.accept_privacy && form.accept_community)) {
      toast.error("Please accept all required policies"); return;
    }
    setBusy(true);
    try {
      const { data } = await api.post("/auth/register", {
        email: form.email, password: form.password, name: form.name, dob: form.dob,
        accept_terms: form.accept_terms, accept_privacy: form.accept_privacy, accept_community: form.accept_community,
      });
      await loginWithToken(data.token);
      toast.success("Account created. Verify your email.");
      if (data.otp_code_dev) toast.info(`Dev OTP code: ${data.otp_code_dev}`);
      setStep(3);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Signup failed");
    } finally { setBusy(false); }
  };

  const onVerify = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/auth/otp/verify", { email: form.email, code: otpCode });
      toast.success("Email verified!");
      nav("/onboarding");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Verification failed");
    } finally { setBusy(false); }
  };

  const google = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/onboarding";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[var(--bg)]">
      <div className="hidden md:block relative">
        <img src="https://images.unsplash.com/photo-1713528757608-cac0e6c26155?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12">
          <Link to="/" className="font-serif text-2xl">sparQ<span className="text-[var(--primary)]">.</span></Link>
          <p className="font-serif text-4xl mt-8 leading-tight">"Curated. Verified.<br />Yours."</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 md:px-16 py-16">
        <div className="w-full max-w-md">
          <Link to="/" className="md:hidden font-serif text-2xl">sparQ<span className="text-[var(--primary)]">.</span></Link>

          {step === 1 && (
            <>
              <p className="smallcaps text-[var(--primary)] mt-8 md:mt-0">Step 1 of 3 · Age gate</p>
              <h1 className="font-serif text-4xl mt-2">You must be 18+</h1>
              <div className="surface p-5 mt-6 flex items-start gap-3">
                <ShieldCheck size={22} weight="duotone" className="text-[var(--primary)] mt-1" />
                <p className="text-sm text-[var(--secondary-fg)] leading-relaxed">sparQ is strictly for adults. We may use AI-assisted age verification and ID checks for premium badges. Misrepresentation will lead to a permanent ban.</p>
              </div>
              <form onSubmit={onAgeContinue} className="mt-8 space-y-4">
                <div>
                  <label className="smallcaps text-[var(--muted)] block mb-2">Date of birth</label>
                  <input type="date" value={form.dob} onChange={e => set("dob", e.target.value)} required className="input-field" data-testid="signup-dob-input" />
                </div>
                <label className="flex items-start gap-3 text-sm text-[var(--secondary-fg)] cursor-pointer">
                  <input type="checkbox" checked={form.age18} onChange={e => set("age18", e.target.checked)} data-testid="signup-age18-checkbox" className="mt-1" />
                  <span>I confirm I am 18 years of age or older.</span>
                </label>
                <button className="btn-primary w-full" data-testid="signup-age-continue-btn">Continue</button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <p className="smallcaps text-[var(--primary)] mt-8 md:mt-0">Step 2 of 3 · Account</p>
              <h1 className="font-serif text-4xl mt-2">Create your account</h1>
              <button onClick={google} data-testid="signup-google-btn" className="mt-6 w-full btn-ghost flex items-center justify-center gap-3"><GoogleLogo size={20}/> Continue with Google</button>
              <div className="flex items-center gap-3 my-6">
                <div className="divider-line flex-1" />
                <span className="smallcaps text-[var(--muted)]">or</span>
                <div className="divider-line flex-1" />
              </div>
              <form onSubmit={onRegister} className="space-y-4">
                <input required placeholder="Full name" value={form.name} onChange={e => set("name", e.target.value)} className="input-field" data-testid="signup-name-input" />
                <input required type="email" placeholder="Email" value={form.email} onChange={e => set("email", e.target.value)} className="input-field" data-testid="signup-email-input" />
                <input required type="password" minLength={8} placeholder="Password (min 8)" value={form.password} onChange={e => set("password", e.target.value)} className="input-field" data-testid="signup-password-input" />
                <div className="space-y-2 pt-2">
                  {[
                    { k: "accept_terms", label: "Terms of Service", slug: "terms" },
                    { k: "accept_privacy", label: "Privacy Policy", slug: "privacy" },
                    { k: "accept_community", label: "Community Guidelines", slug: "community" },
                  ].map(c => (
                    <label key={c.k} className="flex items-start gap-3 text-sm text-[var(--secondary-fg)]">
                      <input type="checkbox" checked={form[c.k]} onChange={e => set(c.k, e.target.checked)} data-testid={`signup-${c.k}-checkbox`} className="mt-1" />
                      <span>I accept sparQ's <Link to={`/legal/${c.slug}`} target="_blank" className="text-[var(--primary)] underline">{c.label}</Link>.</span>
                    </label>
                  ))}
                </div>
                <button disabled={busy} className="btn-primary w-full" data-testid="signup-submit-btn">{busy ? "Creating…" : "Create account"}</button>
              </form>
              <p className="text-sm text-[var(--muted)] mt-6">
                Already have an account? <Link to="/login" className="text-[var(--primary)]" data-testid="link-to-login">Log in</Link>
              </p>
            </>
          )}

          {step === 3 && (
            <>
              <p className="smallcaps text-[var(--primary)] mt-8 md:mt-0">Step 3 of 3 · Verify email</p>
              <h1 className="font-serif text-4xl mt-2">Enter the 6-digit code</h1>
              <p className="text-sm text-[var(--muted)] mt-2">We sent a code to {form.email}. (Dev mode: shown in toast.)</p>
              <form onSubmit={onVerify} className="mt-8 space-y-4">
                <input required value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="123456" maxLength={6} className="input-field text-center text-2xl tracking-widest font-serif" data-testid="otp-input" />
                <button disabled={busy} className="btn-primary w-full" data-testid="otp-verify-btn">{busy ? "Verifying…" : "Verify & continue"}</button>
                <button type="button" onClick={() => nav("/onboarding")} className="btn-ghost w-full" data-testid="otp-skip-btn">Skip for now</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
