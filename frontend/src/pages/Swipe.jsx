import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import api from "@/api";
import AppShell from "@/components/AppShell";
import { toast } from "sonner";
import { Heart, X, Star, Sparkle, SealCheck, Lightning, Clock } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { photoSrc } from "@/photo";

function Countdown({ resetIso }) {
  const [t, setT] = useState("");
  useEffect(() => {
    const id = setInterval(() => {
      const diff = new Date(resetIso).getTime() - Date.now();
      if (diff <= 0) return setT("renewing…");
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setT(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(id);
  }, [resetIso]);
  return <span className="font-serif tabular-nums">{t}</span>;
}

function Card({ p, onSwipe, isTop }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);
  const likeOpacity = useTransform(x, [40, 160], [0, 1]);
  const passOpacity = useTransform(x, [-160, -40], [1, 0]);

  return (
    <motion.div
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 130) onSwipe("like");
        else if (info.offset.x < -130) onSwipe("pass");
      }}
      style={{ x, rotate }}
      whileTap={{ cursor: "grabbing" }}
      className="absolute inset-0 rounded-3xl overflow-hidden surface cursor-grab"
      data-testid={`swipe-card-${p.user_id}`}
    >
      <img src={photoSrc(p.photos?.[0])} alt={p.name} className="w-full h-full object-cover pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
      {p.verified_badge && (
        <div className="absolute top-5 right-5 glass rounded-full p-2"><SealCheck size={20} weight="fill" className="text-[var(--gold)]" /></div>
      )}
      <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-8 px-4 py-2 border-2 border-[var(--success)] text-[var(--success)] rounded-lg font-serif text-3xl -rotate-12 pointer-events-none">SPARK</motion.div>
      <motion.div style={{ opacity: passOpacity }} className="absolute top-8 right-8 px-4 py-2 border-2 border-[var(--error)] text-[var(--error)] rounded-lg font-serif text-3xl rotate-12 pointer-events-none">PASS</motion.div>

      <div className="absolute bottom-0 inset-x-0 p-6 pointer-events-none">
        <p className="smallcaps text-[var(--accent)] mb-1">{p.location_city || "Somewhere good"}</p>
        <h2 className="font-serif text-4xl">{p.name}</h2>
        <p className="text-sm text-[var(--secondary-fg)] mt-2 line-clamp-2">{p.bio}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {(p.interests || []).slice(0, 4).map(i => <span key={i} className="tag-chip text-xs">{i}</span>)}
        </div>
      </div>
    </motion.div>
  );
}

export default function Swipe() {
  const [deck, setDeck] = useState([]);
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchModal, setMatchModal] = useState(null);
  const nav = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/swipes/deck?limit=10");
      setDeck(data.profiles);
      setState(data.state);
    } catch (e) { toast.error("Could not load deck"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const act = async (action) => {
    if (deck.length === 0) return;
    const target = deck[0];
    try {
      const { data } = await api.post("/swipes/action", { target_user_id: target.user_id, action });
      setState(data.state);
      if (data.is_match) {
        setMatchModal({ name: target.name, photo: target.photos?.[0], match_id: data.match_id });
      }
      setDeck(d => d.slice(1));
      if (deck.length <= 2) load();
    } catch (e) {
      if (e?.response?.status === 402) {
        toast.error("Out of swipes — upgrade or grab a Swipe Pack.");
        nav("/app/plans");
      } else toast.error(e?.response?.data?.detail || "Action failed");
    }
  };

  return (
    <AppShell>
      <div className="max-w-md mx-auto px-4 py-6">
        {/* swipe counter */}
        <div className="surface px-5 py-4 flex items-center justify-between mb-4">
          <div>
            <p className="smallcaps text-[var(--muted)]">Swipes today</p>
            <p className="font-serif text-3xl mt-1">
              {state?.unlimited ? "∞" : `${state?.remaining ?? "—"}`}
              <span className="text-base text-[var(--muted)] ml-1">/ {state?.unlimited ? "Unlimited" : `${state?.limit || 10} free`}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="smallcaps text-[var(--muted)] flex items-center justify-end gap-1"><Clock size={12} />Renews</p>
            {state && <p className="font-serif text-lg mt-1"><Countdown resetIso={state.resets_at} /></p>}
          </div>
        </div>

        {/* deck */}
        <div className="relative w-full" style={{ height: "min(70vh, 600px)" }}>
          {loading && <div className="absolute inset-0 grid place-items-center text-[var(--muted)]">Loading…</div>}
          {!loading && deck.length === 0 && (
            <div className="absolute inset-0 grid place-items-center text-center px-8">
              <div>
                <Sparkle size={42} className="mx-auto text-[var(--primary)] mb-3" weight="duotone" />
                <p className="font-serif text-2xl">You're caught up</p>
                <p className="text-sm text-[var(--muted)] mt-2">New profiles will appear soon. Try widening your filters.</p>
              </div>
            </div>
          )}
          <AnimatePresence>
            {deck.slice(0, 3).reverse().map((p, idx, arr) => (
              <Card key={p.user_id} p={p} isTop={idx === arr.length - 1} onSwipe={act} />
            ))}
          </AnimatePresence>
        </div>

        {/* action buttons */}
        {!loading && deck.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-5">
            <button data-testid="swipe-pass-btn" onClick={() => act("pass")} className="w-16 h-16 rounded-full border border-[var(--border)] bg-[var(--surface)] grid place-items-center hover:scale-105 transition active:scale-95">
              <X size={28} className="text-[var(--error)]" weight="bold" />
            </button>
            <button data-testid="swipe-super-btn" onClick={() => act("super")} className="w-14 h-14 rounded-full border border-[var(--border)] bg-[var(--surface)] grid place-items-center hover:scale-105 transition active:scale-95">
              <Star size={24} className="text-[var(--gold)]" weight="fill" />
            </button>
            <button data-testid="swipe-like-btn" onClick={() => act("like")} className="w-16 h-16 rounded-full bg-[var(--primary)] grid place-items-center hover:scale-105 transition active:scale-95">
              <Heart size={28} className="text-[var(--primary-fg)]" weight="fill" />
            </button>
          </div>
        )}

        <p className="text-center text-xs text-[var(--muted)] mt-6">
          AI moderation is active. <a href="/legal/ai-disclosure" className="underline">Learn how</a>.
        </p>
      </div>

      {/* match modal */}
      <AnimatePresence>
        {matchModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center px-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} className="surface p-8 max-w-md w-full text-center" data-testid="match-modal">
              <Lightning size={56} className="mx-auto text-[var(--primary)] mb-4" weight="fill" />
              <h2 className="font-serif text-5xl">It's a Spark</h2>
              <p className="text-[var(--muted)] mt-2">You and {matchModal.name} liked each other.</p>
              {matchModal.photo && <img src={photoSrc(matchModal.photo)} alt="" className="mx-auto mt-6 w-32 h-32 rounded-full object-cover border-2 border-[var(--primary)]" />}
              <div className="mt-8 flex gap-3">
                <button onClick={() => setMatchModal(null)} className="btn-ghost flex-1" data-testid="match-continue-btn">Keep swiping</button>
                <button onClick={() => nav(`/app/chat/${matchModal.match_id}`)} className="btn-primary flex-1" data-testid="match-message-btn">Send a message</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
