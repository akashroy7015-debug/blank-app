// Build a renderable src URL for a stored photo reference.
// - External URLs (https://...): used as-is
// - /api/files/... protected paths: appended with ?auth=<jwt> so <img src> can authenticate
export function photoSrc(p) {
  if (!p) return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=900&q=80";
  if (p.startsWith("http")) return p;
  if (p.startsWith("/api/")) {
    const base = process.env.REACT_APP_BACKEND_URL || "";
    const token = typeof window !== "undefined" ? localStorage.getItem("sparkd_token") : null;
    return `${base}${p}${token ? `?auth=${token}` : ""}`;
  }
  return p;
}
