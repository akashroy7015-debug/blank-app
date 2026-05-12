import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/api";
import AppShell from "@/components/AppShell";
import { SealCheck, ChatCircle } from "@phosphor-icons/react";

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/matches").then(r => { setMatches(r.data.matches); setLoading(false); });
  }, []);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <p className="smallcaps text-[var(--primary)]">Your matches</p>
        <h1 className="font-serif text-4xl mt-2 mb-8">Sparks lit</h1>

        {loading ? <p className="text-[var(--muted)]">Loading…</p> :
          matches.length === 0 ? (
            <div className="surface p-10 text-center">
              <ChatCircle size={36} className="mx-auto text-[var(--primary)] mb-3" weight="duotone" />
              <p className="font-serif text-2xl">No matches yet</p>
              <p className="text-sm text-[var(--muted)] mt-2">Head back to swipe and start sparking.</p>
              <Link to="/app/swipe" className="btn-primary inline-block mt-6" data-testid="empty-back-swipe">Discover</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {matches.map(m => (
                <Link key={m.match_id} to={`/app/chat/${m.match_id}`} data-testid={`match-row-${m.match_id}`} className="surface p-4 flex items-center gap-4 hover:border-[var(--primary)] transition">
                  <img src={m.user.photos?.[0] || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80"} alt="" className="w-16 h-16 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-xl flex items-center gap-1">{m.user.name} {m.user.verified_badge && <SealCheck size={16} weight="fill" className="text-[var(--gold)]" />}</p>
                    <p className="text-sm text-[var(--muted)] truncate">{m.last_message?.text || "Say hello"}</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        }
      </div>
    </AppShell>
  );
}
