import { useState, useRef } from "react";
import api from "@/api";
import { toast } from "sonner";
import { UploadSimple, X, Plus } from "@phosphor-icons/react";

// Authenticated photo uploader. Stores ?auth=<jwt> on the rendered <img src>
// so the protected /api/files/{path} endpoint can authenticate the request.
export default function PhotoUploader({ photos, onChange, max = 6, testidPrefix = "photo" }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("sparq_token") : null;

  const previewSrc = (p) => {
    if (!p) return null;
    if (p.startsWith("http")) return p; // legacy unsplash url
    if (p.startsWith("/api/")) {
      const base = process.env.REACT_APP_BACKEND_URL || "";
      return `${base}${p}${token ? `?auth=${token}` : ""}`;
    }
    return p;
  };

  const pick = (idx) => {
    inputRef.current.dataset.idx = String(idx);
    inputRef.current.click();
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const idx = Number(inputRef.current.dataset.idx || "0");
    if (!file.type.startsWith("image/")) { toast.error("Please pick an image"); return; }
    if (file.size > 8 * 1024 * 1024) { toast.error("Image must be 8 MB or smaller"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/upload/photo", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const next = [...photos];
      next[idx] = data.url;
      // strip trailing empties / dedupe
      onChange(next.slice(0, max));
      toast.success("Photo uploaded");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Upload failed");
    } finally { setUploading(false); }
  };

  const remove = async (idx) => {
    const p = photos[idx];
    const next = [...photos];
    next[idx] = "";
    onChange(next);
    if (p && p.startsWith("/api/files/")) {
      const path = p.replace(/^\/api\/files\//, "").split("?")[0];
      try { await api.delete(`/upload/photo?path=${encodeURIComponent(path)}`); }
      catch (e) { console.warn("photo delete failed", e); }
    }
  };

  const slots = Array.from({ length: max }, (_, i) => photos[i] || "");

  return (
    <div data-testid={`${testidPrefix}-uploader`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        onChange={onFile}
        data-testid={`${testidPrefix}-file-input`}
      />
      <div className="grid grid-cols-3 gap-3">
        {slots.map((p, i) => (
          <div key={i} className="aspect-[3/4] surface relative overflow-hidden group" data-testid={`${testidPrefix}-slot-${i}`}>
            {p ? (
              <>
                <img src={previewSrc(p)} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-[var(--error)] grid place-items-center transition"
                  data-testid={`${testidPrefix}-remove-${i}`}
                >
                  <X size={14} className="text-white" weight="bold"/>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => pick(i)}
                disabled={uploading}
                className="w-full h-full flex flex-col items-center justify-center gap-1 text-[var(--muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition"
                data-testid={`${testidPrefix}-add-${i}`}
              >
                {uploading ? <span className="text-[10px] uppercase tracking-widest">Uploading…</span> :
                  <>
                    <Plus size={20} />
                    <span className="text-[10px] uppercase tracking-widest">Add</span>
                  </>
                }
              </button>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--muted)] mt-3 flex items-center gap-1">
        <UploadSimple size={12} /> JPEG, PNG, WEBP or GIF · max 8 MB · up to {max} photos
      </p>
    </div>
  );
}
