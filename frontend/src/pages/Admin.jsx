import { useEffect, useState } from "react";
import api from "@/api";
import AppShell from "@/components/AppShell";
import { toast } from "sonner";

export default function Admin() {
  const [tab, setTab] = useState("dashboard");
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <p className="smallcaps text-[var(--gold)]">Compliance Dashboard</p>
        <h1 className="font-serif text-4xl mt-2 mb-8">Admin console</h1>
        <div className="flex gap-2 border-b border-[var(--border)] mb-6 overflow-x-auto no-scrollbar">
          {[
            { k: "dashboard", l: "Overview" },
            { k: "reports", l: "Reports" },
            { k: "users", l: "Users" },
            { k: "audit", l: "Audit logs" },
          ].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} data-testid={`admin-tab-${t.k}`} className={`px-4 py-3 smallcaps ${tab === t.k ? "text-[var(--primary)] border-b-2 border-[var(--primary)]" : "text-[var(--muted)]"}`}>{t.l}</button>
          ))}
        </div>
        {tab === "dashboard" && <Overview />}
        {tab === "reports" && <Reports />}
        {tab === "users" && <Users />}
        {tab === "audit" && <Audit />}
      </div>
    </AppShell>
  );
}

function Overview() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get("/admin/stats").then(r => setS(r.data)); }, []);
  if (!s) return <p className="text-[var(--muted)]">Loading…</p>;
  const stats = [
    { l: "Total users", v: s.users_total }, { l: "Active", v: s.users_active }, { l: "Pending verification", v: s.users_pending }, { l: "Banned", v: s.users_banned },
    { l: "Open reports", v: s.reports_open }, { l: "Total matches", v: s.matches_total }, { l: "Total messages", v: s.messages_total }, { l: "Paid transactions", v: s.tx_paid },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(st => (
        <div key={st.l} className="surface p-5">
          <p className="smallcaps text-[var(--muted)]">{st.l}</p>
          <p className="font-serif text-4xl mt-2">{st.v}</p>
        </div>
      ))}
    </div>
  );
}

function Reports() {
  const [rows, setRows] = useState([]);
  const load = () => api.get("/admin/reports?status=open").then(r => setRows(r.data.reports));
  useEffect(() => { load(); }, []);
  const act = async (target, action) => {
    try { await api.post("/admin/action", { target_user_id: target, action, reason: "via admin console" }); toast.success(`Action: ${action}`); load(); }
    catch { toast.error("Action failed"); }
  };
  if (rows.length === 0) return <p className="text-[var(--muted)] surface p-6">No open reports.</p>;
  return (
    <div className="space-y-3">
      {rows.map(r => (
        <div key={r.report_id} className="surface p-5" data-testid={`report-${r.report_id}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="smallcaps text-[var(--primary)]">{r.category}</p>
              <p className="font-serif text-lg mt-1">Target: {r.target_user_id}</p>
              <p className="text-sm text-[var(--secondary-fg)] mt-1">{r.description || <em className="text-[var(--muted)]">No description.</em>}</p>
              <p className="text-xs text-[var(--muted)] mt-2">From {r.reporter_id} · {new Date(r.created_at).toLocaleString()}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => act(r.target_user_id, "warn")} className="btn-ghost text-xs py-1.5 px-3" data-testid={`warn-${r.report_id}`}>Warn</button>
              <button onClick={() => act(r.target_user_id, "suspend")} className="btn-ghost text-xs py-1.5 px-3" data-testid={`suspend-${r.report_id}`}>Suspend</button>
              <button onClick={() => act(r.target_user_id, "ban")} className="btn-primary text-xs py-1.5 px-3" data-testid={`ban-${r.report_id}`}>Ban</button>
              <button onClick={() => act(r.target_user_id, "dismiss")} className="text-xs text-[var(--muted)]" data-testid={`dismiss-${r.report_id}`}>Dismiss</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Users() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const load = () => api.get(`/admin/users?q=${encodeURIComponent(q)}`).then(r => setRows(r.data.users));
  useEffect(() => { load(); }, []);
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by email or name" className="input-field flex-1" data-testid="admin-user-search" />
        <button onClick={load} className="btn-ghost" data-testid="admin-user-search-btn">Search</button>
      </div>
      <div className="surface overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-[var(--muted)] border-b border-[var(--border)]">
            <tr><th className="p-3 smallcaps">Email</th><th className="p-3 smallcaps">Name</th><th className="p-3 smallcaps">Role</th><th className="p-3 smallcaps">Status</th><th className="p-3 smallcaps">Actions</th></tr>
          </thead>
          <tbody className="text-[var(--secondary-fg)]">
            {rows.map(u => (
              <tr key={u.user_id} className="border-b border-[var(--border)]">
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.status}</td>
                <td className="p-3"><button onClick={async () => { await api.post("/admin/action", { target_user_id: u.user_id, action: "verify" }); toast.success("Verified"); load(); }} className="btn-ghost text-xs py-1 px-2" data-testid={`verify-${u.user_id}`}>Verify</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Audit() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get("/admin/audit-logs").then(r => setRows(r.data.logs)); }, []);
  return (
    <div className="surface overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-[var(--muted)] border-b border-[var(--border)]">
          <tr><th className="p-3 smallcaps">Time</th><th className="p-3 smallcaps">Admin</th><th className="p-3 smallcaps">Action</th><th className="p-3 smallcaps">Target</th><th className="p-3 smallcaps">Reason</th></tr>
        </thead>
        <tbody className="text-[var(--secondary-fg)]">
          {rows.map(l => (
            <tr key={l.log_id} className="border-b border-[var(--border)]">
              <td className="p-3">{new Date(l.created_at).toLocaleString()}</td>
              <td className="p-3">{l.admin_id}</td>
              <td className="p-3">{l.action}</td>
              <td className="p-3">{l.target_user_id}</td>
              <td className="p-3">{l.reason}</td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td className="p-3 text-[var(--muted)]" colSpan={5}>No logs yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
