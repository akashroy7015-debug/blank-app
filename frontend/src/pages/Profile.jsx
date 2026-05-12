import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/api";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/auth";
import { SealCheck, Crown } from "@phosphor-icons/react";

export default function Profile() {
  const { user, refresh } = useAuth();
  const [me, setMe] = useState(user);
  useEffect(() => { setMe(user); }, [user]);
  if (!me) return null;
  const planLabel = { free: "Free", basic_monthly: "Basic", premium_monthly: "Premium", platinum_monthly: "Platinum" }[me.subscription?.plan] || "Free";

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <div className="surface p-6 md:p-8 flex flex-col md:flex-row gap-6">
          <img src={me.photos?.[0] || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80"} alt="" className="w-32 h-32 rounded-full object-cover" />
          <div className="flex-1">
            <p className="smallcaps text-[var(--muted)]">{me.location_city || "—"}</p>
            <h1 className="font-serif text-4xl mt-1 flex items-center gap-2">{me.name}{me.verified_badge && <SealCheck size={26} weight="fill" className="text-[var(--gold)]"/>}</h1>
            <p className="text-sm text-[var(--secondary-fg)] mt-3 max-w-xl leading-relaxed">{me.bio || "Add a short bio in Settings."}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {(me.interests || []).map(i => <span key={i} className="tag-chip">{i}</span>)}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="tag-chip"><Crown size={14}/> {planLabel}</span>
              <span className="tag-chip">Safety score: {me.safety_score ?? 80}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <Link to="/app/plans" className="surface p-5 hover:border-[var(--primary)] transition" data-testid="profile-link-plans"><p className="smallcaps text-[var(--primary)]">Plans</p><p className="font-serif text-2xl mt-1">Upgrade</p><p className="text-xs text-[var(--muted)] mt-2">Unlimited swipes, who liked you, boosts.</p></Link>
          <Link to="/app/safety" className="surface p-5 hover:border-[var(--primary)] transition" data-testid="profile-link-safety"><p className="smallcaps text-[var(--primary)]">Safety</p><p className="font-serif text-2xl mt-1">Safety Center</p><p className="text-xs text-[var(--muted)] mt-2">Verified-only, blur, location masking.</p></Link>
          <Link to="/app/settings" className="surface p-5 hover:border-[var(--primary)] transition" data-testid="profile-link-settings"><p className="smallcaps text-[var(--primary)]">Account</p><p className="font-serif text-2xl mt-1">Settings</p><p className="text-xs text-[var(--muted)] mt-2">Privacy, notifications, export, delete.</p></Link>
        </div>
      </div>
    </AppShell>
  );
}
