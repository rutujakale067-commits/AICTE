const KEY = "aicte_auth_token";
export const getToken = () => sessionStorage.getItem(KEY) || sessionStorage.getItem("verifyai_token");
export const setToken = (t: string | null) => {
  if (t) {
    sessionStorage.setItem(KEY, t);
  } else {
    sessionStorage.removeItem(KEY);
    sessionStorage.removeItem("verifyai_token");
  }
};
export async function api<T = any>(path: string, opts: { method?: string; json?: any; form?: FormData } = {}): Promise<T> {
  const h: Record<string, string> = {}; const t = getToken(); if (t) h.Authorization = "Bearer " + t;
  let body: any; if (opts.json !== undefined) { h["Content-Type"] = "application/json"; body = JSON.stringify(opts.json); } else if (opts.form) body = opts.form;
  const r = await fetch("/api" + path, { method: opts.method || (body ? "POST" : "GET"), headers: h, body });
  if (r.status === 401 && !path.startsWith("/auth/login")) { setToken(null); location.href = "/login"; }
  if (!r.ok) { let m = r.statusText; try { const j = await r.json(); m = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail); } catch {} throw new Error(m); }
  return r.json();
}
async function blobUrl(path: string) { const r = await fetch("/api" + path, { headers: { Authorization: "Bearer " + getToken() } }); if (!r.ok) throw new Error("Could not load file"); return URL.createObjectURL(await r.blob()); }
/** Opens a stored PDF at a specific page in a new tab (auth header required, so we use a blob URL). */
export async function openDocument(id: number, page?: number | null) {
  const w = window.open("", "_blank"); try { const u = await blobUrl(`/documents/${id}/file`); if (w) w.location.href = u + (page ? `#page=${page}` : ""); } catch (e) { w?.close(); throw e; }
}
export async function downloadReport(id: number, name: string) {
  const u = await blobUrl(`/reports/${id}/download`); const a = document.createElement("a"); a.href = u; a.download = name; a.click();
}
export const fmtDate = (s?: string | null) => (s ? new Date(s.length <= 10 ? s + "T00:00:00" : s + "Z").toLocaleString("en-IN", { dateStyle: "medium", ...(s.length > 10 ? { timeStyle: "short" } : {}) }) : "-");
