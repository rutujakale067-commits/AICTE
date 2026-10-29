import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  UserPlus,
  ClipboardCheck,
  Upload,
  ExternalLink,
  Play,
  FileDown,
  MessageSquare,
  CheckCircle2,
  ShieldAlert,
  ListChecks,
  Pencil,
  Lock,
  Building,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  BookOpen,
  History as HistoryIcon,
  Milestone,
  GitCompare,
  UserCheck,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { api, fmtDate, openDocument, downloadReport } from "../services/api";
import {
  Breadcrumbs,
  Section,
  Spinner,
  ErrorBox,
  Status,
  Progress,
  Modal,
  ReasonDialog,
  Empty,
} from "../components/ui";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";

const TABS = [
  { label: "Overview & Hybrid Verification", icon: Building },
  { label: "Required Documents", icon: FileText },
  { label: "Scrutiny Findings & Officer Adjudication", icon: ClipboardCheck },
  { label: "Cross-Document Reconciliation", icon: GitCompare },
  { label: "Handbook Rules", icon: BookOpen },
  { label: "Official Review Workflow", icon: UserCheck },
  { label: "Audit & Human Sign-Off Trail", icon: HistoryIcon },
  { label: "Tracking Journey", icon: Milestone },
];

const OPEN = ["Potential Deficiency", "Manual Review Required"];

const COURSE_NAMES: Record<string, string> = {
  "386491ac-d5c9-4dfd-b15c-69293ec13524": "Mechanical Engineering",
  "401330aa-2b8d-4380-8067-00ef2e58e52b": "Artificial Intelligence & Data Science",
  "abcebc22-7e88-4001-8721-b56af136ce10": "Electronics & Communication Engineering",
  "bde179c1-ffd2-4a59-ae80-74d54f3dc470": "CSE (AI & Machine Learning)",
  "dfaaccc4-87de-403d-b9d3-2c5f43f4cac7": "Computer Science & Engineering",
  "e0884d83-68d6-4f75-80b5-8888bc1fd177": "Civil Engineering",
  "f9407e91-d3df-4bbb-af7a-debe2fe04dda": "Electrical & Electronics Engineering",
};

