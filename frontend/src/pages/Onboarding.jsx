import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api";
import { useAuth } from "@/auth";
import { toast } from "sonner";

const INTERESTS = ["Travel", "Coffee", "Hiking", "Films", "Books", "Music", "Art", "Cooking", "Dogs", "Cats", "Yoga", "Running", "Gaming", "Wine", "Photography", "Design", "Tech"];
const PROMPT_QS = [
  "My ideal Sunday is…",
  "I'm weirdly passionate about…",
  "A truth I just learned…",
];

export default function Onboarding() {
  const nav = useNavigate();
  const { refresh } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    gender: "",
    interested_in: "",
    photos: ["", "", ""],
    bio: "",
    interests: [],
    prompts: PROMPT_QS.map(q => ({ q, a: "" })),
    location_city: "",
  });
  const [busy, setBusy] = useState(false);

  const toggleInterest = (i) => {
    setForm(f => ({ ...f, interests: f.interests.includes(i) ? f.interests.filter(x => x !== i) : f.interests.length >= 10 ? f.interests : [...f.interests, i] }));
  };

  const submit = async () => {
    setBusy(true);
    try {
      await api.post("/profile/complete", {
        gender: form.gender,
        interested_in: form.interested_in,
        photos: form.photos.filter(Boolean),
        bio: form.bio,
        prompts: form.prompts.filter(p => p.a.trim()),
        interests: form.interests,
        location_city: form.location_city,
      });
      toast.success("Profile complete! Start swiping.");
      await refresh();
      nav("/app/swipe");
    } catch (e) { toast.error(e?.response?.data?.detail || "Failed to save"); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] py-12 px-4 md:px-12">
      <div className="max-w-2xl mx-auto">
        <p className="smallcaps text-[var(--primary)]">Onboarding · {step} of 4</p>
        <div className="flex gap-2 mt-3 mb-10">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full ${step >= s ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h1 className="font-serif text-4xl">Tell us about you</h1>
            <p className="text-[var(--muted)] mt-2">This helps us match you better.</p>
            <div className="mt-8 space-y-6">
              <div>
                <label className="smallcaps text-[var(--muted)] block mb-3">I identify as</label>
                <div className="flex gap-2 flex-wrap">
                  {["female", "male", "non-binary", "other"].map(g => (
                    <button key={g} data-testid={`gender-${g}`} onClick={() => setForm(f => ({ ...f, gender: g }))} className={`px-5 py-2 rounded-full border text-sm capitalize ${form.gender === g ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-fg)]" : "border-[var(--border)] text-[var(--secondary-fg)]"}`}>{g}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="smallcaps text-[var(--muted)] block mb-3">Interested in</label>
                <div className="flex gap-2 flex-wrap">
                  {["female", "male", "any"].map(g => (
                    <button key={g} data-testid={`interested-${g}`} onClick={() => setForm(f => ({ ...f, interested_in: g }))} className={`px-5 py-2 rounded-full border text-sm capitalize ${form.interested_in === g ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-fg)]" : "border-[var(--border)] text-[var(--secondary-fg)]"}`}>{g}</button>
                  ))}
                </div>
              </div>
              <input placeholder="City (optional)" value={form.location_city} onChange={e => setForm(f => ({ ...f, location_city: e.target.value }))} className="input-field" data-testid="onboarding-city-input" />
            </div>
            <div className="mt-10 flex justify-end">
              <button disabled={!form.gender || !form.interested_in} onClick={() => setStep(2)} className="btn-primary" data-testid="onboarding-step1-next">Next</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="font-serif text-4xl">Add your photos</h1>
            <p className="text-[var(--muted)] mt-2">Paste image URLs (Unsplash, your CDN, etc.) — at least one.</p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {form.photos.map((p, i) => (
                <div key={i} className="surface aspect-[3/4] overflow-hidden relative">
                  {p ? <img src={p} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-xs text-[var(--muted)]">Photo {i+1}</div>}
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              {form.photos.map((p, i) => (
                <input key={i} placeholder={`https://… (photo ${i+1})`} value={p} onChange={e => setForm(f => ({ ...f, photos: f.photos.map((x, idx) => idx === i ? e.target.value : x) }))} className="input-field" data-testid={`onboarding-photo-${i}`} />
              ))}
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={() => setStep(1)} className="btn-ghost" data-testid="onboarding-step2-back">Back</button>
              <button disabled={!form.photos.some(Boolean)} onClick={() => setStep(3)} className="btn-primary" data-testid="onboarding-step2-next">Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="font-serif text-4xl">Show your colors</h1>
            <p className="text-[var(--muted)] mt-2">A short bio and three prompts.</p>
            <textarea data-testid="onboarding-bio" placeholder="A short bio… (max 300 chars)" maxLength={300} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} className="input-field mt-6 min-h-[120px]" />
            <div className="mt-6 space-y-4">
              {form.prompts.map((pr, i) => (
                <div key={i} className="surface p-4">
                  <p className="smallcaps text-[var(--muted)] mb-2">{pr.q}</p>
                  <input value={pr.a} onChange={e => setForm(f => ({ ...f, prompts: f.prompts.map((x, idx) => idx === i ? { ...x, a: e.target.value } : x) }))} className="input-field" data-testid={`onboarding-prompt-${i}`} />
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={() => setStep(2)} className="btn-ghost" data-testid="onboarding-step3-back">Back</button>
              <button onClick={() => setStep(4)} className="btn-primary" data-testid="onboarding-step3-next">Next</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="font-serif text-4xl">Pick your interests</h1>
            <p className="text-[var(--muted)] mt-2">Up to 10 — we'll use these for smarter matching.</p>
            <div className="flex flex-wrap gap-2 mt-8">
              {INTERESTS.map(i => (
                <button key={i} data-testid={`interest-${i.toLowerCase()}`} onClick={() => toggleInterest(i)} className={`px-4 py-2 rounded-full border text-sm ${form.interests.includes(i) ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-fg)]" : "border-[var(--border)] text-[var(--secondary-fg)]"}`}>{i}</button>
              ))}
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={() => setStep(3)} className="btn-ghost" data-testid="onboarding-step4-back">Back</button>
              <button disabled={busy || form.interests.length === 0} onClick={submit} className="btn-primary" data-testid="onboarding-finish-btn">{busy ? "Saving…" : "Start swiping"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
