import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "./api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Skip /me if returning from OAuth callback — AuthCallback will set session first
    if (window.location.hash?.includes("session_id=")) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [checkAuth]);

  const loginWithToken = (token, userData) => {
    localStorage.setItem("sparkd_token", token);
    if (userData) setUser(userData);
    return checkAuth();
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); }
    catch (e) { console.warn("logout call failed (clearing local state anyway)", e); }
    localStorage.removeItem("sparkd_token");
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, setUser, loading, loginWithToken, logout, refresh: checkAuth }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
