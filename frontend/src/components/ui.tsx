import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  X,
  ChevronRight,
  Home,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface StatusConfig {
  bg: string;
  text: string;
  border: string;
  dot: string;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  // Green / Success
  "Pass": { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-300", dot: "bg-emerald-500" },
  "Scrutiny Completed": { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-300", dot: "bg-emerald-500" },
  "Approved": { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-300", dot: "bg-emerald-500" },
  "Completed": { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-300", dot: "bg-emerald-500" },

  // Red / Deficiencies
  "Potential Deficiency": { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-300", dot: "bg-rose-500" },
  "Potential Deficiencies": { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-300", dot: "bg-rose-500" },
  "Rejected": { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-300", dot: "bg-rose-500" },
  "Unreadable": { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-300", dot: "bg-rose-500" },

  // Amber / Review needed
  "Manual Review Required": { bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-300", dot: "bg-amber-500" },
  "Returned for Correction": { bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-300", dot: "bg-amber-500" },
  "OCR Used": { bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-300", dot: "bg-amber-500" },

  // Blue / Active review
  "Under Review": { bg: "bg-sky-50", text: "text-sky-900", border: "border-sky-300", dot: "bg-sky-500 animate-pulse" },
  "Under Official Review": { bg: "bg-sky-50", text: "text-sky-900", border: "border-sky-300", dot: "bg-sky-500" },
  "In Scrutiny": { bg: "bg-sky-50", text: "text-sky-900", border: "border-sky-300", dot: "bg-sky-500" },
  "Resolved": { bg: "bg-blue-50", text: "text-blue-900", border: "border-blue-300", dot: "bg-blue-500" },

  // Neutral / Pending / NA
  "Pending": { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300", dot: "bg-slate-400" },
  "Pending Scrutiny": { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300", dot: "bg-slate-400" },
  "Not Applicable": { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-300", dot: "bg-slate-400" },
  "Not yet verified": { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-300", dot: "bg-slate-400" },
};

export const Status = ({ s }: { s: string }) => {
  const cfg = STATUS_CONFIGS[s] || {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap shadow-xs ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {s}
    </span>
  );
};

export const Spinner = ({ text = "Loading data..." }: { text?: string }) => (
  <div className="flex items-center justify-center gap-3 p-8 text-slate-600" role="status">
    <Loader2 className="animate-spin text-navy" size={20} />
    <span className="text-sm font-medium">{text}</span>
  </div>
);

export const Empty = ({ text }: { text: string }) => (
  <div className="p-8 text-center text-slate-500 text-sm bg-white rounded-lg border border-dashed border-slate-300 my-2">
    <AlertCircle className="mx-auto mb-2 text-slate-400" size={24} />
    <p>{text}</p>
  </div>
);

export const ErrorBox = ({ text }: { text: string }) => (
  <div className="p-3.5 rounded-lg border border-red-200 bg-red-50/90 text-red-800 text-sm flex items-start gap-2.5 my-2 shadow-xs" role="alert">
    <AlertTriangle className="shrink-0 text-red-600 mt-0.5" size={16} />
    <div>
      <div className="font-semibold text-xs text-red-900 uppercase tracking-wide">Error</div>
      <div>{text}</div>
    </div>
  </div>
);

export const Breadcrumbs = ({ items }: { items: { label: string; to?: string }[] }) => (
  <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex items-center flex-wrap gap-1.5 mb-3">
    <Link to="/" className="text-slate-400 hover:text-navy flex items-center gap-1">
      <Home size={12} />
    </Link>
    {items.map((i, k) => (
      <span key={k} className="flex items-center gap-1.5">
        <ChevronRight size={11} className="text-slate-300" />
        {i.to ? (
          <Link className="text-brand hover:text-navy hover:underline transition-colors" to={i.to}>
            {i.label}
          </Link>
        ) : (
          <span className="font-semibold text-slate-700">{i.label}</span>
        )}
      </span>
    ))}
  </nav>
);

export const Section = ({
  title,
  children,
  right,
  subtitle,
}: {
  title: string;
  children: ReactNode;
  right?: ReactNode;
  subtitle?: string;
}) => (
  <section className="card mb-4">
    <div className="h-sec">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {subtitle && <p className="text-[11px] text-slate-200 font-normal">{subtitle}</p>}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
    <div className="p-4">{children}</div>
  </section>
);

export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-start justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`bg-white rounded-xl shadow-elevated border border-slate-200 w-full ${wide ? "max-w-4xl" : "max-w-lg"
          } my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
      >
        <div className="h-sec flex justify-between items-center py-3">
          <span className="font-semibold">{title}</span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function ReasonDialog({
  title,
  label,
  min = 0,
  confirm,
  extra,
  onClose,
  onSubmit,
}: {
  title: string;
  label: string;
  min?: number;
  confirm: string;
  extra?: ReactNode;
  onClose: () => void;
  onSubmit: (t: string) => Promise<void>;
}) {
  const [v, setV] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const go = async () => {
    setBusy(true);
    setErr("");
    try {
      await onSubmit(v);
      onClose();
    } catch (e: any) {
      setErr(e.message);
      setBusy(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      {extra}
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
        {label}
        {min > 0 && <span className="text-red-600 font-normal"> * (min {min} characters)</span>}
      </label>
      <textarea
        className="field"
        rows={4}
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="Enter official remark or rationale..."
        autoFocus
      />
      {err && <div className="mt-2"><ErrorBox text={err} /></div>}
      <div className="flex justify-end gap-2.5 mt-4">
        <button className="btn-ghost" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button
          className="btn-primary"
          disabled={busy || v.trim().length < min}
          onClick={go}
        >
          {busy && <Loader2 size={14} className="animate-spin" />}
          {confirm}
        </button>
      </div>
    </Modal>
  );
}

export function Pager({
  total,
  page,
  size,
  setPage,
  setSize,
}: {
  total: number;
  page: number;
  size: number;
  setPage: (n: number) => void;
  setSize: (n: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / size));
  const start = total === 0 ? 0 : (page - 1) * size + 1;
  const end = Math.min(total, page * size);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 mt-3 pt-2 border-t border-slate-100">
      <div>
        Showing <span className="font-semibold text-slate-800">{start}–{end}</span> of{" "}
        <span className="font-semibold text-slate-800">{total}</span> records
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5">
          Rows:
          <select
            className="border border-slate-300 rounded px-1.5 py-0.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand"
            value={size}
            onChange={(e) => {
              setSize(+e.target.value);
              setPage(1);
            }}
          >
            {[5, 10, 25, 50].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-1">
          <button
            className="btn-ghost !px-2.5 !py-1"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span className="px-2 text-slate-500 font-medium">
            Page {page} of {pages}
          </span>
          <button
            className="btn-ghost !px-2.5 !py-1"
            disabled={page >= pages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export const Progress = ({ v }: { v: number }) => (
  <div className="flex items-center gap-2" title={`${v}% of applicable documents uploaded`}>
    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
      <div
        className={`h-full transition-all duration-300 ${v === 100
            ? "bg-emerald-600"
            : v >= 60
              ? "bg-brand"
              : "bg-amber-500"
          }`}
        style={{ width: `${v}%` }}
      />
    </div>
    <span className="text-xs font-semibold text-slate-700 w-8">{v}%</span>
  </div>
);
