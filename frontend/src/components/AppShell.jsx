import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth";
import { Cards, Heart, ChatCircle, ShieldCheck, UserCircle, Crown, Gear } from "@phosphor-icons/react";

const items = [
  { to: "/app/swipe", label: "Discover", icon: Cards },
  { to: "/app/matches", label: "Matches", icon: Heart },
  { to: "/app/safety", label: "Safety", icon: ShieldCheck },
  { to: "/app/plans", label: "Plans", icon: Crown },
  { to: "/app/profile", label: "Profile", icon: UserCircle },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const onLogout = async () => { await logout(); nav("/"); };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col">
      {/* top nav */}
      <header className="sticky top-0 z-30 glass border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link to="/app/swipe" data-testid="brand-home" className="font-serif text-2xl tracking-tight">
            Sparkd<span className="text-[var(--primary)]">.</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {items.map(it => {
              const Active = loc.pathname.startsWith(it.to);
              const Icon = it.icon;
              return (
                <Link key={it.to} to={it.to} data-testid={`nav-${it.label.toLowerCase()}`} className={`flex items-center gap-2 text-sm smallcaps ${Active ? "text-[var(--primary)]" : "text-[var(--muted)] hover:text-[var(--text)]"}`}>
                  <Icon size={18} /> {it.label}
                </Link>
              );
            })}
            {user?.role === "admin" && (
              <Link to="/app/admin" data-testid="nav-admin" className="text-sm smallcaps text-[var(--gold)]"><Gear size={18} className="inline mr-1" />Admin</Link>
            )}
            <button data-testid="logout-btn" onClick={onLogout} className="text-sm smallcaps text-[var(--muted)] hover:text-[var(--error)]">Log out</button>
          </nav>
        </div>
      </header>

      <main className="flex-1 pb-24 md:pb-8">{children}</main>

      {/* mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden glass border-t border-[var(--border)]">
        <div className="grid grid-cols-5">
          {items.map(it => {
            const Active = loc.pathname.startsWith(it.to);
            const Icon = it.icon;
            return (
              <Link key={it.to} to={it.to} data-testid={`tabbar-${it.label.toLowerCase()}`} className={`flex flex-col items-center justify-center gap-1 py-3 ${Active ? "text-[var(--primary)]" : "text-[var(--muted)]"}`}>
                <Icon size={22} weight={Active ? "fill" : "regular"} />
                <span className="text-[10px] uppercase tracking-widest">{it.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
