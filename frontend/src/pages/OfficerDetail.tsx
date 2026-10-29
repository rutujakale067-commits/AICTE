import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { User, ArrowLeft, Filter, RotateCcw } from "lucide-react";
import { api, fmtDate } from "../services/api";
import { Breadcrumbs, Section, Spinner, ErrorBox, Status, Empty } from "../components/ui";
import { StatGrid } from "../components/Cards";

export default function OfficerDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [f, setF] = useState({ status: "", date_from: "", date_to: "" });
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api(`/officers/${id}?` + new URLSearchParams(f))
      .then(setD)
      .catch((e) => setErr(e.message));
  }, [id, f]);

  if (err) return <ErrorBox text={err} />;
  if (!d) return <Spinner text="Loading officer scrutiny records..." />;

  const o = d.officer;

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Administrator Dashboard", to: "/" },
          { label: "Officer Monitoring" },
          { label: o.name },
        ]}
      />

      {/* Officer Profile Card */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-navy/10 text-navy flex items-center justify-center font-bold text-lg">
            <User size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-navy text-white">
                Scrutiny Officer Dossier
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-500">
                ID: {o.employee_id}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy tracking-tight">
              {o.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{o.designation}</p>
          </div>
        </div>

        <Link to="/" className="btn-ghost text-xs">
          <ArrowLeft size={13} />
          <span>Back to Overview</span>
        </Link>
      </div>

      {/* Metrics */}
      <StatGrid
        items={[
          ["total", "Assigned", o.assigned],
          ["pending", "Pending", o.pending],
          ["under", "Under Review", o.under_review],
          ["completed", "Reviewed", o.reviewed],
          ["approved", "Approved", o.approved],
          ["rejected", "Rejected", o.rejected],
          ["returned", "Returned", o.returned],
        ]}
      />

      {/* Filters */}
      <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          <Filter size={13} className="text-navy" />
          <span>Filter Officer Dossiers</span>
        </div>
        <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 items-end">
          <label className="text-xs font-semibold text-slate-600 block">
            Review Status
            <select
              className="field mt-1 text-xs"
              value={f.status}
              onChange={(e) => setF({ ...f, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              {[
                "Pending",
                "Under Review",
                "Approved",
                "Rejected",
                "Returned for Correction",
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold text-slate-600 block">
            From Date
            <input
              type="date"
              className="field mt-1 text-xs"
              value={f.date_from}
              onChange={(e) => setF({ ...f, date_from: e.target.value })}
            />
          </label>

          <label className="text-xs font-semibold text-slate-600 block">
            To Date
            <input
              type="date"
              className="field mt-1 text-xs"
              value={f.date_to}
              onChange={(e) => setF({ ...f, date_to: e.target.value })}
            />
          </label>

          <button
            type="button"
            className="btn-ghost text-xs"
            onClick={() => setF({ status: "", date_from: "", date_to: "" })}
          >
            <RotateCcw size={12} />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Assigned Applications */}
      <Section title={`Assigned Applications Queue (${d.applications.length})`}>
        {d.applications.length === 0 ? (
          <Empty text="No applications match the selected criteria." />
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Institution Name</th>
                  <th>Submitted Date</th>
                  <th>Assigned Date</th>
                  <th>Review Status</th>
                  <th>Scrutiny Status</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {d.applications.map((a: any) => (
                  <tr
                    key={a.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => nav(`/applications/${a.id}`)}
                  >
                    <td>
                      <Link
                        className="font-bold text-navy hover:underline text-xs"
                        to={`/applications/${a.id}`}
                      >
                        {a.app_no}
                      </Link>
                    </td>
                    <td className="font-medium text-slate-900 text-xs">{a.institution}</td>
                    <td className="text-xs text-slate-500 whitespace-nowrap">
                      {fmtDate(a.submitted_on)}
                    </td>
                    <td className="text-xs text-slate-500 whitespace-nowrap">
                      {fmtDate(a.assigned_at)}
                    </td>
                    <td>
                      <Status s={a.review_status} />
                    </td>
                    <td>
                      <Status s={a.status} />
                    </td>
                    <td className="text-xs text-slate-500 whitespace-nowrap">
                      {fmtDate(a.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Review History */}
      <Section title="Officer Review Action History">
        {d.history.length === 0 ? (
          <Empty text="No review events recorded in this timeframe." />
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Application ID</th>
                  <th>Event Type</th>
                  <th>Status Transition</th>
                  <th>Official Actor</th>
                  <th>Decision Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {d.history.map((e: any) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap font-mono text-xs text-slate-500">
                      {fmtDate(e.at)}
                    </td>
                    <td>
                      <Link
                        className="font-bold text-navy hover:underline text-xs"
                        to={`/applications/${e.app_id}`}
                      >
                        {e.app_no}
                      </Link>
                    </td>
                    <td className="font-semibold text-slate-800 text-xs">{e.event}</td>
                    <td className="text-xs font-mono text-slate-700">
                      {e.from_status || e.to_status
                        ? `${e.from_status ?? "—"} → ${e.to_status ?? "—"}`
                        : "—"}
                    </td>
                    <td className="text-xs text-slate-700 font-medium">{e.actor}</td>
                    <td className="text-xs text-slate-600 max-w-sm">{e.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}