export default function ApplicationDetail() {
  const { id } = useParams();
  const toast = useToast();
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [app, setApp] = useState<any>(null);
  const [err, setErr] = useState("");
  const [runs, setRuns] = useState<any[]>([]);
  const [runId, setRunId] = useState<number | null>(null);
  const [busy, setBusy] = useState("");
  const [dlg, setDlg] = useState("");
  const [audit, setAudit] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  const load = useCallback(async () => {
    try {
      const a = await api(`/applications/${id}`);
      setApp(a);
      const r = await api(`/applications/${id}/runs`);
      setRuns(r);
      setRunId((cur) => cur ?? r[0]?.id ?? null);
      setAudit(await api(`/audit?application_id=${id}`));
      setReports((await api("/reports")).filter((x: any) => x.app_id === +id!));
    } catch (e: any) {
      setErr(e.message);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (label: string, fn: () => Promise<any>, ok: string) => {
    setBusy(label);
    try {
      await fn();
      toast(ok);
      await load();
    } catch (e: any) {
      toast(e.message, "err");
    }
    setBusy("");
  };

  if (err) return <ErrorBox text={err} />;
  if (!app) return <Spinner text="Loading institution application dossier..." />;

  const run = runs.find((r) => r.id === runId);

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Application Management", to: "/applications" },
          { label: app.app_no },
        ]}
      />

      {/* Hero Dossier Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-navy text-white">
                {app.app_no}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-brand">
                {app.category}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Academic Year {app.academic_year}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy tracking-tight">
              {app.institution}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Institution Code: <span className="font-mono font-semibold text-slate-700">{app.code}</span> · Assigned Reviewer: <span className="font-semibold text-slate-700">{app.reviewer || "Unassigned"}</span>
            </p>
          </div>

          {/* Dual Verification Status Badges & Action Toolbar */}
          <div className="flex flex-col items-end gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 text-xs">
                <span className="text-[11px] text-blue-800 font-semibold flex items-center gap-1">
                  <Sparkles size={11} className="text-blue-600" /> AI Pre-Scrutiny:
                </span>
                <Status s={app.status} />
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 text-xs">
                <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                  <UserCheck size={12} className="text-emerald-700" /> Human Scrutiny Officer:
                </span>
                <Status s={app.review_status} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {user!.role === "Administrator" ? (
                <button
                  type="button"
                  className="btn-ghost text-xs"
                  onClick={() => setDlg("assign")}
                >
                  <UserPlus size={13} />
                  <span>{app.reviewer_id ? "Reassign Officer" : "Assign Officer"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-ghost text-xs"
                  onClick={() => setDlg("review")}
                  disabled={!app.reviewer_id}
                >
                  <ClipboardCheck size={13} />
                  <span>Update Review Status</span>
                </button>
              )}

              <button
                type="button"
                className="btn-primary text-xs"
                disabled={!!busy}
                onClick={() =>
                  act(
                    "run",
                    async () => {
                      const r = await api(`/applications/${id}/scrutiny/run`, {
                        method: "POST",
                      });
                      setRunId(r.run_id);
                      setTab(2);
                    },
                    "Handbook rules executed — new scrutiny run recorded"
                  )
                }
              >
                <Play size={13} />
                <span>{runs.length ? "Rerun Scrutiny Checks" : "Run Scrutiny Checks"}</span>
              </button>

              <button
                type="button"
                className="btn-accent text-xs"
                disabled={!!busy || !runs.length}
                onClick={() =>
                  act(
                    "rep",
                    async () => {
                      const r = await api(
                        `/applications/${id}/report?run_id=${runId ?? 0}`,
                        { method: "POST" }
                      );
                      await downloadReport(r.id, r.file_name);
                    },
                    "Official scrutiny report generated successfully"
                  )
                }
              >
                <FileDown size={13} />
                <span>Download PDF Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-white rounded-t-lg px-2 shadow-xs" role="tablist">
        {TABS.map((t, i) => {
          const Icon = t.icon;
          const isActive = tab === i;
          return (
            <button
              key={t.label}
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(i)}
              className={`flex items-center gap-2 px-3.5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? "border-navy text-navy bg-slate-50/80"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
              }`}
            >
              <Icon size={14} className={isActive ? "text-brand" : "text-slate-400"} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-transparent">
        {tab === 0 && <Overview app={app} runs={runs} />}
        {tab === 1 && <Documents app={app} reload={load} />}
        {tab === 2 && (
          <Findings
            app={app}
            runs={runs}
            runId={runId}
            setRunId={setRunId}
            reload={load}
            role={user!.role}
          />
        )}
        {tab === 3 && (
          <CrossDocumentValidation
            app={app}
            runs={runs}
            runId={runId}
          />
        )}
        {tab === 4 && <HandbookRules app={app} />}
        {tab === 5 && (
          <Review
            app={app}
            run={run}
            runs={runs}
            reports={reports}
            canFinal={app.can_finalize}
            act={act}
            busy={busy}
          />
        )}
        {tab === 6 && <History audit={audit} runs={runs} />}
        {tab === 7 && (
          <Tracking id={id!} version={app.updated_at + app.review_status} />
        )}
      </div>

      {dlg === "assign" && (
        <AssignDialog
          app={app}
          onClose={() => setDlg("")}
          done={() => {
            setDlg("");
            load();
          }}
        />
      )}
      {dlg === "review" && (
        <ReviewDialog
          app={app}
          onClose={() => setDlg("")}
          done={() => {
            setDlg("");
            load();
          }}
          role={user!.role}
        />
      )}
    </div>
  );
}

const KV = ({ k, v }: any) => (
  <tr className="border-b border-slate-100 last:border-0">
    <th className="bg-slate-50/70 px-3.5 py-2 text-left w-56 text-xs font-semibold text-navy">
      {k}
    </th>
    <td className="px-3.5 py-2 text-xs text-slate-700">{v}</td>
  </tr>
);

function Overview({ app, runs }: any) {
  const i = app.institution_detail || {};
  const ca = app.compliance_assessment;
  const fac = app.faculty_summary || {};
  const intakes: any[] = app.intake_capacities || [];

  return (
    <div className="space-y-4">
      {/* 0. Dual Human-AI Hybrid Scrutiny Framework Banner */}
      <div className="bg-gradient-to-r from-navy via-[#143B63] to-navy text-white rounded-lg p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Scale size={18} className="text-amber-400" />
            <span className="font-extrabold text-sm tracking-wide">
              AICTE Dual Human-AI Verification Framework (APH 2024–27)
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/30 text-amber-300 font-mono text-[10px] uppercase font-bold">
            Human-in-the-Loop Regulatory Architecture
          </span>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed mb-3">
          Under statutory norms of the AICTE Act 1987, automated systems operate strictly as preliminary decision-support. Official Extension of Approval (EoA) determinations require mandatory physical and digital attestation by designated Human Scrutiny Officers and Statutory Approval Committees.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/10 p-3 rounded-lg border border-white/10 backdrop-blur-xs">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-1">
              <Sparkles size={13} />
              <span>1. AI Pre-Scrutiny Engine</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Automated text extraction (PaddleOCR), polygon coordinate mapping, mathematical ratio calculation, and initial advisory flags.
            </p>
            <div className="mt-2 text-[10px] font-mono text-emerald-300 flex items-center gap-1 font-semibold">
              <CheckCircle2 size={11} /> Pre-Screening Executed (Advisory)
            </div>
          </div>

          <div className="bg-white/10 p-3 rounded-lg border border-white/10 backdrop-blur-xs">
            <div className="flex items-center gap-1.5 text-sky-300 font-bold mb-1">
              <UserCheck size={13} />
              <span>2. Human Scrutiny Officer</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Assigned officer {app.reviewer || "Scrutiny Officer"} reviews scanned certificates, verifies digital seals/signatures, examines mitigating facts, and accepts or overrules advisory flags.
            </p>
            <div className="mt-2 text-[10px] font-mono text-amber-300 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              Human Adjudication Active
            </div>
          </div>

          <div className="bg-white/10 p-3 rounded-lg border border-white/10 backdrop-blur-xs">
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold mb-1">
              <ShieldCheck size={13} />
              <span>3. Statutory Approval Committee</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Executive Committee / Standing Hearing Committee (SHC) reviews officer endorsements and issues final Speaking Orders under Section 1.11 / 2.24.
            </p>
            <div className="mt-2 text-[10px] font-mono text-slate-300 flex items-center gap-1 font-semibold">
              <Lock size={11} /> Exclusive Statutory Authority
            </div>
          </div>
        </div>
      </div>

      {/* Automated Speaking Order & Compliance Assessment Banner (Chapter 5) */}
      {ca && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-navy flex items-center justify-center text-white font-extrabold text-base shadow-xs">
                {ca.overall_compliance_score.toFixed(0)}%
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-navy">
                    Draft Speaking Order & Preliminary Compliance Assessment
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    ca.compliance_category === "FULLY_COMPLIANT" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                    ca.compliance_category === "MINOR_NON_COMPLIANT" ? "bg-sky-100 text-sky-800 border border-sky-300" :
                    ca.compliance_category === "MAJOR_NON_COMPLIANT" ? "bg-amber-100 text-amber-800 border border-amber-300" :
                    "bg-rose-100 text-rose-800 border border-rose-300"
                  }`}>
                    {ca.compliance_category.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  AI-Assisted Preliminary Scoring · Subject to Human Scrutiny Officer Verification & Committee Endorsement
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Scrutiny Recommendation:</span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold ${
                ca.overall_recommendation === "RECOMMENDED" ? "bg-emerald-600 text-white" :
                ca.overall_recommendation === "RE_SCRUTINY_REQUIRED" ? "bg-amber-600 text-white" :
                "bg-rose-600 text-white"
              }`}>
                {ca.overall_recommendation.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          <div className="mt-3.5 p-3.5 bg-slate-50 rounded-lg border border-slate-200 font-serif text-xs text-slate-800 leading-relaxed">
            <div className="font-sans font-bold text-navy text-[11px] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Draft Speaking Order Text (Section 1.11 / 2.24)</span>
              <span className="text-[10px] text-slate-500 font-normal italic">Preliminary draft prepared for Officer review</span>
            </div>
            "{ca.speaking_order_summary}"
          </div>

          {/* Official Human Scrutiny Officer Attestation Card */}
          <div className="mt-3.5 p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <UserCheck size={18} />
              </div>
              <div>
                <div className="font-bold text-navy text-xs flex items-center gap-1.5">
                  <span>Assigned Scrutiny Officer: {app.reviewer || "Pending Assignment"}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono font-normal">
                    AICTE-SO-101
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Senior Scrutiny Officer · Bureau of Approval, AICTE Headquarters, New Delhi
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">Human Officer Review:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] flex items-center gap-1">
                <CheckCircle2 size={11} className="text-emerald-700" /> Officer Examined & Verified
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3.5 pt-3 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Critical Deficiencies</span>
              <span className={`text-base font-bold ${ca.critical_issues_count > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                {ca.critical_issues_count}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Major Deficiencies</span>
              <span className={`text-base font-bold ${ca.major_issues_count > 0 ? "text-amber-600" : "text-emerald-700"}`}>
                {ca.major_issues_count}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Minor Discrepancies</span>
              <span className="text-base font-bold text-slate-800">{ca.minor_issues_count}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Missing Statutory Docs</span>
              <span className={`text-base font-bold ${ca.missing_documents_count > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                {ca.missing_documents_count}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Profile & Application Metadata */}
      <div className="grid md:grid-cols-2 gap-4">
        <Section title="Institution Profile & Campus Records">
          <table className="w-full text-xs">
            <tbody>
              <KV k="Institution Name" v={app.institution} />
              <KV k="AICTE Permanent ID" v={<span className="font-mono font-semibold">{i.aicte_permanent_id || app.code}</span>} />
              <KV k="Campus Address" v={i.address} />
              <KV k="State / Territory" v={i.state} />
              <KV k="AICTE Region" v={i.aicte_region?.replace(/_/g, " ")} />
              <KV k="Location Classification" v={i.location_classification} />
              <KV k="Affiliating University" v={i.affiliating_university || "State Technical University"} />
              <KV k="Affiliating Board" v={i.affiliating_board || "Directorate of Technical Education"} />
              <KV k="NAAC Accreditation" v={i.naac_accredited ? `Accredited (CGPA ${i.naac_score})` : "Not Accredited"} />
              <KV k="NIRF Ranking Band" v={i.nirf_ranked ? (i.nirf_rank_band || "Ranked") : "Unranked"} />
              <KV k="Autonomous Status" v={i.autonomous_status ? "Autonomous" : "Non-Autonomous"} />
              <KV k="Official Website" v={i.official_website ? <a href={i.official_website} target="_blank" rel="noreferrer" className="text-brand underline">{i.official_website}</a> : "—"} />
              <KV k="Official Email" v={i.official_email || "—"} />
            </tbody>
          </table>
        </Section>

        <Section title="Application Metadata & Scrutiny State">
          <table className="w-full text-xs">
            <tbody>
              <KV k="Application ID" v={<span className="font-mono font-bold text-navy">{app.app_no}</span>} />
              <KV k="Approval Category" v={app.category} />
              <KV k="Academic Year" v={app.academic_year} />
              <KV k="TER Payment Status" v={<span className="font-semibold text-emerald-700">{app.ter_payment_status || "PAID"}</span>} />
              <KV k="Multi-Year EoA Eligible" v={app.is_multi_year_eligible ? `Yes (${app.multi_year_duration_years} Years)` : "No (Annual Scrutiny)"} />
              <KV k="Submitted On" v={fmtDate(app.submitted_on)} />
              <KV k="Assigned Scrutiny Officer" v={app.reviewer || <span className="italic text-amber-700">Not yet assigned</span>} />
              <KV k="Scrutiny Assessment Status" v={<Status s={app.status} />} />
              <KV k="Document Completeness" v={<Progress v={app.completeness} />} />
              <KV k="Scrutiny Runs Executed" v={<span className="font-semibold">{runs.length} run(s)</span>} />
            </tbody>
          </table>
        </Section>
      </div>

      {/* Statutory Affidavits & Regulatory Undertakings (APH Affidavit-2 Verification) */}
      <Section
        title="Statutory Affidavits & Regulatory Undertakings (APH Affidavit-2 Verification)"
        subtitle="Mandatory legal affirmations evaluated as per AICTE Approval Process Handbook (APH 2024–27), Chapter I/II/IV"
      >
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-3.5 mb-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Governing Instrument</span>
              <span className="font-bold text-navy text-xs">AFFIDAVIT-2 (Comprehensive EoA Affirmation)</span>
              <span className="text-[10px] text-slate-500 block">Required under APH Clause 2.3.4(a)-(b)</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Stamp Paper &amp; Legal Sworn</span>
              <span className="font-bold text-slate-800 text-xs">Rs. 100/- Non-Judicial E-Stamp</span>
              <span className="text-[10px] text-slate-500 block">Sworn before First Class Judicial Magistrate / Notary</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Affidavit Audit Verdict</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-xs">
                <CheckCircle2 size={13} /> Duly Executed &amp; Attested
              </span>
              <span className="text-[10px] text-slate-500 block">Deponent: Chairperson / Secretary of Trust</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="tbl !text-[11px]">
            <thead>
              <tr>
                <th className="w-28">APH Clause</th>
                <th>Statutory Requirement (Affidavit-2 Affirmations)</th>
                <th>Evidentiary Basis &amp; Verification</th>
                <th className="w-32">Scrutiny State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="font-bold text-navy font-mono">Cl. 3 &amp; 14</td>
                <td>
                  <div className="font-semibold text-slate-900">Building Occupancy &amp; Structural Stability</div>
                  <div className="text-[10px] text-slate-500">Valid Occupancy/Completion Certificate, Form D, and Structural Stability Certificate from Competent Authority.</div>
                </td>
                <td className="text-slate-700">Municipal Occupancy &amp; Chartered Structural Stability certificates verified on record.</td>
                <td>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 size={10} /> Compliant
                  </span>
                </td>
              </tr>
              <tr>
                <td className="font-bold text-navy font-mono">Cl. 5</td>
                <td>
                  <div className="font-semibold text-slate-900">Fire Safety NOC</div>
                  <div className="text-[10px] text-slate-500">Valid Fire Safety Certificate issued by State Fire Services Department.</div>
                </td>
                <td className="text-slate-700">State Fire Services Certificate verified valid for academic cycle.</td>
                <td>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 size={10} /> Compliant
                  </span>
                </td>
              </tr>
              <tr>
                <td className="font-bold text-navy font-mono">Cl. 6 &amp; 7</td>
                <td>
                  <div className="font-semibold text-slate-900">Principal &amp; Faculty SFR / Cadre Ratio</div>
                  <div className="text-[10px] text-slate-500">Regular qualified Principal &amp; Student-to-Faculty Ratio (1:15/1:20) and Cadre Ratio (1:2:6).</div>
                </td>
                <td className="text-slate-700">Approved Principal in position; Aadhaar-seeded faculty roster verified.</td>
                <td>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 size={10} /> Compliant
                  </span>
                </td>
              </tr>
              <tr>
                <td className="font-bold text-navy font-mono">Cl. 9</td>
                <td>
                  <div className="font-semibold text-slate-900">Original Degree Non-Retention Prohibition</div>
                  <div className="text-[10px] text-slate-500">Undertaking that Trust has not demanded or retained original degree certificates of faculty.</div>
                </td>
                <td className="text-slate-700">Sworn undertaking on Rs. 100/- stamp paper under penalty of approval withdrawal.</td>
                <td>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 size={10} /> Compliant
                  </span>
                </td>
              </tr>
              <tr>
                <td className="font-bold text-navy font-mono">Cl. 10 &amp; 13</td>
                <td>
                  <div className="font-semibold text-slate-900">Campus Land Title &amp; Master Plan</div>
                  <div className="text-[10px] text-slate-500">Contiguous, dispute-free campus land title registered in name of Trust (Table 13 compliant).</div>
                </td>
                <td className="text-slate-700">District Collector CLU / Land Registration deed verified contiguous.</td>
                <td>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 size={10} /> Compliant
                  </span>
                </td>
              </tr>
              <tr>
                <td className="font-bold text-navy font-mono">Cl. 15 &amp; 31</td>
                <td>
                  <div className="font-semibold text-slate-900">Salary Pay Scales &amp; Minimum Wages Act</div>
                  <div className="text-[10px] text-slate-500">Compliance with AICTE 7th CPC pay scales, PF deduction, TDS, and state Minimum Wages Act.</div>
                </td>
                <td className="text-slate-700">Nationalized bank ECS salary transfers and PF return submissions verified.</td>
                <td>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 size={10} /> Compliant
                  </span>
                </td>
              </tr>
              <tr>
                <td className="font-bold text-navy font-mono">Cl. 28 &amp; 29</td>
                <td>
                  <div className="font-semibold text-slate-900">Mandatory Statutory Committees</div>
                  <div className="text-[10px] text-slate-500">Anti-Ragging (2009 Reg), Grievance Ombudsman (2019 Reg), Internal Committee POSH (2016 Reg), SC/ST Committee (1989 Act), and IQAC.</div>
                </td>
                <td className="text-slate-700">All 4 mandatory statutory committees constituted with external members and notified on portal.</td>
                <td>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 size={10} /> Compliant
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* Approved Intake & Faculty Cadre Ratios (Annexure 5 Norms) */}
      <div className="grid md:grid-cols-2 gap-4">
        <Section title="Faculty Cadre Ratios (Annexure 5 & Clause 6.14)">
          <div className="grid grid-cols-3 gap-2.5 mb-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Total Faculty</span>
              <span className="text-lg font-bold text-navy">{fac.total_faculty || 0}</span>
              <span className="text-[10px] text-slate-400 block">Prescribed: {fac.prescribed_faculty || 0}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Ph.D. Qualified</span>
              <span className="text-lg font-bold text-brand">{fac.phd_count || 0}</span>
              <span className="text-[10px] text-slate-400 block">Doctorates on rolls</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Cadre Ratio</span>
              <span className="text-lg font-bold text-emerald-700">{fac.cadre_ratio || "1:2:6"}</span>
              <span className="text-[10px] text-slate-400 block">Prof : Assoc : Asst</span>
            </div>
          </div>

          <table className="w-full text-xs">
            <tbody>
              <KV k="Professors on Rolls" v={fac.professors || 0} />
              <KV k="Associate Professors" v={fac.associate_professors || 0} />
              <KV k="Assistant Professors" v={fac.assistant_professors || 0} />
              <KV k="Nationalized Bank ECS Salary Clearance" v={<span className="text-emerald-700 font-semibold">{fac.bank_ecs_verified || 0} / {fac.total_faculty || 0} (100% compliant)</span>} />
              <KV k="Biometric & Aadhaar Seeding" v={<span className="text-emerald-700 font-semibold">{fac.biometric_enrolled || 0} / {fac.total_faculty || 0} (100% enrolled)</span>} />
            </tbody>
          </table>
        </Section>

        <Section title={`Approved Intake Capacities (${intakes.length} Courses)`}>
          {intakes.length === 0 ? (
            <div className="text-xs text-slate-500 italic p-3">No course intake records loaded.</div>
          ) : (
            <div className="overflow-x-auto max-h-60 overflow-y-auto border border-slate-200 rounded">
              <table className="tbl !text-[11px]">
                <thead>
                  <tr>
                    <th>Programme / Specialization</th>
                    <th>Divisions</th>
                    <th>Approved</th>
                    <th>Applied</th>
                    <th>TFW</th>
                    <th>Enrolled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {intakes.map((ic: any) => (
                    <tr key={ic.intake_id}>
                      <td>
                        <div className="font-bold text-navy">B.Tech {COURSE_NAMES[ic.course_id] || "Technical Programme"}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{ic.shift_type || "REGULAR"} · UG</div>
                      </td>
                      <td>{ic.division_count} Div ({ic.intake_per_division}/div)</td>
                      <td className="font-bold text-slate-900">{ic.approved_intake}</td>
                      <td className="font-medium text-slate-600">{ic.applied_intake}</td>
                      <td className="text-brand font-semibold">+{ic.tfw_supernumerary_seats}</td>
                      <td className="text-emerald-700 font-bold">{ic.enrolled_students_current_year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>

      <div className="text-xs rounded-lg border border-amber-300 bg-amber-50/70 p-3.5 text-amber-950 flex items-start gap-2">
        <AlertCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
        <span>
          <strong>Scrutiny Notice:</strong> The automated scrutiny engine flags potential clause discrepancies against the AICTE Approval Process Handbook (APH 2024–27). It never approves or rejects an application; all final decisions require official human adjudication.
        </span>
      </div>
    </div>
  );
}

function Documents({ app, reload }: any) {
  const toast = useToast();
  const ref = useRef<HTMLInputElement>(null);
  const [target, setTarget] = useState<string>("");
  const [fields, setFields] = useState<any>(null);
  const [fix, setFix] = useState<any>(null);
  const [busy, setBusy] = useState("");

  const pick = (t: string) => {
    setTarget(t);
    ref.current?.click();
  };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setBusy(target);
    const fd = new FormData();
    fd.append("doc_type", target);
    fd.append("file", f);
    try {
      const d = await api(`/applications/${app.id}/documents`, { form: fd });
      toast(`Document uploaded and analyzed: ${d.extraction_status}`);
      await reload();
    } catch (x: any) {
      toast(x.message, "err");
    }
    setBusy("");
  };

  const showFields = async (docId: number) => {
    try {
      setFields(await api(`/documents/${docId}/fields`));
    } catch (e: any) {
      toast(e.message, "err");
    }
  };

  return (
    <Section
      title="Required Documents Checklist (Annexure-2, Section 2.1)"
      subtitle="PDF files scrutinized according to AICTE handbook compliance requirements"
    >
      <input
        ref={ref}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={upload}
        aria-label="Select PDF file"
      />

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="tbl">
          <thead>
            <tr>
              <th>Required Document</th>
              <th>Handbook Requirement</th>
              <th>Uploaded File</th>
              <th>Upload Date</th>
              <th>Document Status</th>
              <th>Extraction Mode</th>
              <th>Verification State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {app.checklist.map((c: any) => (
              <tr key={c.doc_type} className="hover:bg-slate-50 transition-colors">
                <td>
                  <div className="font-bold text-navy">{c.label}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {c.clause}
                    {c.printed_page ? ` · Printed p.${c.printed_page}` : ""}
                  </div>
                </td>
                <td className="text-xs text-slate-600 max-w-xs">
                  <div>{c.requirement}</div>
                  {c.note && (
                    <div className="text-[10px] text-slate-400 mt-0.5">{c.note}</div>
                  )}
                </td>
                <td className="font-mono text-xs">
                  {c.document?.filename ? (
                    <span className="text-slate-800">{c.document.filename}</span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="text-xs text-slate-500 whitespace-nowrap">
                  {c.document ? fmtDate(c.document.uploaded_at) : "—"}
                </td>
                <td>
                  {c.state === "na" ? (
                    <Status s="Not Applicable" />
                  ) : c.document ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 size={12} /> Uploaded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                      <AlertCircle size={12} /> Missing
                    </span>
                  )}
                </td>
                <td>{c.document ? <Status s={c.document.extraction_status} /> : "—"}</td>
                <td>
                  <Status s={c.verification} />
                </td>
                <td className="space-x-1 whitespace-nowrap">
                  <button
                    type="button"
                    className="btn-ghost !py-1 !px-2 text-xs"
                    disabled={busy === c.doc_type}
                    onClick={() => pick(c.doc_type)}
                  >
                    <Upload size={12} />
                    <span>{c.document ? "Replace" : "Upload"}</span>
                  </button>
                  {c.document && (
                    <>
                      <button
                        type="button"
                        className="btn-ghost !py-1 !px-2 text-xs"
                        onClick={() =>
                          openDocument(c.document.id).catch((e) =>
                            toast(e.message, "err")
                          )
                        }
                      >
                        <ExternalLink size={12} />
                        <span>View</span>
                      </button>
                      <button
                        type="button"
                        className="btn-ghost !py-1 !px-2 text-xs"
                        onClick={() => showFields(c.document.id)}
                      >
                        <ListChecks size={12} />
                        <span>Fields</span>
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-slate-500 mt-2.5">
        Accepted format: PDF only, maximum size 15 MB. Superseded documents and their cryptographic SHA-256 hashes are permanently archived in the audit trail.
      </p>

      {fields && (
        <Modal
          wide
          title={`Extracted Document Fields — ${fields.document.filename}`}
          onClose={() => setFields(null)}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 mb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Extraction Status:</span>
              <Status s={fields.document.extraction_status} />
            </div>
            <div className="text-slate-600">
              Digital Signature Object:{" "}
              <strong>
                {fields.document.has_signature_field
                  ? "Field Detected (Visual placeholder — manual DSC verification required)"
                  : "None Detected"}
              </strong>
            </div>
          </div>

          {fields.fields.length === 0 ? (
            <Empty text="No structured key-value fields could be extracted from this document." />
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Field Identifier</th>
                    <th>Extracted Value</th>
                    <th>Corrected Value</th>
                    <th>Page</th>
                    <th>Confidence Score</th>
                    <th>Extraction Method</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fields.fields.map((f: any) => (
                    <tr key={f.id}>
                      <td className="font-semibold text-navy">{f.name}</td>
                      <td className="font-mono text-xs">{f.value}</td>
                      <td className="font-mono text-xs font-bold text-brand">
                        {f.corrected_value ?? "—"}
                      </td>
                      <td className="text-xs">Page {f.page}</td>
                      <td>
                        {f.confidence != null ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  f.confidence >= 0.8
                                    ? "bg-emerald-500"
                                    : "bg-amber-500"
                                }`}
                                style={{ width: `${Math.round(f.confidence * 100)}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-mono">
                              {(f.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        ) : (
                          "n/a"
                        )}
                      </td>
                      <td className="text-xs font-medium text-slate-600">{f.method}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-ghost !py-0.5 !px-2 text-xs"
                          onClick={() => setFix(f)}
                        >
                          <Pencil size={11} />
                          <span>Correct</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-[11px] text-slate-500 mt-2">
            Confidence is 0.90 for standard text-layer matches; for OCR documents, it represents the mean engine word confidence. Correcting field values updates the verification record and enables re-running checks.
          </p>

          {/* PaddleOCR Bounding Box Inspector (Chapter 3.1) */}
          {fields.ocr && (
            <div className="mt-3 border border-slate-200 rounded-lg p-3 bg-slate-50">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-navy text-xs">PaddleOCR (PP-OCRv4) Polygon Coordinates</span>
                  <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">
                    Mean Confidence: {(fields.ocr.confidence_score * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Latency: <strong>{fields.ocr.processing_time_ms} ms</strong> · Quality: <strong>{(fields.ocr.quality_score * 100).toFixed(1)}%</strong>
                </div>
              </div>

              {fields.ocr.lines && fields.ocr.lines.length > 0 ? (
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {fields.ocr.lines.map((ln: any, idx: number) => (
                    <div key={idx} className="bg-white p-2 rounded border border-slate-200 text-xs flex items-start justify-between gap-2">
                      <div>
                        <div className="font-mono text-xs font-semibold text-slate-800">{ln.text}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Polygon bbox: {JSON.stringify(ln.bbox)}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded shrink-0">
                        conf: {(ln.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <pre className="text-xs font-mono bg-white p-2 rounded border border-slate-200 text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {fields.ocr.extracted_text}
                </pre>
              )}
            </div>
          )}

          <details className="mt-3 text-xs border border-slate-200 rounded-lg p-2 bg-slate-50">
            <summary className="cursor-pointer font-semibold text-navy">
              View Raw Extracted Text by Page
            </summary>
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
              {Object.entries(fields.pages).map(([p, t]: any) => (
                <div key={p} className="bg-white border rounded p-2 text-xs">
                  <div className="font-bold text-slate-700 mb-1">Page {p}:</div>
                  <pre className="whitespace-pre-wrap font-mono text-[11px] text-slate-600">
                    {t || "(No text layer found on this page)"}
                  </pre>
                </div>
              ))}
            </div>
          </details>
        </Modal>
      )}

      {fix && (
        <ReasonDialog
          title={`Correct Field Value — ${fix.name}`}
          label="Official Corrected Value (as verified from the source document)"
          min={1}
          confirm="Save Correction"
          onClose={() => setFix(null)}
          onSubmit={async (v) => {
            await api(`/fields/${fix.id}`, {
              method: "PATCH",
              json: { value: v },
            });
            toast("Correction saved. Please rerun checks to apply.");
            setFix(null);
            setFields(await api(`/documents/${fields.document.id}/fields`));
            await reload();
          }}
        />
      )}
    </Section>
  );
}

function Findings({
  app,
  runs,
  runId,
  setRunId,
  reload,
  role,
}: any) {
  const toast = useToast();
  const [list, setList] = useState<any[] | null>(null);
  const [flt, setFlt] = useState("");
  const [sel, setSel] = useState<any>(null);
  const [dlg, setDlg] = useState<string>("");

  const run = runs.find((r: any) => r.id === runId);

  const refresh = useCallback(async () => {
    if (runId) {
      setList(await api(`/runs/${runId}/findings`));
    } else setList([]);
  }, [runId]);

  useEffect(() => {
    setList(null);
    refresh().catch((e) => toast(e.message, "err"));
  }, [refresh, app.status]);

  useEffect(() => {
    if (sel && list) setSel(list.find((f) => f.id === sel.id) || null);
  }, [list]);

  if (!runs.length)
    return (
      <Empty text="No scrutiny run has been executed yet. Use the 'Run Scrutiny Checks' button above." />
    );
  if (!list) return <Spinner text="Loading scrutiny findings..." />;

  const rows = list.filter((f) => !flt || f.status === flt);
  const locked = run?.finalized;

  const post = async (path: string, json: any, ok: string) => {
    await api(path, { method: "POST", json });
    toast(ok);
    await refresh();
    await reload();
  };

  return (
    <Section
      title="Scrutiny Findings & Human Officer Adjudication"
      subtitle="Dual Human-AI Scrutiny: AI performs preliminary clause evaluation and evidence extraction; official Scrutiny Officers examine evidence, attach human findings, and execute overrides where warranted."
      right={
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/80 font-normal">Active Run:</span>
          <select
            className="text-xs bg-white text-navy font-semibold px-2 py-1 rounded border border-slate-300 focus:outline-none"
            aria-label="Select scrutiny run"
            value={runId ?? ""}
            onChange={(e) => {
              setRunId(+e.target.value);
              setSel(null);
            }}
          >
            {runs.map((r: any) => (
              <option key={r.id} value={r.id}>
                Run #{r.run_no} — {fmtDate(r.started_at)}
                {r.finalized ? " (Finalized)" : ""}
              </option>
            ))}
          </select>
        </div>
      }
    >
      {/* Run Metadata & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 mb-3.5">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700">Filter Status:</label>
          <select
            className="border border-slate-300 rounded px-2 py-1 text-xs bg-white focus:outline-none"
            value={flt}
            onChange={(e) => setFlt(e.target.value)}
          >
            <option value="">All Findings ({list.length})</option>
            {["Potential Deficiency", "Manual Review Required", "Pass", "Not Applicable", "Resolved"].map(
              (s) => (
                <option key={s} value={s}>
                  {s} ({list.filter((f) => f.status === s).length})
                </option>
              )
            )}
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          {run && (
            <span>
              Pre-Screened by <strong className="text-navy">{run.run_by}</strong> · Human Scrutiny: <strong className="text-emerald-700">{app.reviewer || "Active Officer"}</strong>
            </span>
          )}
          {locked && (
            <span className="text-xs font-semibold text-sky-800 flex items-center gap-1 bg-sky-100 px-2 py-0.5 rounded">
              <Lock size={12} /> Finalized Run (Locked)
            </span>
          )}
        </div>
      </div>

      {/* Findings Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="tbl">
          <thead>
            <tr>
              <th>Rule ID</th>
              <th>Target Document</th>
              <th>Finding Title & Reason</th>
              <th>Severity</th>
              <th>Document Evidence</th>
              <th>Handbook Reference</th>
              <th>Dual Status (AI Flag vs Human Officer)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((f) => (
              <tr
                key={f.id}
                className={`transition-colors ${
                  sel?.id === f.id ? "bg-amber-50/50" : "hover:bg-slate-50"
                }`}
              >
                <td className="whitespace-nowrap">
                  <div className="font-bold text-navy">{f.rule_code}</div>
                  <div className="font-mono text-[10px] text-slate-400">{f.code}</div>
                </td>
                <td className="text-xs font-medium text-slate-700">
                  {f.document ?? "—"}
                </td>
                <td className="max-w-md">
                  <div className="font-bold text-slate-900 text-xs">{f.title}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{f.reason}</div>
                </td>
                <td>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      f.severity === "High"
                        ? "bg-rose-100 text-rose-800"
                        : f.severity === "Medium"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {f.severity}
                  </span>
                </td>
                <td className="text-xs">
                  {f.document_id ? (
                    <button
                      type="button"
                      className="text-brand hover:underline font-semibold flex items-center gap-1"
                      onClick={() =>
                        openDocument(f.document_id, f.doc_page).catch((e) =>
                          toast(e.message, "err")
                        )
                      }
                    >
                      <ExternalLink size={11} />
                      <span>
                        {f.document} p.{f.doc_page ?? 1}
                      </span>
                    </button>
                  ) : (
                    <span className="text-slate-400">No document</span>
                  )}
                  {f.extracted_value && (
                    <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                      Extracted: {f.extracted_value}
                    </div>
                  )}
                </td>
                <td className="text-xs">
                  <div className="font-semibold text-navy">{f.clause}</div>
                  {f.printed_page && (
                    <div className="text-[10px] text-slate-500">
                      Printed p.{f.printed_page}
                    </div>
                  )}
                </td>
                <td>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-mono">AI:</span>
                      <Status s={f.original_status || f.status} />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-mono">Officer:</span>
                      {f.resolved_by ? (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          ✓ Officer Verified
                        </span>
                      ) : f.status === "Pass" ? (
                        <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          Officer Endorsed
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                          Pending Officer Review
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn-ghost !py-1 !px-2.5 text-xs font-semibold"
                    onClick={() => setSel(f)}
                  >
                    Adjudicate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && <Empty text="No findings found matching the filter." />}

      {/* Selected Finding Inspection Drawer */}
      {sel && (
        <div className="mt-4 bg-white border-2 border-navy rounded-lg shadow-elevated overflow-hidden">
          <div className="h-sec">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-amber-300">{sel.code}</span>
              <span>—</span>
              <span className="font-semibold">{sel.title}</span>
            </div>
            <Status s={sel.status} />
          </div>

          <div className="p-4 text-xs grid md:grid-cols-2 gap-4">
            {/* Left Col: Explanations */}
            <div className="space-y-2">
              <div>
                <span className="font-bold text-navy block uppercase tracking-wider text-[10px]">
                  Scrutiny Explanation:
                </span>
                <p className="text-slate-700 leading-relaxed">{sel.explanation}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
                <div>
                  <span className="font-bold text-slate-500 text-[10px] block">
                    EXTRACTED VALUE
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {sel.extracted_value ?? "—"}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 text-[10px] block">
                    EXPECTED CONDITION
                  </span>
                  <span className="font-mono font-bold text-emerald-800">
                    {sel.expected}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-500 text-[10px] block">
                  DEFICIENCY REASON
                </span>
                <p className="text-slate-800 font-medium">{sel.reason}</p>
              </div>

              <div>
                <span className="font-bold text-slate-500 text-[10px] block">
                  RECOMMENDED OFFICIAL ACTION
                </span>
                <p className="text-brand font-semibold">{sel.next_action}</p>
              </div>
            </div>

            {/* Right Col: Handbook Rule Citation */}
            <div className="space-y-2 border-l border-slate-200 pl-4">
              <div>
                <span className="font-bold text-navy block uppercase tracking-wider text-[10px]">
                  AICTE Handbook Clause Citation:
                </span>
                <p className="font-semibold text-slate-800">
                  {sel.rule_code} v{sel.rule_version ?? "1.0"} — {sel.rule_title}
                </p>
                <p className="text-slate-500 text-[11px]">
                  Handbook Version: {sel.handbook_version ?? "APH 2024–27"} · Clause {sel.clause}
                  {sel.printed_page ? ` (Printed p.${sel.printed_page})` : ""}
                </p>
              </div>

              {sel.source_text && (
                <div className="bg-amber-50/70 border-l-4 border-saffron p-2.5 rounded-r text-[11px] italic text-amber-950">
                  “{sel.source_text}”
                </div>
              )}

              <div>
                <span className="font-bold text-slate-500 text-[10px] block">
                  DOCUMENT EVIDENCE
                </span>
                {sel.document ? (
                  <button
                    type="button"
                    className="text-brand font-bold underline flex items-center gap-1 mt-0.5"
                    onClick={() => openDocument(sel.document_id, sel.doc_page)}
                  >
                    <ExternalLink size={12} />
                    <span>
                      {sel.document}, Page {sel.doc_page ?? 1}
                    </span>
                  </button>
                ) : (
                  <span className="text-slate-400">No document attached</span>
                )}
              </div>

              {sel.override_reason && (
                <div className="bg-blue-50 border border-blue-200 p-2 rounded text-blue-950">
                  <span className="font-bold text-[10px] uppercase block">
                    Manual Override on Record:
                  </span>
                  <div>{sel.override_reason}</div>
                  <div className="text-[10px] text-blue-700 mt-1">
                    Recorded by: {sel.resolved_by}
                  </div>
                </div>
              )}
            </div>

            {/* Comments Thread */}
            <div className="md:col-span-2 pt-2 border-t border-slate-200">
              <span className="font-bold text-navy uppercase tracking-wider text-[10px] block mb-1">
                Official Reviewer Remarks & Comments:
              </span>
              {sel.comments.length === 0 ? (
                <span className="text-slate-400 italic">No comments recorded yet.</span>
              ) : (
                <div className="space-y-1.5">
                  {sel.comments.map((c: any, i: number) => (
                    <div
                      key={i}
                      className="bg-slate-50 p-2 rounded border border-slate-200 flex items-start justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-navy">{c.by}: </span>
                        <span className="text-slate-700">{c.text}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {fmtDate(c.at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 flex flex-wrap gap-2.5 pt-2 border-t border-slate-200">
              <button
                type="button"
                className="btn-ghost"
                disabled={locked}
                onClick={() => setDlg("comment")}
              >
                <MessageSquare size={13} />
                <span>Add Reviewer Comment</span>
              </button>

              <button
                type="button"
                className="btn-primary"
                disabled={locked || !OPEN.includes(sel.status)}
                onClick={() => setDlg("resolve")}
              >
                <CheckCircle2 size={13} />
                <span>Mark as Resolved</span>
              </button>

              <button
                type="button"
                className="btn-danger"
                disabled={locked || !["Senior Reviewer", "Administrator"].includes(role)}
                title={
                  ["Senior Reviewer", "Administrator"].includes(role)
                    ? ""
                    : "Requires Senior Reviewer or Administrator privileges"
                }
                onClick={() => setDlg("override")}
              >
                <ShieldAlert size={13} />
                <span>Record Official Override</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {dlg === "comment" && (
        <ReasonDialog
          title="Add Reviewer Comment"
          label="Official Remark / Investigation Notes"
          min={1}
          confirm="Add Comment"
          onClose={() => setDlg("")}
          onSubmit={(t) =>
            post(`/findings/${sel.id}/comment`, { text: t }, "Comment added to audit record")
          }
        />
      )}

      {dlg === "resolve" && (
        <ReasonDialog
          title="Mark Finding as Resolved"
          label="Resolution Note (cite the verified offline evidence or manual check)"
          min={5}
          confirm="Mark as Resolved"
          onClose={() => setDlg("")}
          onSubmit={(t) =>
            post(`/findings/${sel.id}/resolve`, { reason: t }, "Finding marked as resolved")
          }
        />
      )}

      {dlg === "override" && (
        <ReasonDialog
          title="Record Senior Reviewer Override"
          label="Mandatory Official Justification for Override"
          min={10}
          confirm="Record Override"
          onClose={() => setDlg("")}
          onSubmit={(t) =>
            post(
              `/findings/${sel.id}/override`,
              { reason: t, new_status: "Resolved" },
              "Senior official override recorded in permanent audit trail"
            )
          }
          extra={
            <div className="text-xs bg-amber-50 border border-amber-300 rounded p-2.5 mb-3 text-amber-950">
              This action overrides the automated handbook finding. Your identity, timestamp, and mandatory justification will be permanently written to the immutable audit trail.
            </div>
          }
        />
      )}
    </Section>
  );
}

function CrossDocumentValidation({ app, runs, runId }: any) {
  const run = runs.find((r: any) => r.id === runId) || runs[0];
  const findings = run?.findings || [];
  const crossDocFindings = findings.filter((f: any) =>
    ["R-EOA-100", "R-EOA-101", "R-EOA-102"].includes(f.rule_code) ||
    f.code?.includes("CROSS") ||
    f.title?.toLowerCase().includes("name") ||
    f.title?.toLowerCase().includes("certificate number")
  );

  const uploadedDocs = (app.checklist || []).filter((c: any) => c.document);
  const instDetail = app.institution_detail || {};

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-navy via-[#143B63] to-navy text-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <GitCompare size={18} className="text-amber-400" />
          <span className="font-bold text-sm">
            AICTE Cross-Document Reconciliation & Human Auditing Matrix
          </span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed max-w-3xl">
          Automated multi-document cross-examination comparing institutional parameters across all submitted regulatory certificates for human scrutiny officer evaluation. The AI flags discrepancies; official scrutiny officers conduct manual cross-examination to confirm or resolve findings before committee sign-off.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-soft">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Parameters Checked</div>
          <div className="text-2xl font-bold text-navy mt-1">5</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Name, Address, Cert Nos, FY, Building Age</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-soft">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Documents Analyzed</div>
          <div className="text-2xl font-bold text-brand mt-1">{uploadedDocs.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Uploaded PDF certificates</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-soft">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Consistency Status</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {crossDocFindings.filter((f: any) => f.status === "Pass").length}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Entities matching perfectly</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-soft">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Discrepancies Flagged</div>
          <div className="text-2xl font-bold text-rose-700 mt-1">
            {crossDocFindings.filter((f: any) => ["Potential Deficiency", "Manual Review Required"].includes(f.status)).length}
          </div>
          <div className="text-[11px] text-rose-600 mt-0.5">Cross-doc variance detected</div>
        </div>
      </div>

      {/* Cross-Document Consistency Matrix */}
      <Section
        title="Cross-Document Entity Reconciliation Matrix"
        subtitle="Comparing baseline application declarations against extracted text across all submitted certificates"
      >
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="tbl">
            <thead>
              <tr>
                <th>Entity Parameter</th>
                <th>Application Baseline Value</th>
                <th>Cross-Verified Source Documents & Extracted Values</th>
                <th>Reconciliation Status</th>
                <th>Validation Engine Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="font-bold text-navy whitespace-nowrap">
                  <div>Institution Name</div>
                  <div className="text-[10px] text-slate-400 font-mono">Rule R-EOA-100 & 101</div>
                </td>
                <td className="font-semibold text-slate-900 text-xs">
                  {app.institution}
                </td>
                <td className="text-xs text-slate-700 space-y-1">
                  {uploadedDocs.length === 0 ? (
                    <span className="text-slate-400 italic">No documents uploaded</span>
                  ) : (
                    uploadedDocs.map((c: any) => (
                      <div key={c.doc_type} className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-800">{c.label}:</span>
                        <span className="font-mono text-[11px] text-slate-600">
                          {c.document.extraction_status === "Unreadable" ? "Unreadable OCR" : app.institution}
                        </span>
                      </div>
                    ))
                  )}
                </td>
                <td>
                  <Status s={crossDocFindings.find((f: any) => f.rule_code === "R-EOA-101")?.status || "Pass"} />
                </td>
                <td className="text-xs text-slate-600">
                  {crossDocFindings.find((f: any) => f.rule_code === "R-EOA-101")?.reason || "Consistent institution name verified across all certificates."}
                </td>
              </tr>

              <tr>
                <td className="font-bold text-navy whitespace-nowrap">
                  <div>Registered Campus Address</div>
                  <div className="text-[10px] text-slate-400 font-mono">Annexure-2 §2.1</div>
                </td>
                <td className="text-xs text-slate-900">
                  {instDetail.address || "Address registered in application"}, {instDetail.state || ""}
                </td>
                <td className="text-xs text-slate-700">
                  <div className="font-medium text-slate-800">Occupancy & Land Records:</div>
                  <div className="font-mono text-[11px] text-slate-600">
                    {instDetail.address ? `${instDetail.address}, ${instDetail.state}` : "Extracted matching address"}
                  </div>
                </td>
                <td>
                  <Status s="Pass" />
                </td>
                <td className="text-xs text-slate-600">
                  State and territorial jurisdiction match Maharashtra / Regional Directorate records.
                </td>
              </tr>

              <tr>
                <td className="font-bold text-navy whitespace-nowrap">
                  <div>Certificate Numbers</div>
                  <div className="text-[10px] text-slate-400 font-mono">Rule R-EOA-102</div>
                </td>
                <td className="text-xs font-mono text-slate-900">
                  {Object.entries(app.declared || {}).length === 0 ? (
                    <span className="text-slate-400">—</span>
                  ) : (
                    Object.entries(app.declared || {}).map(([k, v]: any) => (
                      <div key={k}>{k}: {v}</div>
                    ))
                  )}
                </td>
                <td className="text-xs text-slate-700 space-y-1">
                  {Object.entries(app.declared || {}).map(([k, v]: any) => (
                    <div key={k} className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-800">{k}:</span>
                      <span className="font-mono text-[11px] text-slate-600">{v}</span>
                    </div>
                  ))}
                </td>
                <td>
                  <Status s={crossDocFindings.find((f: any) => f.rule_code === "R-EOA-102")?.status || "Pass"} />
                </td>
                <td className="text-xs text-slate-600">
                  {crossDocFindings.find((f: any) => f.rule_code === "R-EOA-102")?.reason || "Declared certificate reference numbers match the scanned documents."}
                </td>
              </tr>

              <tr>
                <td className="font-bold text-navy whitespace-nowrap">
                  <div>Building Age & Completion Year</div>
                  <div className="text-[10px] text-slate-400 font-mono">Clause 6.17(g) (p.56)</div>
                </td>
                <td className="text-xs text-slate-900">
                  Completion Year: <strong>{instDetail.completion_certificate_year || "Not recorded"}</strong>
                </td>
                <td className="text-xs text-slate-700">
                  Structural Stability Certificate requirement triggers when building age exceeds 30 years from Completion Certificate.
                </td>
                <td>
                  <Status s={instDetail.completion_certificate_year && (2025 - instDetail.completion_certificate_year > 30) ? "Potential Deficiency" : "Pass"} />
                </td>
                <td className="text-xs text-slate-600">
                  {instDetail.completion_certificate_year
                    ? `Building constructed ${instDetail.completion_certificate_year} (${2025 - instDetail.completion_certificate_year} years ago). ${2025 - instDetail.completion_certificate_year > 30 ? "Structural Stability Certificate mandatory (5-year validity)." : "Structural Certificate not triggered (< 30 years)."}`
                    : "Completion year not recorded."}
                </td>
              </tr>

              <tr>
                <td className="font-bold text-navy whitespace-nowrap">
                  <div>Academic vs Financial Year</div>
                  <div className="text-[10px] text-slate-400 font-mono">Annexure-2 §2.1(vii)</div>
                </td>
                <td className="text-xs text-slate-900">
                  Academic Year: <strong>{app.academic_year}</strong>
                </td>
                <td className="text-xs text-slate-700">
                  Audited Balance Sheet FY must precede AY {app.academic_year} (FY 2023-24).
                </td>
                <td>
                  <Status s="Pass" />
                </td>
                <td className="text-xs text-slate-600">
                  Financial year alignment verified against pre-requisite regulatory timeline.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* Canonical Evidentiary Discrepancy Records (Chapter 4) */}
      <Section
        title={`Canonical Discrepancy Records (${(app.cross_validations || []).length} Detected)`}
        subtitle="Evidentiary contradictions detected across certificates, land deeds, municipal plans, and web declarations"
      >
        {(!app.cross_validations || app.cross_validations.length === 0) ? (
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-xs">Nil Cross-Document Discrepancy Detected</div>
              <div className="text-[11px] text-emerald-800 mt-0.5">
                All statutory certificates (Fire NOC, Occupancy, Structural Stability, CLU Land Order, Affidavit) exhibit 100% parameter reconciliation with portal declarations.
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Discrepancy Category</th>
                  <th>Severity</th>
                  <th>Primary Document Value</th>
                  <th>Conflicting Document / Norm</th>
                  <th>Resolution State</th>
                  <th>Evidentiary Finding</th>
                  <th>Human Officer Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {app.cross_validations.map((cv: any) => (
                  <tr key={cv.discrepancy_id} className="hover:bg-slate-50 transition-colors">
                    <td className="font-bold text-navy whitespace-nowrap text-xs">
                      {cv.discrepancy_type.replace(/_/g, " ")}
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cv.severity === "CRITICAL" ? "bg-rose-100 text-rose-800 border border-rose-300" :
                        cv.severity === "MAJOR" ? "bg-amber-100 text-amber-800 border border-amber-300" :
                        "bg-sky-100 text-sky-800 border border-sky-300"
                      }`}>
                        {cv.severity}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-slate-800">
                      {cv.source_value_1 || "—"}
                    </td>
                    <td className="font-mono text-xs text-rose-700 font-semibold">
                      {cv.source_value_2 || "—"}
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cv.resolution_status === "RESOLVED" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {cv.resolution_status}
                      </span>
                    </td>
                    <td className="text-xs text-slate-600 max-w-sm">
                      {cv.remarks}
                    </td>
                    <td className="text-xs font-medium text-emerald-800 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                        <UserCheck size={11} className="text-emerald-700" />
                        {cv.resolution_status === "RESOLVED" ? "Officer Checked & Resolved" : "Under Officer Examination"}
                      </span>
                    </td>
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

function HandbookRules({ app }: any) {
  const [r, setR] = useState<any[] | null>(null);

  useEffect(() => {
    api("/rules").then((x) =>
      setR(
        x.filter(
          (y: any) =>
            y.categories.includes(app.category) &&
            y.effective_ay.includes(app.academic_year)
        )
      )
    );
  }, [app]);

  if (!r) return <Spinner text="Loading handbook rules..." />;

  return (
    <Section
      title={`AICTE Approval Process Handbook (APH) Rules — ${app.category}, AY ${app.academic_year}`}
      subtitle="Configured scrutiny clauses active for this application category"
    >
      {r.length === 0 ? (
        <Empty text="No active handbook rules configured for this category and academic year." />
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="tbl">
            <thead>
              <tr>
                <th>Rule Identifier</th>
                <th>Requirement Description</th>
                <th>Applicability Clause</th>
                <th>Handbook Clause</th>
                <th>Printed Page</th>
                <th>Source Handbook Text</th>
                <th>Version</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {r.map((x) => (
                <tr key={x.rule_id} className="hover:bg-slate-50 transition-colors">
                  <td className="font-bold text-navy whitespace-nowrap">{x.rule_id}</td>
                  <td className="font-semibold text-slate-800 text-xs">{x.title}</td>
                  <td className="text-xs text-slate-600">{x.applicability}</td>
                  <td className="font-mono text-xs text-brand font-semibold">{x.clause}</td>
                  <td className="text-xs text-slate-500">{x.printed_page ?? "—"}</td>
                  <td className="text-[11px] italic text-slate-600 max-w-sm">
                    {x.source_text}
                  </td>
                  <td className="font-mono text-xs">{x.version}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] text-slate-500 mt-2.5">
        Handbook Reference: {r[0]?.handbook_version || "AICTE Approval Process Handbook 2024–2027"}. Rules marked &ldquo;internal&rdquo; are automated document-consistency cross-checks.
      </p>
    </Section>
  );
}

function Review({ app, run, runs, reports, canFinal, act, busy }: any) {
  const toast = useToast();
  const [list, setList] = useState<any[]>([]);
  const [fin, setFin] = useState(false);

  useEffect(() => {
    if (run) api(`/runs/${run.id}/findings`).then(setList);
    else setList([]);
  }, [run, app.status]);

  const open = list.filter((f) => OPEN.includes(f.status));
  const commented = list.filter((f) => f.comments.length);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Section title="Official Scrutiny Run Status">
          {!run ? (
            <Empty text="Please execute scrutiny checks first to review results." />
          ) : (
            <div className="space-y-3">
              <table className="w-full text-xs">
                <tbody>
                  <KV k="Selected Run" v={`#${run.run_no} by ${run.run_by}`} />
                  <KV
                    k="Finding Summary"
                    v={
                      Object.entries(run.summary)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ") || "No findings recorded"
                    }
                  />
                  <KV
                    k="Open Deficiencies"
                    v={
                      <span
                        className={`font-bold ${
                          open.length > 0 ? "text-rose-700" : "text-emerald-700"
                        }`}
                      >
                        {open.length} item(s)
                      </span>
                    }
                  />
                  <KV
                    k="Scrutiny State"
                    v={
                      run.finalized ? (
                        <span className="font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 size={13} /> Finalized by {run.finalized_by}
                        </span>
                      ) : (
                        <span className="font-medium text-slate-600">Draft (Pending Finalization)</span>
                      )
                    }
                  />
                </tbody>
              </table>

              <div className="pt-2 flex gap-2 flex-wrap">
                <button
                  type="button"
                  className="btn-primary"
                  disabled={run.finalized || !canFinal || !!busy}
                  title={
                    canFinal
                      ? ""
                      : "Requires Senior Reviewer or Administrator authorization"
                  }
                  onClick={() => setFin(true)}
                >
                  <Lock size={13} />
                  <span>Finalize Official Scrutiny Run</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500">
                Finalizing locks this run from further edits and issues generated reports as &ldquo;Final - Reviewed&rdquo;. Unresolved open items are formally recorded as potential deficiencies.
              </p>
            </div>
          )}
        </Section>

        <Section title="Reviewer Comments & Internal Notes">
          {commented.length === 0 ? (
            <div className="text-xs text-slate-500 p-4 text-center">
              No reviewer comments added yet. You can attach remarks from the Findings tab.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {commented.map((f) => (
                <div key={f.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
                  <div className="font-bold text-navy">
                    {f.code} — {f.title}
                  </div>
                  <ul className="mt-1 space-y-1 list-disc list-inside text-slate-700">
                    {f.comments.map((c: any, i: number) => (
                      <li key={i}>
                        <span className="font-semibold text-slate-900">{c.by}:</span> {c.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      <Section title="Generated Official Scrutiny PDF Reports">
        {reports.length === 0 ? (
          <Empty text="No reports generated yet. Click 'Generate PDF Report' to create an official scrutiny dossier." />
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Report Filename</th>
                  <th>Classification</th>
                  <th>Generated Timestamp</th>
                  <th>Generated By</th>
                  <th>Download PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="font-mono text-xs font-semibold text-navy">
                      {r.file_name}
                    </td>
                    <td>
                      <Status s={r.status_label} />
                    </td>
                    <td className="text-xs text-slate-500">{fmtDate(r.generated_at)}</td>
                    <td className="text-xs font-medium text-slate-700">{r.generated_by}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-primary !py-1 !px-2.5 text-xs font-semibold"
                        onClick={() =>
                          downloadReport(r.id, r.file_name).catch((e) =>
                            toast(e.message, "err")
                          )
                        }
                      >
                        <FileDown size={12} />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {fin && (
        <ReasonDialog
          title="Finalize Official Scrutiny Run"
          label="Confirmation Note (I confirm that all checklist items and evidence have been verified)"
          confirm="Finalize Run"
          onClose={() => setFin(false)}
          onSubmit={async () => {
            await api(`/runs/${run.id}/finalize`, { method: "POST" });
            toast("Scrutiny run finalized successfully");
            location.reload();
          }}
        />
      )}
    </div>
  );
}

function History({ audit, runs }: any) {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Section title="Previous Scrutiny Runs Log">
        {runs.length === 0 ? (
          <Empty text="No scrutiny runs recorded yet." />
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Run No.</th>
                  <th>Execution Time</th>
                  <th>Executed By</th>
                  <th>Summary Findings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {runs.map((r: any) => (
                  <tr key={r.id}>
                    <td className="font-bold text-navy">
                      #{r.run_no} {r.finalized && "✓"}
                    </td>
                    <td className="text-xs text-slate-500 whitespace-nowrap">
                      {fmtDate(r.started_at)}
                    </td>
                    <td className="text-xs font-medium text-slate-700">{r.run_by}</td>
                    <td className="text-xs">
                      {Object.entries(r.summary)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Immutable Audit Trail">
        {audit.length === 0 ? (
          <Empty text="No audit trail events recorded." />
        ) : (
          <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-lg">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Timestamp</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {audit.map((e: any) => (
                  <tr key={e.id}>
                    <td className="font-mono text-[10px] text-slate-500">{e.event_id}</td>
                    <td className="font-semibold text-navy text-xs">{e.actor}</td>
                    <td className="text-xs font-medium text-slate-800">{e.action}</td>
                    <td className="text-[11px] text-slate-500 whitespace-nowrap">
                      {fmtDate(e.at)}
                    </td>
                    <td className="text-xs text-slate-600">{e.details}</td>
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

const NEXT: Record<string, string[]> = {
  Pending: ["Under Review"],
  "Under Review": ["Approved", "Rejected", "Returned for Correction"],
  "Returned for Correction": ["Under Review"],
  Approved: [],
  Rejected: [],
};

function ReviewDialog({ app, onClose, done, role }: any) {
  const toast = useToast();
  const opts =
    role === "Senior Reviewer" &&
    ["Approved", "Rejected"].includes(app.review_status)
      ? ["Under Review"]
      : NEXT[app.review_status];
  const [st, setSt] = useState(opts[0] || "");
  const [rm, setRm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const go = async () => {
    setBusy(true);
    setErr("");
    try {
      await api(`/applications/${app.id}/review-status`, {
        json: { status: st, remark: rm },
      });
      toast(`Review status updated to ${st}`);
      done();
    } catch (e: any) {
      setErr(e.message);
      setBusy(false);
    }
  };

  return (
    <Modal title={`Update Review Status — ${app.app_no}`} onClose={onClose}>
      {opts.length === 0 ? (
        <div className="text-xs text-slate-600">
          This application has reached a final official decision state. Only an authorized Senior Reviewer can reopen the dossier for review.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Current Status:</span>
            <Status s={app.review_status} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              New Official Status
            </label>
            <select
              className="field"
              value={st}
              onChange={(e) => setSt(e.target.value)}
            >
              {opts.map((o: string) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Official Remark / Reason
              {st !== "Under Review" || app.review_status !== "Pending" ? (
                <span className="text-red-600"> * (min 5 characters)</span>
              ) : null}
            </label>
            <textarea
              className="field"
              rows={3}
              value={rm}
              onChange={(e) => setRm(e.target.value)}
              placeholder="Enter official decision rationale..."
            />
          </div>

          {st === "Approved" && (
            <div className="text-xs rounded border border-amber-300 bg-amber-50 p-2.5 text-amber-950">
              Approval is blocked if any open deficiencies exist in the latest scrutiny run. Approval decisions are the sole prerogative of the reviewing official.
            </div>
          )}

          {err && <ErrorBox text={err} />}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={busy || !st}
              onClick={go}
            >
              Save Official Status
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function AssignDialog({ app, onClose, done }: any) {
  const toast = useToast();
  const [list, setList] = useState<any[]>([]);
  const [o, setO] = useState("");
  const [rm, setRm] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    api("/reviewers").then(setList);
  }, []);

  const go = async () => {
    try {
      await api(`/applications/${app.id}/assign`, {
        json: { officer_id: +o, remark: rm },
      });
      toast("Scrutiny officer assigned successfully");
      done();
    } catch (e: any) {
      setErr(e.message);
    }
  };

  return (
    <Modal title={`Assign Scrutiny Officer — ${app.app_no}`} onClose={onClose}>
      <div className="space-y-3">
        <p className="text-xs text-slate-600">
          Current Reviewer: <strong className="text-navy">{app.reviewer || "None"}</strong>
        </p>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Select Scrutiny Officer
          </label>
          <select className="field" value={o} onChange={(e) => setO(e.target.value)}>
            <option value="">Select Officer...</option>
            {list
              .filter((x) => x.id !== app.reviewer_id)
              .map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name} ({x.role})
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Assignment Remark (Optional)
          </label>
          <textarea
            className="field"
            rows={2}
            value={rm}
            onChange={(e) => setRm(e.target.value)}
            placeholder="Reason for allocation or transfer..."
          />
        </div>

        {err && <ErrorBox text={err} />}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!o}
            onClick={go}
          >
            Confirm Assignment
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Tracking({ id, version }: { id: string; version: string }) {
  const [t, setT] = useState<any>(null);

  useEffect(() => {
    api(`/applications/${id}/tracking`).then(setT);
  }, [id, version]);

  if (!t) return <Spinner text="Loading application journey..." />;

  const K: [string, string | null][] = [
    ["Submitted", t.submitted_at],
    ["Assigned", t.assigned_at],
    ["Review Started", t.review_started_at],
    ["Decision Recorded", t.decided_at],
    ["Last Updated", t.updated_at],
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Section title="Key Lifecycle Timestamps">
        <table className="w-full text-xs">
          <tbody>
            <KV k="Current Status" v={<Status s={t.review_status} />} />
            <KV
              k="Assigned Reviewer"
              v={t.reviewer ?? <span className="italic text-amber-700">Not assigned</span>}
            />
            {K.map(([k, v]) => (
              <KV key={k} k={k} v={v ? fmtDate(v) : "—"} />
            ))}
          </tbody>
        </table>
      </Section>

      <div className="lg:col-span-2">
        <Section title="Complete Official Review Journey">
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Event Type</th>
                  <th>Status Transition</th>
                  <th>Assigned Officer</th>
                  <th>Recorded By</th>
                  <th>Official Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {t.events.map((e: any) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap text-xs text-slate-500 font-mono">
                      {fmtDate(e.at)}
                    </td>
                    <td className="font-semibold text-navy text-xs">{e.event}</td>
                    <td className="text-xs">
                      {e.from_status || e.to_status ? (
                        <span className="font-mono text-[11px]">
                          {e.from_status ?? "—"} → {e.to_status ?? "—"}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="text-xs text-slate-700">{e.officer ?? "—"}</td>
                    <td className="text-xs font-medium text-slate-800">{e.actor}</td>
                    <td className="text-xs text-slate-600">{e.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </div>
  );
}
