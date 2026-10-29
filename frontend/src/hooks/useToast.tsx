import { createContext, useContext, useState, ReactNode } from "react"; import { CheckCircle2, XCircle } from "lucide-react";
const C = createContext<(m: string, kind?: "ok" | "err") => void>(() => {}); export const useToast = () => useContext(C);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [t, setT] = useState<{ id: number; m: string; kind: string }[]>([]);
  const push = (m: string, kind: "ok" | "err" = "ok") => { const id = Date.now() + Math.random(); setT((x) => [...x, { id, m, kind }]); setTimeout(() => setT((x) => x.filter((y) => y.id !== id)), 5000); };
  return <C.Provider value={push}>{children}
    <div className="fixed bottom-4 right-4 z-50 space-y-2" role="status" aria-live="polite">{t.map((x) => (
      <div key={x.id} className={`flex items-center gap-2 border px-3 py-2 text-sm shadow bg-white ${x.kind === "ok" ? "border-green-600 text-green-800" : "border-red-600 text-red-800"}`}>
        {x.kind === "ok" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}{x.m}</div>))}</div></C.Provider>;
}
