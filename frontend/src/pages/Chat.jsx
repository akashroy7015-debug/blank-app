import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api";
import AppShell from "@/components/AppShell";
import { toast } from "sonner";
import { useAuth } from "@/auth";
import { Sparkle, PaperPlaneRight, ArrowLeft, Warning, ShieldCheck } from "@phosphor-icons/react";

export default function Chat() {
  const { matchId } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [ice, setIce] = useState([]);
  const [reportOpen, setReportOpen] = useState(false);
  const scrollRef = useRef();

  const load = async () => {
    try { const { data } = await api.get(`/matches/${matchId}/messages`); setMessages(data.messages); }
    catch { toast.error("Couldn't load messages"); }
  };
  useEffect(() => { load(); }, [matchId]);
  useEffect(() => { scrollRef.current?.scrollTo(0, 1e9); }, [messages]);

  const send = async (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try {
      const { data } = await api.post(`/matches/${matchId}/messages`, { text });
      setMessages(m => [...m, data]);
      setText("");
    } catch (e) { toast.error(e?.response?.data?.detail || "Blocked"); }
    finally { setBusy(false); }
  };

  const getIcebreakers = async () => {
    try { const { data } = await api.post(`/matches/${matchId}/icebreaker`); setIce(data.icebreakers); }
    catch { toast.error("AI temporarily unavailable"); }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col" style={{ height: "calc(100vh - 80px)" }}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => nav(-1)} className="text-[var(--muted)]" data-testid="chat-back-btn"><ArrowLeft size={22}/></button>
          <p className="smallcaps text-[var(--muted)]">Conversation</p>
          <button onClick={() => setReportOpen(true)} className="text-[var(--muted)] hover:text-[var(--error)]" data-testid="chat-report-btn"><Warning size={22}/></button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 no-scrollbar py-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Sparkle size={36} className="mx-auto text-[var(--primary)] mb-2" weight="duotone"/>
              <p className="font-serif text-xl">Start the conversation</p>
              <button onClick={getIcebreakers} className="btn-ghost mt-4 text-sm" data-testid="chat-icebreaker-btn">✨ AI icebreakers</button>
            </div>
          )}
          {ice.length > 0 && (
            <div className="space-y-2 mb-4">
              <p className="smallcaps text-[var(--muted)]">AI suggestions</p>
              {ice.map((s, i) => (
                <button key={i} onClick={() => { setText(s); setIce([]); }} className="surface p-3 text-left text-sm w-full hover:border-[var(--primary)]" data-testid={`icebreaker-${i}`}>{s}</button>
              ))}
            </div>
          )}
          {messages.map(m => {
            const mine = m.sender_id === user?.user_id;
            return (
              <div key={m.message_id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${mine ? "bg-[var(--primary)] text-[var(--primary-fg)]" : "surface"}`} data-testid={`message-${m.message_id}`}>
                  <p className="text-sm leading-relaxed">{m.text}</p>
                </div>
              </div>
            );
          })}
        </div>
        <form onSubmit={send} className="mt-4 flex items-center gap-2">
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a kind message…" className="input-field flex-1" data-testid="chat-input"/>
          <button disabled={busy} className="w-12 h-12 rounded-full bg-[var(--primary)] grid place-items-center" data-testid="chat-send-btn"><PaperPlaneRight size={20} className="text-[var(--primary-fg)]" weight="fill"/></button>
        </form>
        <p className="text-[10px] text-[var(--muted)] mt-2 text-center flex items-center justify-center gap-1"><ShieldCheck size={12}/> AI moderation is on. Be kind.</p>
      </div>

      {reportOpen && (
        <ReportModal matchId={matchId} onClose={() => setReportOpen(false)} />
      )}
    </AppShell>
  );
}

function ReportModal({ matchId, onClose }) {
  const [cat, setCat] = useState("harassment");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      // we need target user id — fetch match via messages doesn't expose; we'll call list-matches
      const { data } = await api.get("/matches");
      const m = data.matches.find(x => x.match_id === matchId);
      if (!m) throw new Error("Match not found");
      await api.post("/safety/report", { target_user_id: m.user.user_id, category: cat, description: desc });
      toast.success("Report submitted. Our safety team will review.");
      onClose();
    } catch (e) { toast.error(e?.response?.data?.detail || "Could not report"); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-6 bg-black/80 backdrop-blur-md">
      <div className="surface p-6 max-w-md w-full" data-testid="report-modal">
        <p className="smallcaps text-[var(--primary)]">Safety report</p>
        <h2 className="font-serif text-2xl mt-1 mb-4">Report this user</h2>
        <div className="space-y-2">
          {[
            { v: "harassment", l: "Harassment / threats" },
            { v: "fake", l: "Fake profile" },
            { v: "scam", l: "Scam or fraud" },
            { v: "inappropriate", l: "Inappropriate content" },
            { v: "other", l: "Other" },
          ].map(o => (
            <label key={o.v} className="flex items-center gap-3 cursor-pointer text-sm">
              <input type="radio" name="cat" checked={cat === o.v} onChange={() => setCat(o.v)} data-testid={`report-cat-${o.v}`}/> {o.l}
            </label>
          ))}
        </div>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Add context (optional)" className="input-field mt-4 min-h-[100px]" data-testid="report-desc"/>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost" data-testid="report-cancel">Cancel</button>
          <button disabled={busy} onClick={submit} className="btn-primary" data-testid="report-submit">{busy ? "Submitting…" : "Submit report"}</button>
        </div>
      </div>
    </div>
  );
}
