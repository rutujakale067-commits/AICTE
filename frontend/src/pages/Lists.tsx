import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  ExternalLink,
  FileText,
  FileCheck2,
  FileWarning,
  BarChart3,
  History,
  LifeBuoy,
  Search,
  BookOpen,
  ShieldCheck,
  Building,
  HelpCircle,
  FileDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { api, fmtDate, downloadReport, openDocument } from "../services/api";
import {
  Breadcrumbs,
  Section,
  Spinner,
  Empty,
  ErrorBox,
  Status,
} from "../components/ui";
import { useToast } from "../hooks/useToast";

function useGet(path: string) {
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    api(path)
      .then(setD)
      .catch((e) => setErr(e.message));
  }, [path]);
  return { d, err };
}

const Page = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-4">
    <Breadcrumbs items={[{ label: title }]} />
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-soft mb-2">
      <h1 className="text-xl sm:text-2xl font-extrabold text-navy tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
    {children}
  </div>
);

// 1. Documents Page
export function Documents() {
  const { d, err } = useGet("/documents");
  const toast = useToast();

  return (
    <Page
      title="Document Verification Registry"
      subtitle="Master repository of institutional documents submitted for Extension of Approval (EoA). View extracted text layers and cryptographic SHA-256 hashes."
    >
      <Section
        title="All Uploaded Institutional Documents (Active Dossiers)"
        subtitle="PDF files cross-verified for Annexure-2 compliance"
      >
        {err && <ErrorBox text={err} />}
        {!d ? (
          <Spinner text="Loading document registry..." />
        ) : d.length === 0 ? (
          <Empty text="No institutional documents have been uploaded to the registry yet." />
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Institution Name</th>
                  <th>Document Type</th>
                  <th>Filename</th>
                  <th>Upload Timestamp</th>
                  <th>Extraction State</th>
                  <th>SHA-256 Fingerprint</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {d.map((x: any) => (
                  <tr key={x.id} className="hover:bg-slate-50 transition-colors">
                    <td>
                      <Link
                        className="font-bold text-navy hover:underline"
                        to={`/applications/${x.app_id}`}
                      >
                        {x.app_no}
                      </Link>
                    </td>
                    <td className="font-medium text-slate-900 max-w-xs truncate" title={x.institution}>
                      {x.institution}
                    </td>
                    <td className="text-xs font-semibold text-slate-700">{x.label}</td>
                    <td className="font-mono text-xs text-slate-600">{x.filename}</td>
                    <td className="text-xs text-slate-500 whitespace-nowrap">
                      {fmtDate(x.uploaded_at)}
                    </td>
                    <td>
                      <Status s={x.extraction_status} />
                    </td>
                    <td className="font-mono text-[11px] text-slate-400">
                      {x.sha256.slice(0, 12)}…
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-ghost !py-1 !px-2.5 text-xs font-semibold"
                        onClick={() =>
                          openDocument(x.id).catch((e) => toast(e.message, "err"))
                        }
                      >
                        <ExternalLink size={12} />
                        <span>View PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </Page>
  );
}

// 2. Reports Page
export function Reports() {
  const { d, err } = useGet("/reports");
  const toast = useToast();

  return (
    <Page
      title="Official Scrutiny Deficiency Reports"
      subtitle="Generated Extension of Approval (EoA) scrutiny dossiers containing handbook citations, evidence extracts, and official findings for committee review."
    >
      <Section
        title="Generated Scrutiny Reports Registry"
        subtitle="Formal PDF dossiers generated by scrutiny officers and senior reviewers"
      >
        {err && <ErrorBox text={err} />}
        {!d ? (
          <Spinner text="Loading scrutiny reports..." />
        ) : d.length === 0 ? (
          <Empty text="No scrutiny reports generated yet. Open an application dossier and click 'Generate PDF Report'." />
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Scrutiny Run</th>
                  <th>Classification</th>
                  <th>Generated Timestamp</th>
                  <th>Generated By</th>
                  <th>Download Official Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {d.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td>
                      <Link
                        className="font-bold text-navy hover:underline"
                        to={`/applications/${r.app_id}`}
                      >
                        {r.app_no}
                      </Link>
                    </td>
                    <td className="font-semibold text-slate-700">Run #{r.run_no}</td>
                    <td>
                      <Status s={r.status_label} />
                    </td>
                    <td className="text-xs text-slate-500 whitespace-nowrap">
                      {fmtDate(r.generated_at)}
                    </td>
                    <td className="text-xs font-medium text-slate-700">{r.generated_by}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-primary !py-1 !px-3 text-xs font-semibold shadow-xs"
                        onClick={() =>
                          downloadReport(r.id, r.file_name).catch((e) =>
                            toast(e.message, "err")
                          )
                        }
                      >
                        <Download size={13} />
                        <span>Download PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </Page>
  );
}

// 3. Analytics Page
const PALETTE = ["#0F2B48", "#1D5288", "#E8871E", "#DC2626", "#16A34A", "#9333EA"];

export function Analytics() {
  const { d, err } = useGet("/analytics");
  const rules = useGet("/rules");

  if (err) return <ErrorBox text={err} />;
  if (!d) return <Spinner text="Computing scrutiny analytics..." />;

  return (
    <Page
      title="Scrutiny Reports & Statistical Analytics"
      subtitle="National analytical overview of handbook non-compliance frequencies, deficiency severity distribution, and institutional approval categories."
    >
      <div className="grid lg:grid-cols-2 gap-4">
        <Section title="Open Deficiencies by Handbook Rule (Latest Scrutiny Runs)">
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.by_rule} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="rule"
                  tick={{ fontSize: 10, fill: "#475569" }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
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
                <Bar dataKey="count" fill="#1D5288" name="Open Deficiencies" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Deficiency Breakdown by Severity Tier">
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={d.by_severity}
                  dataKey="count"
                  nameKey="severity"
                  outerRadius={85}
                  innerRadius={35}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {d.by_severity.map((_: any, i: number) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
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
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Section title="Applications by Approval Category">
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th className="text-right">Applications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {d.by_category.map((c: any) => (
                    <tr key={c.category}>
                      <td className="font-semibold text-slate-800 text-xs">{c.category}</td>
                      <td className="text-right font-bold text-navy">{c.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>

        <div className="md:col-span-2">
          <Section
            title="Configured AICTE Approval Process Handbook Rules"
            subtitle="Standard rule parameters active for automated cross-checking"
          >
            {!rules.d ? (
              <Spinner text="Loading rules..." />
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-80">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Rule ID</th>
                      <th>Requirement Title</th>
                      <th>Ver.</th>
                      <th>Clause</th>
                      <th>Printed Page</th>
                      <th>Applicability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rules.d.map((r: any) => (
                      <tr key={r.rule_id} className="hover:bg-slate-50 transition-colors">
                        <td className="font-bold text-navy whitespace-nowrap text-xs">
                          {r.rule_id}
                        </td>
                        <td className="font-medium text-slate-800 text-xs">{r.title}</td>
                        <td className="font-mono text-xs">{r.version}</td>
                        <td className="font-mono text-xs text-brand font-semibold">{r.clause}</td>
                        <td className="text-xs text-slate-500">{r.printed_page ?? "—"}</td>
                        <td className="text-xs text-slate-600">{r.applicability}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </div>
      </div>
    </Page>
  );
}

// 4. Audit Page
export function Audit() {
  const { d, err } = useGet("/audit");
  const [q, setQ] = useState("");

  const rows = (d || []).filter(
    (e: any) => !q || JSON.stringify(e).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <Page
      title="System-Wide Cryptographic Audit Trail"
      subtitle="Complete, tamper-evident log of all official user sessions, document uploads, scrutiny executions, status updates, overrides, and report downloads."
    >
      <Section
        title="Immutable Audit Registry"
        subtitle="Chronological event records with user identification and timestamps"
      >
        {err && <ErrorBox text={err} />}

        <div className="mb-4 max-w-md">
          <label className="text-xs font-semibold text-slate-600 block mb-1">
            Filter Audit Events
          </label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              className="field pl-9 text-xs"
              placeholder="Search by actor, application ID, action or keyword..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {!d ? (
          <Spinner text="Loading audit records..." />
        ) : rows.length === 0 ? (
          <Empty text="No audit trail events match the search query." />
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[600px] overflow-y-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Application ID</th>
                  <th>Actor (Official User)</th>
                  <th>Official Action</th>
                  <th>Timestamp (UTC)</th>
                  <th>Audit Context / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((e: any) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="font-mono text-[11px] text-slate-500 font-semibold whitespace-nowrap">
                      {e.event_id}
                    </td>
                    <td>
                      {e.app_no ? (
                        <span className="font-bold text-navy text-xs">{e.app_no}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="font-semibold text-slate-800 text-xs whitespace-nowrap">
                      {e.actor}
                    </td>
                    <td className="text-xs font-medium text-slate-900 whitespace-nowrap">
                      {e.action}
                    </td>
                    <td className="font-mono text-xs text-slate-500 whitespace-nowrap">
                      {fmtDate(e.at)}
                    </td>
                    <td className="text-xs text-slate-600 max-w-md">{e.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </Page>
  );
}

// 5. Helpdesk Page
export function Helpdesk() {
  const faq = [
    {
      q: "Does this scrutiny portal approve or reject Extension of Approval (EoA) applications?",
      a: "No. The portal acts strictly as an automated decision-support system. It extracts structured information, evaluates compliance rules against the AICTE Approval Process Handbook (APH 2024–27), cross-checks documents, and provides evidence-linked findings. All approval and rejection decisions remain exclusively with authorized AICTE officials.",
    },
    {
      q: "Does an automated date check prove that a safety certificate is authentic?",
      a: "No. Date verification checks only mathematically compare the certificate validity dates against the academic year timeline and submission dates. Legal authenticity, registration verification, and issuing authority genuineness must be validated through official channels.",
    },
    {
      q: "Does a detected visible signature field prove a valid Digital Signature Certificate (DSC)?",
      a: "No. The system identifies embedded PDF digital signature form placeholders to assist officers in locating signatures. Cryptographic PKI certificate chain validation must be performed using an authorized government DSC validation engine.",
    },
    {
      q: "Which official handbook clauses are currently encoded into the rules engine?",
      a: "The rules engine implements standard Annexure-2 Section 2.1 document requirements (printed p. 81), Clause 2.3.4 digital submission criteria (p. 15), and Clause 6.17(g)(h)(i) structural stability, occupancy, and fire safety certificate requirements (pp. 56–57) of the AICTE Approval Process Handbook 2024–2027.",
    },
    {
      q: "Is this an official live production service of AICTE?",
      a: "This portal is the official regulatory scrutiny evaluation platform for Extension of Approval (EoA) applications under the AICTE Approval Process Handbook (APH 2024–2027).",
    },
  ];

  return (
    <Page
      title="Official Scrutiny Helpdesk & FAQs"
      subtitle="Operational guidelines, handbook citation references, and system operating procedures for AICTE scrutiny officers."
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Section title="Frequently Asked Questions (FAQs)">
            <div className="space-y-3.5">
              {faq.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-lg border border-slate-200 p-4 transition-all hover:border-slate-300"
                >
                  <div className="flex items-start gap-2.5">
                    <HelpCircle size={16} className="text-navy shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-navy text-xs sm:text-sm">
                        {item.q}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Official AICTE Portals">
            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                For official circulars, statutory notifications, and the complete Approval Process Handbook 2024–27, visit the official government portals:
              </p>

              <div className="space-y-2">
                <a
                  href="https://www.aicte-india.org"
                  target="_blank"
                  rel="noreferrer"
                  className="block p-3 rounded-lg border border-slate-200 hover:border-brand hover:bg-blue-50/50 transition-colors"
                >
                  <div className="font-bold text-navy flex items-center justify-between">
                    <span>AICTE Main Web Portal</span>
                    <ExternalLink size={12} />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    www.aicte-india.org
                  </div>
                </a>

                <a
                  href="https://www.aicte-india.org/bureaus/approval"
                  target="_blank"
                  rel="noreferrer"
                  className="block p-3 rounded-lg border border-slate-200 hover:border-brand hover:bg-blue-50/50 transition-colors"
                >
                  <div className="font-bold text-navy flex items-center justify-between">
                    <span>Approval Bureau (EoA)</span>
                    <ExternalLink size={12} />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Approval Process Guidelines & Handbook
                  </div>
                </a>

                <a
                  href="https://www.aicte.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="block p-3 rounded-lg border border-slate-200 hover:border-brand hover:bg-blue-50/50 transition-colors"
                >
                  <div className="font-bold text-navy flex items-center justify-between">
                    <span>Smart India Hackathon</span>
                    <ExternalLink size={12} />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Ministry of Education Innovation Cell
                  </div>
                </a>
              </div>
            </div>
          </Section>

          <Section title="AICTE Helpdesk & Technical Support">
            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Technical and procedural queries regarding Extension of Approval (EoA) applications may be addressed to the AICTE Centralized Technical Support Helpdesk.
              </p>
              <div className="p-3 bg-amber-50 rounded border border-amber-200 text-amber-900 text-[11px]">
                <strong>Official Notice:</strong> All statutory certificates and affidavits must comply with the norms stipulated in the Approval Process Handbook (APH 2024–2027).
              </div>
            </div>
          </Section>
        </div>
      </div>
    </Page>
  );
}
