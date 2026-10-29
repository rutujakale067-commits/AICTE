import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { UserCheck, Shield, CheckCircle2, RotateCcw } from "lucide-react";
import { api } from "../services/api";
import { Breadcrumbs, Section, Spinner, ErrorBox } from "../components/ui";
import ApplicationTable from "../components/ApplicationTable";
import { StatGrid } from "../components/Cards";

export default function OfficerDashboard() {
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = () => {
    setRefreshing(true);
    return api("/officer/overview")
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
  if (!d) return <Spinner text="Loading scrutiny workspace..." />;

  const chartData = [
    { name: "Pending", value: d.pending, fill: "#94a3b8" },
    { name: "Under Review", value: d.under_review, fill: "#1D5288" },
    { name: "Approved", value: d.approved, fill: "#16A34A" },
    { name: "Rejected", value: d.rejected, fill: "#DC2626" },
    { name: "Returned", value: d.returned, fill: "#E8871E" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-4">
        <Breadcrumbs items={[{ label: "Officer Scrutiny Workspace" }]} />

        {/* Officer Header Card */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-soft flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-wider bg-[#002147] text-white">
                Council Scrutiny Officer
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-mono">
                ID: {d.officer.employee_id}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#002147] tracking-tight">
              Scrutiny Desk · {d.officer.name}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              {d.officer.designation} · Showing dossiers assigned to your scrutiny desk. Reviews reflect official statutory determinations under APH 2024–27.
            </p>
          </div>

          <button
            onClick={load}
            disabled={refreshing}
            className="btn-ghost text-xs flex items-center gap-1.5 shadow-xs font-semibold"
          >
            <RotateCcw size={13} className={refreshing ? "animate-spin" : ""} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Regulatory Governance Framework Banner */}
        <div className="bg-[#002147] text-white p-3.5 rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-xs border-l-4 border-[#FF9933]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-amber-300">
              <UserCheck size={18} />
            </div>
            <div>
              <div className="font-bold text-xs flex items-center gap-1.5">
                <span>Regulatory Scrutiny Verification Active</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded font-mono font-semibold">
                  Mandatory Council Officer Review
                </span>
              </div>
              <div className="text-[11px] text-slate-200">
                Automated scrutiny verifies document parameters & flags preliminary observations. You examine submitted evidence, validate authenticity, and record official determinations.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="bg-white/10 px-2 py-1 rounded text-[11px] text-slate-200">
              Automated Check: <strong>Active</strong>
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-1 rounded text-[11px] font-bold">
              Officer Discretion: <strong>Statutory</strong>
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <StatGrid
          items={[
            ["total", "Assigned to Me", d.assigned, "Total applications assigned to your desk"],
            ["pending", "Pending Scrutiny", d.pending, "Awaiting initial review"],
            ["under", "Under Review", d.under_review, "Currently in verification"],
            ["completed", "Completed Reviews", d.reviewed, "Official decisions recorded"],
            ["approved", "Approved", d.approved, "Approval granted"],
            ["rejected", "Rejected", d.rejected, "Rejection recorded"],
            ["returned", "Returned for Correction", d.returned, "Referred back to institution"],
          ]}
        />

        {/* Overview Chart & Compliance Snapshot */}
        <div className="grid md:grid-cols-2 gap-4">
          <Section title="Scrutiny Status Distribution">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" angle={-15} textAnchor="end" height={40} tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((e, i) => (
                      <Cell key={i} fill={e.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Assigned Applications Quick Summary">
            <div className="space-y-3 p-2">
              <div className="flex items-center justify-between text-xs border-b pb-2">
                <span className="text-slate-600">Total Workload Assigned</span>
                <span className="font-bold text-navy">{d.assigned} Dossiers</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b pb-2">
                <span className="text-slate-600">Pending Review</span>
                <span className="font-bold text-amber-600">{d.pending} Dossiers</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b pb-2">
                <span className="text-slate-600">Completed Official Determinations</span>
                <span className="font-bold text-emerald-600">{d.reviewed} Dossiers</span>
              </div>
              <div className="pt-2 text-xs text-slate-500 leading-relaxed">
                Click on any application below to scrutinize institutional parameters, verify uploaded affidavits and NOCs against APH norms, and issue official reports.
              </div>
            </div>
          </Section>
        </div>

        {/* Assigned Applications Table */}
        <Section title={`My Assigned Applications (${d.apps?.length || 0})`}>
          <ApplicationTable defaultSize={10} />
        </Section>
    </div>
  );
}
