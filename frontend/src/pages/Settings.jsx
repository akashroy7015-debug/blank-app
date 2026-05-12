import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api";
import AppShell from "@/components/AppShell";
import { toast } from "sonner";
import { useAuth } from "@/auth";
import { Switch } from "@/components/ui/switch";
import { Download, Trash } from "@phosphor-icons/react";

export default function Settings() {
  const { user, refresh, logout } = useAuth();
  const [pri, setPri] = useState(null);
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  useEffect(() => { api.get("/privacy/settings").then(r => setPri(r.data)); }, []);

  const tog = async (k, v) => {
    setPri(p => ({ ...p, [k]: v }));
    try { await api.put("/privacy/settings", { [k]: v }); } catch { toast.error("Update failed"); }
  };

  const exportData = async () => {
    try {
      const { data } = await api.get("/privacy/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "sparq-data-export.json"; a.click();
      toast.success("Your data is downloading.");
    } catch { toast.error("Could not export"); }
  };

  const del = async () => {
    if (!window.confirm("Delete account permanently? This cannot be undone.")) return;
    setBusy(true);
    try {
      await api.post("/privacy/delete-account");
      toast.success("Account deleted.");
      await logout();
      nav("/");
    } catch { toast.error("Could not delete"); }
    finally { setBusy(false); }
  };

  if (!pri) return <AppShell><div className="p-10 text-[var(--muted)]">Loading…</div></AppShell>;

  const toggles = [
    { k: "profile_visible", l: "Profile visible", d: "Show your profile in others' decks." },
    { k: "show_distance", l: "Show distance", d: "Display distance on your profile." },
    { k: "show_age", l: "Show age", d: "Display your age on your profile." },
    { k: "ad_personalization", l: "Ad personalization", d: "Allow sparQ to personalize ads." },
    { k: "push_notifications", l: "Push notifications", d: "Match & message alerts." },
    { k: "email_notifications", l: "Email notifications", d: "Updates and tips via email." },
  ];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
        <p className="smallcaps text-[var(--primary)]">Account</p>
        <h1 className="font-serif text-4xl mt-2 mb-8">Settings</h1>

        <div className="surface p-6">
          <p className="smallcaps text-[var(--muted)] mb-4">Privacy & notifications</p>
          <div className="space-y-4">
            {toggles.map(t => (
              <div key={t.k} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-serif text-lg">{t.l}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{t.d}</p>
                </div>
                <Switch checked={!!pri[t.k]} onCheckedChange={(v) => tog(t.k, v)} data-testid={`toggle-${t.k}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="surface p-6 mt-6">
          <p className="smallcaps text-[var(--muted)] mb-4">Your data (GDPR · CCPA · DPDP)</p>
          <button onClick={exportData} className="btn-ghost flex items-center gap-2" data-testid="export-data-btn"><Download size={18}/> Download my data</button>
          <p className="text-xs text-[var(--muted)] mt-3">Receive a JSON archive of your profile, swipes, matches, and messages.</p>
        </div>

        <div className="surface p-6 mt-6 border-[var(--error)]/40">
          <p className="smallcaps text-[var(--error)] mb-2">Right to be forgotten</p>
          <p className="font-serif text-2xl">Delete account</p>
          <p className="text-sm text-[var(--muted)] mt-2">Permanently erase your profile and personal data. Subscription is canceled.</p>
          <button disabled={busy} onClick={del} className="btn-ghost mt-4 border-[var(--error)] text-[var(--error)]" data-testid="delete-account-btn"><Trash size={16} className="inline -mt-0.5 mr-1"/> Delete account</button>
        </div>
      </div>
    </AppShell>
  );
}
