import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "@/App.css";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import AuthCallback from "@/pages/AuthCallback";
import Onboarding from "@/pages/Onboarding";
import Swipe from "@/pages/Swipe";
import Matches from "@/pages/Matches";
import Chat from "@/pages/Chat";
import Profile from "@/pages/Profile";
import Plans from "@/pages/Plans";
import Billing from "@/pages/Billing";
import Settings from "@/pages/Settings";
import Safety from "@/pages/Safety";
import Admin from "@/pages/Admin";
import PaymentSuccess from "@/pages/PaymentSuccess";
import Legal from "@/pages/Legal";
import CookieBanner from "@/components/CookieBanner";
import { useAuth } from "@/auth";

function Protected({ children, requireOnboarded = true }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center text-[var(--muted)]">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireOnboarded && !user.onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

function AdminOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center text-[var(--muted)]">Loading…</div>;
  if (!user || user.role !== "admin") return <Navigate to="/app/swipe" replace />;
  return children;
}

function AppRouter() {
  const loc = useLocation();
  if (loc.hash?.includes("session_id=")) return <AuthCallback />;
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/onboarding" element={<Protected requireOnboarded={false}><Onboarding /></Protected>} />
      <Route path="/app/swipe" element={<Protected><Swipe /></Protected>} />
      <Route path="/app/matches" element={<Protected><Matches /></Protected>} />
      <Route path="/app/chat/:matchId" element={<Protected><Chat /></Protected>} />
      <Route path="/app/profile" element={<Protected><Profile /></Protected>} />
      <Route path="/app/plans" element={<Protected><Plans /></Protected>} />
      <Route path="/app/billing" element={<Protected><Billing /></Protected>} />
      <Route path="/app/settings" element={<Protected><Settings /></Protected>} />
      <Route path="/app/safety" element={<Protected><Safety /></Protected>} />
      <Route path="/app/admin" element={<AdminOnly><Admin /></AdminOnly>} />
      <Route path="/payment/success" element={<Protected><PaymentSuccess /></Protected>} />
      <Route path="/legal/:slug" element={<Legal />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
        <CookieBanner />
      </BrowserRouter>
    </div>
  );
}
