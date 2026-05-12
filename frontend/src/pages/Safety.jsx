import { useEffect, useState } from "react";
import api from "@/api";
import AppShell from "@/components/AppShell";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ShieldCheck, EyeSlash, MapPin, HouseLine, Phone, SealCheck } from "@phosphor-icons/react";

export default function Safety() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get("/safety/settings").then(r => setS(r.data)); }, []);
  const tog = async (k, v) => {
    setS(p => ({ ...p, [k]: v }));
    try { await api.put("/safety/settings", { [k]: v }); } catch { toast.error("Update failed"); }
  };
  const setEmergency = async (e) => {
    e.preventDefault();
    try { await api.put("/safety/settings", { emergency_contact: s.emergency_contact || "" }); toast.success("Emergency contact saved."); }
    catch { toast.error("Could not save"); }
  };
  if (!s) return <AppShell><div className="p-10 text-[var(--muted)]">Loading…</div></AppShell>;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
        <p className="smallcaps text-[var(--primary)]">Safety Center</p>
        <h1 className="font-serif text-4xl mt-2">You're in control.</h1>
        <p className="text-[var(--muted)] mt-3 max-w-xl">Tools built with women, queer, and trans users in mind. Toggle any time.</p>

        <div className="grid md:grid-cols-2 gap-4 mt-10">
          <SafetyCard icon={SealCheck} title="Verified-only mode" desc="Only show ID-verified profiles in your deck." value={s.verified_only_mode} onChange={v => tog("verified_only_mode", v)} testid="safety-verified-only" />
          <SafetyCard icon={EyeSlash} title="Blur photos until match" desc="Your photos blur until a mutual like." value={s.blur_photos_until_match} onChange={v => tog("blur_photos_until_match", v)} testid="safety-blur" />
          <SafetyCard icon={MapPin} title="Location masking" desc="Show city only, never exact location." value={s.location_masking} onChange={v => tog("location_masking", v)} testid="safety-location" />
          <SafetyCard icon={HouseLine} title="Private browsing" desc="Stay invisible while you discover." value={s.private_browsing} onChange={v => tog("private_browsing", v)} testid="safety-private" />
        </div>

        <div className="surface p-6 mt-8">
          <p className="smallcaps text-[var(--muted)] mb-2 flex items-center gap-1"><Phone size={14}/> Emergency contact</p>
          <p className="font-serif text-2xl">One-tap help</p>
          <p className="text-sm text-[var(--muted)] mt-2">Save a trusted contact. We'll one-tap notify them if you trigger Safety Alert.</p>
          <form onSubmit={setEmergency} className="mt-4 flex gap-2">
            <input value={s.emergency_contact || ""} onChange={e => setS(p => ({ ...p, emergency_contact: e.target.value }))} placeholder="Phone or email" className="input-field flex-1" data-testid="emergency-input" />
            <button className="btn-primary" data-testid="emergency-save-btn">Save</button>
          </form>
        </div>

        <div className="surface p-6 mt-6">
          <p className="smallcaps text-[var(--primary)] mb-2 flex items-center gap-1"><ShieldCheck size={14}/> Report or block</p>
          <p className="text-sm text-[var(--muted)] leading-relaxed">From any chat or profile, tap the warning icon to report. Repeat offenders are shadow banned, then permanently removed after human review.</p>
        </div>
      </div>
    </AppShell>
  );
}

function SafetyCard({ icon: Icon, title, desc, value, onChange, testid }) {
  return (
    <div className="surface p-5" data-testid={testid}>
      <Icon size={26} weight="duotone" className="text-[var(--primary)]" />
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-serif text-lg">{title}</p>
          <p className="text-xs text-[var(--muted)] mt-1">{desc}</p>
        </div>
        <Switch checked={!!value} onCheckedChange={onChange} data-testid={`${testid}-switch`} />
      </div>
    </div>
  );
}
