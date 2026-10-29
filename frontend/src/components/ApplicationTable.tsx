import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  RotateCcw,
  Filter,
} from "lucide-react";
import { api, fmtDate } from "../services/api";
import { Status, Spinner, Empty, ErrorBox, Pager, Progress } from "./ui";
import { AppRow } from "../types";

const COLS: [string, string][] = [
  ["app_no", "Application ID"],
  ["institution", "Institution Name"],
  ["code", "Inst. Code"],
  ["academic_year", "AY"],
  ["compliance_score", "AI Pre-Score"],
  ["reviewer", "Human Officer"],
  ["review_status", "Human Review"],
  ["status", "Scrutiny Status"],
  ["completeness", "Doc Completeness"],
  ["category", "Category"],
  ["submitted_on", "Submitted"],
  ["updated_at", "Last Updated"],
];

export default function ApplicationTable({
  defaultSize = 10,
  version = 0,
}: {
  defaultSize?: number;
  version?: number;
}) {
  const nav = useNavigate();
  const [f, setF] = useState({
    q: "",
    year: "",
    category: "",
    status: "",
    reviewer: "",
    review_status: "",
    date_from: "",
    date_to: "",
  });
  const [sort, setSort] = useState("updated_at");
  const [dir, setDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(defaultSize);
  const [data, setData] = useState<any>(null);
  const [opts, setOpts] = useState<any>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api("/filters")
      .then(setOpts)
      .catch((e) => setErr(e.message));
  }, [version]);

  useEffect(() => {
    const p = new URLSearchParams({
      ...f,
      sort,
      dir,
      page: String(page),
      size: String(size),
    });
    const t = setTimeout(
      () =>
        api("/applications?" + p)
          .then((d) => {
            setData(d);
            setErr("");
          })
          .catch((e) => setErr(e.message)),
      200
    );
    return () => clearTimeout(t);
  }, [f, sort, dir, page, size, version]);

  const setFilterVal = (k: string, v: string) => {
    setF({ ...f, [k]: v });
    setPage(1);
  };

  const clearFilters = () => {
    setF({
      q: "",
      year: "",
      category: "",
      status: "",
      reviewer: "",
      review_status: "",
      date_from: "",
      date_to: "",
    });
    setPage(1);
  };

  const sel = (k: string, label: string, list: string[] = []) => (
    <label className="text-xs font-semibold text-slate-600 block">
      {label}
      <select
        className="field mt-1 text-xs"
        value={(f as any)[k]}
        onChange={(e) => setFilterVal(k, e.target.value)}
      >
        <option value="">All {label}s</option>
        {list.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );

  const hasActiveFilters = Object.values(f).some((v) => v !== "");

  return (
    <div className="space-y-3.5">
      {/* Filter Toolbar */}
      <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Filter size={13} className="text-navy" />
            <span>Search & Application Filters</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={11} />
              Reset filters
            </button>
          )}
        </div>

        <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 items-end">
          {/* Search Box */}
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-600 block">
              Search by Application ID or Institution
              <div className="relative mt-1">
                <Search
                  size={14}
                  className="absolute left-2.5 top-2.5 text-slate-400"
                />
                <input
                  className="field pl-8 text-xs"
                  placeholder="e.g. DEMO-EOA-001, Polytechnic..."
                  value={f.q}
                  onChange={(e) => setFilterVal("q", e.target.value)}
                />
              </div>
            </label>
          </div>

          {sel("review_status", "Review Status", opts?.review_statuses)}
          {sel("status", "Scrutiny Status", opts?.statuses)}
          {sel("category", "Category", opts?.categories)}
          {sel("reviewer", "Officer", opts?.reviewers)}

          <label className="text-xs font-semibold text-slate-600 block">
            Submitted From
            <input
              type="date"
              className="field mt-1 text-xs"
              value={f.date_from}
              onChange={(e) => setFilterVal("date_from", e.target.value)}
            />
          </label>

          <label className="text-xs font-semibold text-slate-600 block">
            Submitted To
            <input
              type="date"
              className="field mt-1 text-xs"
              value={f.date_to}
              onChange={(e) => setFilterVal("date_to", e.target.value)}
            />
          </label>
        </div>
      </div>

      {err && <ErrorBox text={err} />}

      {!data ? (
        <Spinner text="Loading applications..." />
      ) : data.items.length === 0 ? (
        <Empty text="No applications match the selected search or filter criteria." />
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  {COLS.map(([k, l]) => {
                    const isSorted = sort === k;
                    return (
                      <th key={k} aria-sort={isSorted ? (dir === "asc" ? "ascending" : "descending") : "none"}>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 group hover:text-navy transition-colors"
                          onClick={() => {
                            if (sort === k) setDir(dir === "asc" ? "desc" : "asc");
                            else {
                              setSort(k);
                              setDir("asc");
                            }
                          }}
                        >
                          <span>{l}</span>
                          {isSorted ? (
                            dir === "asc" ? (
                              <ArrowUp size={12} className="text-navy" />
                            ) : (
                              <ArrowDown size={12} className="text-navy" />
                            )
                          ) : (
                            <ArrowUpDown
                              size={11}
                              className="opacity-40 group-hover:opacity-100"
                            />
                          )}
                        </button>
                      </th>
                    );
                  })}
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((a: AppRow) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="font-bold text-navy whitespace-nowrap text-xs">
                      {a.app_no}
                    </td>
                    <td className="font-medium text-slate-900 max-w-xs truncate" title={a.institution}>
                      {a.institution}
                    </td>
                    <td className="font-mono text-xs text-slate-500">{a.code}</td>
                    <td className="whitespace-nowrap text-xs">{a.academic_year}</td>
                    <td className="whitespace-nowrap text-xs">
                      {a.compliance_score != null ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                            a.compliance_score >= 90 ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                            a.compliance_score >= 70 ? "bg-amber-100 text-amber-800 border border-amber-300" :
                            "bg-rose-100 text-rose-800 border border-rose-300"
                          }`}>
                            {a.compliance_score.toFixed(1)}%
                          </span>
                          {a.compliance_category && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              {a.compliance_category === "FULLY_COMPLIANT" ? "Compliant" :
                               a.compliance_category === "MINOR_NON_COMPLIANT" ? "Minor" :
                               a.compliance_category === "MAJOR_NON_COMPLIANT" ? "Major" : "Critical"}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">—</span>
                      )}
                    </td>
                    <td className="text-xs font-medium text-slate-700">
                      {a.reviewer ? (
                        <span className="truncate block max-w-[130px] font-semibold text-navy">{a.reviewer}</span>
                      ) : (
                        <span className="text-amber-700 italic">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <Status s={a.review_status} />
                    </td>
                    <td>
                      <Status s={a.status} />
                    </td>
                    <td>
                      <Progress v={a.completeness} />
                    </td>
                    <td className="text-xs text-slate-600 max-w-[140px] truncate" title={a.category}>
                      {a.category}
                    </td>
                    <td className="whitespace-nowrap text-xs text-slate-500">
                      {fmtDate(a.submitted_on)}
                    </td>
                    <td className="whitespace-nowrap text-xs text-slate-500">
                      {fmtDate(a.updated_at)}
                    </td>
                    <td className="text-center whitespace-nowrap">
                      <button
                        type="button"
                        className="btn-primary !py-1 !px-2.5 text-xs font-semibold shadow-xs"
                        onClick={() => nav(`/applications/${a.id}`)}
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-white border-t border-slate-200">
            <Pager
              total={data.total}
              page={page}
              size={size}
              setPage={setPage}
              setSize={setSize}
            />
          </div>
        </div>
      )}
    </div>
  );
}
