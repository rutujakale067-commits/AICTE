import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  LogIn,
  Shield,
  FileCheck2,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  Building2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { ErrorBox } from "../components/ui";
import AicteLogo, { AicteEmblem } from "../components/AicteLogo";
import NationalEmblem from "../components/NationalEmblem";
import LanguageSelector from "../components/LanguageSelector";
import { useLanguage } from "../hooks/useLanguage";

interface DemoAccount {
  username: string;
  pass: string;
  role: string;
  designation: string;
  badgeColor: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    username: "officer",
    pass: "Officer@123",
    role: "Scrutiny Officer A",
    designation: "Western Regional Office (WRO)",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    username: "officer2",
    pass: "Officer@123",
    role: "Scrutiny Officer B",
    designation: "Northern Regional Office (NRO)",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    username: "officer3",
    pass: "Officer@123",
    role: "Scrutiny Officer C",
    designation: "Southern Regional Office (SRO)",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    username: "senior",
    pass: "Senior@123",
    role: "Senior Reviewer",
    designation: "Approval Bureau, AICTE HQ",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    username: "admin",
    pass: "Admin@123",
    role: "Administrator",
    designation: "System-wide Oversight & Workload",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
];

export default function Login() {
  const { user, login, logout } = useAuth();
  const { t } = useLanguage();
  const nav = useNavigate();
  const [username, setUsername] = useState("officer");
  const [password, setPassword] = useState("Officer@123");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Render login view directly as prototype start screen

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await login(username, password);
      nav("/workspace");
    } catch (x: any) {
      setErr(x.message || "Invalid credentials. Please verify your username and password.");
    }
    setBusy(false);
  };

  const selectDemoUser = (account: DemoAccount) => {
    setUsername(account.username);
    setPassword(account.pass);
    setErr("");
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col justify-between">
      {user && (
        <div className="bg-[#002147] text-white px-4 py-2 text-center text-xs font-semibold flex flex-wrap items-center justify-center gap-3 border-b-2 border-[#FF9933] shadow-sm">
          <span className="text-amber-300">Active Officer Session: <strong>{user.name}</strong> ({user.role})</span>
          <button
            type="button"
            onClick={() => nav("/workspace")}
            className="bg-[#FFB800] hover:bg-[#F59E0B] text-black font-extrabold text-[11px] px-3 py-1 rounded shadow-xs cursor-pointer transition-colors"
          >
            Continue to Scrutiny Workplace →
          </button>
          <button
            type="button"
            onClick={logout}
            className="text-slate-300 hover:text-white underline text-[11px] cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      )}
      {/* 1. National Tricolour Accent Line */}
      <div className="tricolour-bar" />

      {/* 2. Official Govt Header */}
      <header className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <NationalEmblem size={36} className="hidden sm:flex" />
            <div className="hidden sm:block h-9 w-px bg-slate-200" />
            <AicteLogo size={52} showText={true} />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                Approval Process 2026-2027
              </span>
              <span className="text-xs font-bold text-navy">
                AICTE Approval Bureau · EoA Scrutiny
              </span>
            </div>
            <LanguageSelector variant="light" />
          </div>
        </div>
      </header>

      {/* 3. Demo Pilot Alert Banner */}
      <div className="bg-amber-500/15 border-b border-amber-300 text-center text-xs py-1.5 px-3 text-amber-950 font-medium">
        {t('handbook_banner')}
      </div>

      {/* 4. Main Login Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 flex items-center justify-center">
        <div className="grid lg:grid-cols-12 gap-8 w-full items-stretch">
          {/* Left Column: Portal Overview & AI Scrutiny Features (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-brand text-xs font-semibold">
                <Sparkles size={14} className="text-saffron" />
                <span>AICTE Approval Process Handbook (APH 2024–27) Scrutiny System</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight leading-snug">
                All India Council for Technical Education
                <div className="text-xl sm:text-2xl text-brand font-semibold mt-1">
                  {t('portal_title')}
                </div>
              </h1>

              <p className="text-sm text-slate-600 leading-relaxed">
                Official scrutiny decision-support platform built for AICTE officials and regional scrutiny officers to automate preliminary compliance evaluation for Extension of Approval (EoA) applications. Features optical character recognition for submitted certificates, deterministic validation against the Approval Process Handbook (APH 2024–27), cross-document consistency checks, and evidence-backed reporting.
              </p>
            </div>

            {/* Core Scrutiny Pillars */}
            <div className="grid sm:grid-cols-2 gap-3.5">
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-soft">
                <div className="w-8 h-8 rounded-md bg-navy/10 text-navy flex items-center justify-center mb-2.5">
                  <FileCheck2 size={18} />
                </div>
                <div className="text-xs font-bold text-navy uppercase tracking-wide">
                  {t('handbook_rule')}
                </div>
                <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Automated checks for Annexure-2 §2.1 checklist and Clause 6.17 building safety & occupancy certificates.
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-soft">
                <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5">
                  <Shield size={18} />
                </div>
                <div className="text-xs font-bold text-navy uppercase tracking-wide">
                  {t('evidence_linked')}
                </div>
                <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Every identified deficiency links directly to the specific page in the submitted PDF document for transparent verification.
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-soft">
                <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center mb-2.5">
                  <Building2 size={18} />
                </div>
                <div className="text-xs font-bold text-navy uppercase tracking-wide">
                  {t('ocr_extraction')}
                </div>
                <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Automatic optical character recognition fallback for scanned PDFs with field-level confidence scoring.
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-soft">
                <div className="w-8 h-8 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center mb-2.5">
                  <Lock size={18} />
                </div>
                <div className="text-xs font-bold text-navy uppercase tracking-wide">
                  {t('audit_integrity')}
                </div>
                <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Every status change, override, remark and PDF report download is cryptographically tracked in the audit trail.
                </div>
              </div>
            </div>

            {/* Statutory Disclaimer */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 leading-normal flex items-start gap-2.5">
              <span className="font-bold text-navy shrink-0">Note:</span>
              <span>
                The AI system flags potential discrepancies and provides handbook references. The AI never approves or rejects any application; decision authority remains solely with authorized AICTE officials.
              </span>
            </div>
          </div>

          {/* Right Column: Sign-in Form & Demo Quick-Fill (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {/* Login Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-elevated overflow-hidden">
              <div className="h-sec">
                <div className="flex items-center gap-2">
                  <Lock size={15} className="text-amber-300" />
                  <span className="font-semibold text-sm">{t('signin_title')}</span>
                </div>
                <span className="text-[10px] font-mono text-amber-200 bg-white/10 px-2 py-0.5 rounded">
                  Demo Auth
                </span>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    {t('username')}
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      className="field pl-9"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. officer, senior, admin"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    {t('password')}
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="field pl-9 pr-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {err && <ErrorBox text={err} />}

                <button
                  type="submit"
                  disabled={busy}
                  className="btn-primary w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <LogIn size={16} />
                  <span>{busy ? "Authenticating session..." : "{t('signin_btn')}"}</span>
                </button>
              </form>

              {/* Demo Accounts Quick-Select */}
              <div className="border-t border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    {t('quick_fill')}
                  </span>
                  <span className="text-[10px] text-slate-400">{t('click_to_fill')}</span>
                </div>

                <div className="space-y-1.5">
                  {DEMO_ACCOUNTS.map((acc) => {
                    const isSelected = username === acc.username;
                    return (
                      <div
                        key={acc.username}
                        onClick={() => selectDemoUser(acc)}
                        className={`p-2 rounded-lg border text-xs cursor-pointer transition-all duration-150 flex items-center justify-between gap-2 ${
                          isSelected
                            ? "bg-amber-50/90 border-amber-400 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isSelected ? "bg-navy text-white" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {acc.username[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-navy truncate">
                              {acc.role}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {acc.username} · {acc.designation}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${acc.badgeColor}`}
                        >
                          {isSelected ? "Selected" : "Use"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 5. Official Footer */}
      <footer className="bg-navy text-slate-400 text-xs py-4 border-t-2 border-saffron">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div>
            All India Council for Technical Education (AICTE), Nelson Mandela Marg, Vasant Kunj, New Delhi-110070. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-amber-400">National Informatics Standards</span>
            <span>•</span>
            <span>APH 2024–27 Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
