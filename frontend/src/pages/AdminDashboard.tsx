import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  RotateCcw,
  Users,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  UserPlus,
  Scale,
} from "lucide-react";
import { api, fmtDate } from "../services/api";
import { Breadcrumbs, Section, Spinner, ErrorBox, Status, Empty } from "../components/ui";
import ApplicationTable from "../components/ApplicationTable";
import { StatGrid } from "../components/Cards";
import { useToast } from "../hooks/useToast";

export default function AdminDashboard() {
  const toast = useToast();
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState("");
  const [v, setV] = useState(0);
  const [pick, setPick] = useState<Record<number, string>>({});
  const [refreshing, setRefreshing] = useState(false);

  const load = () => {
    setRefreshing(true);
    return api("/admin/overview")
      .then((data) => {
        setD(data);
        setErr("");
      })
      .catch((e) => setErr(e.message))
      .finally(() => setRefreshing(false));
  };

  useEffect(() => {
    load();
  }, []);

  if (err) return <ErrorBox text={err} />;
  if (!d) return <Spinner text="Loading system overview..." />;

  const assign = async (id: number) => {
    try {
      await api(`/applications/${id}/assign`, {
        json: { officer_id: +pick[id] },
      });
      toast("Application assigned successfully");
      await load();
      setV(v + 1);
    } catch (e: any) {
      toast(e.message, "err");
    }
  };

  const chart = d.officers.map((o: any) => ({
    name: o.name.replace("Demo ", ""),
    Pending: o.pending,
    "Under Review": o.under_review,
    Approved: o.approved,
    Rejected: o.rejected,
    Returned: o.returned,
  }));

  const prog = d.officers.map((o: any) => ({
    name: o.name.replace("Demo ", ""),
    Assigned: o.assigned,
    Reviewed: o.reviewed,
    "Awaiting Review": o.awaiting,
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-4">
        <Breadcrumbs items={[{ label: "Administrator Dashboard" }]} />

      {/* Header Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-navy text-white">
              System Administrator
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              National Scrutiny Command
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-navy tracking-tight">
            System-Wide Scrutiny Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Live workload metrics across all regional scrutiny officers, unassigned application queues, and scrutiny progress tracked in real time from the secure database.
          </p>
        </div>

        <button
          onClick={load}
          disabled={refreshing}
          className="btn-ghost text-xs flex items-center gap-1.5 shadow-xs"
        >
          <RotateCcw size={13} className={refreshing ? "animate-spin" : ""} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Dual Human-AI Governance Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-soft flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-navy/10 text-navy flex items-center justify-center shrink-0">
            <Scale size={18} />
          </div>
          <div>
            <div className="font-bold text-navy text-xs">
              Human-in-the-Loop Regulatory Scrutiny Framework (AICTE APH 2024–27)
            </div>
            <div className="text-[11px] text-slate-500">
              AI pre-scrutiny processes statutory documents in real-time, generating advisory evidentiary findings. Authorized Scrutiny Officers examine evidence, conduct manual verification, and record legally binding determinations.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-1 rounded text-[11px] font-semibold">
            🤖 AI Pre-Screening: Active
          </span>
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded text-[11px] font-bold">
            👤 Human Officer Sign-Off: Mandatory
          </span>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <StatGrid
        items={[
          ["total", "Total Applications", d.total, "Total EoA applications submitted"],
          ["pending", "Pending Review", d.pending, "Awaiting scrutiny start"],
          ["under", "Under Review", d.under_review, "Currently being scrutinized by officers"],
          ["approved", "Approved", d.approved, "Approved by scrutiny officers"],
          ["rejected", "Rejected", d.rejected, "Deficiencies not rectified"],
          ["returned", "Returned for Correction", d.returned, "Sent back to institution for clarification"],
          ["unassigned", "Not Yet Assigned", d.unassigned_count, "Requires officer allocation"],
        ]}
      />

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Section title="Workload by Scrutiny Officer (Review Status)">
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#475569" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E2E8F0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="Pending" stackId="a" fill="#94a3b8" />
                <Bar dataKey="Under Review" stackId="a" fill="#1D5288" />
                <Bar dataKey="Approved" stackId="a" fill="#16A34A" />
                <Bar dataKey="Rejected" stackId="a" fill="#DC2626" />
                <Bar dataKey="Returned" stackId="a" fill="#E8871E" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Review Progress by Scrutiny Officer">
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prog} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#475569" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E2E8F0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="Assigned" fill="#0F2B48" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Reviewed" fill="#16A34A" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Awaiting Review" fill="#E8871E" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      {/* Officer Monitoring Table */}
      <Section
        title="Officer Performance & Workload Monitoring"
        subtitle="Click an officer name for detailed application queue and review history"
      >
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="tbl">
            <thead>
              <tr>
                <th>Scrutiny Officer</th>
                <th>Designation / Employee ID</th>
                <th>Assigned</th>
                <th>Reviewed</th>
                <th>Pending</th>
                <th>Under Review</th>
                <th>Approved</th>
                <th>Rejected</th>
                <th>Returned</th>
                <th className="bg-amber-50 text-amber-900 font-bold">Awaiting Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {d.officers.map((o: any) => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td>
                    <Link
                      className="text-brand hover:text-navy font-semibold flex items-center gap-1 group"
                      to={`/officers/${o.id}`}
                    >
                      <span>{o.name}</span>
                      <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </td>
                  <td>
                    <div className="font-medium text-slate-700">{o.designation}</div>
                    <div className="text-[10px] font-mono text-slate-400">{o.employee_id}</div>
                  </td>
                  <td className="font-semibold">{o.assigned}</td>
                  <td className="text-emerald-700 font-semibold">{o.reviewed}</td>
                  <td className="text-slate-600">{o.pending}</td>
                  <td className="text-sky-700 font-medium">{o.under_review}</td>
                  <td className="text-emerald-700 font-medium">{o.approved}</td>
                  <td className="text-rose-700 font-medium">{o.rejected}</td>
                  <td className="text-amber-700 font-medium">{o.returned}</td>
                  <td className="bg-amber-50/60 font-bold text-amber-900">
                    {o.awaiting}
                  </td>
                </tr>
              ))}
              <tr className="font-bold bg-slate-100/90 text-navy">
                <td colSpan={2}>National Consolidated Total</td>
                {[
                  "assigned",
                  "reviewed",
                  "pending",
                  "under_review",
                  "approved",
                  "rejected",
                  "returned",
                  "awaiting",
                ].map((k) => (
                  <td key={k}>
                    {d.officers.reduce((s: number, o: any) => s + o[k], 0)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* Unassigned Applications Allocation Section */}
      <Section
        title={`Unassigned Applications Queue (${d.unassigned.length})`}
        subtitle="Allocate unassigned applications to regional scrutiny officers"
      >
        {d.unassigned.length === 0 ? (
          <Empty text="All applications have been assigned to scrutiny officers." />
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Institution</th>
                  <th>Category</th>
                  <th>Submitted Date</th>
                  <th>Assign To Officer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {d.unassigned.map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td>
                      <Link
                        className="text-navy font-bold hover:underline"
                        to={`/applications/${a.id}`}
                      >
                        {a.app_no}
                      </Link>
                    </td>
                    <td className="font-medium text-slate-900">{a.institution}</td>
                    <td className="text-xs text-slate-500">{a.category}</td>
                    <td className="text-xs text-slate-500">{fmtDate(a.submitted_on)}</td>
                    <td>
                      {d.can_assign ? (
                        <div className="flex items-center gap-2">
                          <select
                            className="field !w-48 text-xs"
                            aria-label={`Assign ${a.app_no}`}
                            value={pick[a.id] || ""}
                            onChange={(e) =>
                              setPick({ ...pick, [a.id]: e.target.value })
                            }
                          >
                            <option value="">Select Scrutiny Officer</option>
                            {d.officers.map((o: any) => (
                              <option key={o.id} value={o.id}>
                                {o.name} ({o.designation})
                              </option>
                            ))}
                          </select>
                          <button
                            className="btn-primary !py-1 text-xs font-semibold"
                            disabled={!pick[a.id]}
                            onClick={() => assign(a.id)}
                          >
                            <UserPlus size={12} />
                            <span>Assign</span>
                          </button>
                        </div>
                      ) : (
                        <Status s="Pending" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* All Applications Master Registry */}
      <Section title="Master Scrutiny Registry (All Applications)">
        <ApplicationTable defaultSize={10} version={v} />
      </Section>
    </div>
  );
}
