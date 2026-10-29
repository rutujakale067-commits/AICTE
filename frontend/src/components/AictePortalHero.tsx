import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ExternalLink,
  ChevronRight,
  Plus,
  BookOpen,
  Calendar,
  FileText,
  HelpCircle,
  PhoneCall,
  Download,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function AictePortalHero() {
  const [activeBureau, setActiveBureau] = useState("Regulation");

  const bureauTabs = [
    "Regulation",
    "Training and Learning",
    "Policy & Academic Planning",
    "Administration",
    "Scholarships and Grants",
  ];

  // Moving Announcements Data
  const announcements = [
    {
      title: "Extension of Approval (EoA) 2026-2027 Scrutiny Window Commenced for Technical Institutes",
      date: "Published on 24 October, 2026",
      link: "/applications",
    },
    {
      title: "Mandatory Submission of Rs. 100/- E-Stamp Affidavit-2 affirming statutory norms before Public Notary",
      date: "Published on 18 October, 2026",
      link: "/documents",
    },
    {
      title: "Verification of Aadhaar-Seeded Faculty Records & Cadre Ratio Compliance under Clause 6.14",
      date: "Published on 12 October, 2026",
      link: "/scrutiny",
    },
    {
      title: "National Institutional Ranking Framework (NIRF) & NBA Accreditation Score Validation Guidelines",
      date: "Published on 05 October, 2026",
      link: "/applications",
    },
  ];

  // Moving Circulars Data (Screenshot 2)
  const circulars = [
    {
      title: "the allotted institute will be updated shortly on the SSSJKL Portal",
      date: "Published on 13 August, 2026",
      link: "/helpdesk",
    },
    {
      title: "Advisory on Submission of Municipal Building Occupancy Certificate and Form-D for AY 2026-27",
      date: "Published on 04 August, 2026",
      link: "/documents",
    },
    {
      title: "Mandatory Constitution of Anti-Ragging, Grievance Ombudsman, and Internal Complaint Committees",
      date: "Published on 28 July, 2026",
      link: "/scrutiny",
    },
    {
      title: "State Fire Services Safety NOC Verification Norms for Composite Campus Approvals",
      date: "Published on 19 July, 2026",
      link: "/documents",
    },
  ];

  // Moving Advertisements Data (Screenshot 2)
  const advertisements = [
    {
      title: "Application for the post of Adviser-I, Adviser-II, Director and Assistant Director on deputation at AICTE",
      date: "Published on 26 May, 2025",
      link: "/helpdesk",
    },
    {
      title: "Engagement of Senior Technical Consultants for National Curriculum Alignment & Industry Integration",
      date: "Published on 15 May, 2025",
      link: "/helpdesk",
    },
    {
      title: "Empanelment of Academic and Industrial Subject Experts for Scrutiny and Standing Hearing Committees",
      date: "Published on 02 May, 2025",
      link: "/scrutiny",
    },
    {
      title: "Notice Inviting Proposals for AICTE Quality Improvement Scheme (AQIS) Institutional Grants",
      date: "Published on 21 April, 2025",
      link: "/reports",
    },
  ];

  // Quick Links items (Screenshot 3)
  const quickLinks = [
    { label: "AICTE Approved Universities/Institutions", to: "/applications" },
    { label: "Approval Process 2026-27", to: "/scrutiny" },
    { label: "AICTE Internship Portal", href: "https://internship.aicte-india.org" },
    { label: "FDP-SI Web portal", href: "https://fdp-si.aicte-india.org" },
    { label: "ATAL Academy", href: "https://www.aicte-india.org/atal" },
    { label: "Policies & Reforms", to: "/scrutiny" },
    { label: "SSS J&K and Ladakh", href: "https://aicte-jk-scholarship-gov.in" },
    { label: "AICTE-AI Language Translation Tool", href: "https://ekumbh.aicte-india.org" },
    { label: "eKUMBH Portal", href: "https://ekumbh.aicte-india.org" },
    { label: "Vidyanjali-HE", href: "https://vidyanjali-he.education.gov.in" },
  ];

  return (
    <div className="space-y-8 select-none">
      {/* ========================================================================= */}
      {/* SECTION 1: APPROVAL PROCESS 2026-2027 HERO SECTION (Screenshot 1)         */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-b from-[#E2F0FE] via-[#EDF5FE] to-[#F8FAFC] py-8 px-4 rounded-xl border border-blue-200/80 shadow-xs relative overflow-hidden">
        {/* Subtle cloud textures in background */}
        <div className="absolute top-2 right-12 w-48 h-20 bg-white/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-4 left-10 w-64 h-24 bg-white/50 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#002147] tracking-tight">
            Approval Process 2026-2027
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
            (w.e.f 28th Nov, 2025)
          </p>

          <div className="grid md:grid-cols-12 gap-5 mt-6 text-left">
            {/* Left Box (7 Cols, Screenshot 1) */}
            <div className="md:col-span-7 bg-white/95 backdrop-blur-xs border border-[#F59E0B]/70 rounded-xl p-5 shadow-sm space-y-3.5">
              {/* Row 1 */}
              <div className="flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
                <span>AICTE Approved Universities/Institutions</span>
                <Link
                  to="/applications"
                  className="bg-[#FFB800] hover:bg-[#F59E0B] text-black font-bold text-xs px-4 py-1.5 rounded-full shadow-2xs shrink-0 transition-colors"
                >
                  Click Here
                </Link>
              </div>

              {/* Row 2 */}
              <div className="flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
                <span>Public Notice for Approval Process 2026-27</span>
                <Link
                  to="/scrutiny"
                  className="bg-[#FFB800] hover:bg-[#F59E0B] text-black font-bold text-xs px-4 py-1.5 rounded-full shadow-2xs shrink-0 transition-colors"
                >
                  Click Here
                </Link>
              </div>

              {/* Row 3 */}
              <div className="flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
                <span>Corrigendum / Addendum for Approval Process 2026-27:</span>
                <Link
                  to="/reports"
                  className="bg-[#FFB800] hover:bg-[#F59E0B] text-black font-bold text-xs px-4 py-1.5 rounded-full shadow-2xs shrink-0 transition-colors"
                >
                  To Download Click Here
                </Link>
              </div>

              {/* Row 4 */}
              <div className="flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
                <span>Approval Process Handbook (APH) and Guidelines/Information :</span>
                <Link
                  to="/scrutiny"
                  className="bg-[#FFB800] hover:bg-[#F59E0B] text-black font-bold text-xs px-4 py-1.5 rounded-full shadow-2xs shrink-0 transition-colors"
                >
                  To Download APH Click Here
                </Link>
              </div>

              {/* Row 5 */}
              <div className="flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
                <span>Centralized Support System for Approval Queries :</span>
                <Link
                  to="/helpdesk"
                  className="bg-[#FFB800] hover:bg-[#F59E0B] text-black font-bold text-xs px-4 py-1.5 rounded-full shadow-2xs shrink-0 transition-colors"
                >
                  Click Here
                </Link>
              </div>

              {/* Row 6 */}
              <div className="flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
                <span>Frequently Asked Questions(FAQs) :</span>
                <Link
                  to="/helpdesk"
                  className="bg-[#FFB800] hover:bg-[#F59E0B] text-black font-bold text-xs px-4 py-1.5 rounded-full shadow-2xs shrink-0 transition-colors"
                >
                  Click Here
                </Link>
              </div>

              {/* Row 7: Helpline */}
              <div className="flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
                <span>Helpline for Technical Queries :</span>
                <span className="bg-[#FFB800] text-black font-bold text-[11px] sm:text-xs px-3.5 py-1.5 rounded-full shadow-2xs shrink-0">
                  (011)29581333, 29581338, 29581342
                </span>
              </div>

              {/* Row 8 */}
              <div className="flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-slate-800">
                <span>Information Regarding an Unapproved Institution:</span>
                <Link
                  to="/applications"
                  className="bg-[#FFB800] hover:bg-[#F59E0B] text-black font-bold text-xs px-4 py-1.5 rounded-full shadow-2xs shrink-0 transition-colors"
                >
                  Click Here
                </Link>
              </div>
            </div>

            {/* Right Box (5 Cols, Screenshot 1) */}
            <div className="md:col-span-5 bg-white/95 backdrop-blur-xs border border-[#F59E0B]/70 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-6 text-center">
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-[#002147] mb-2 leading-snug">
                  Information Facilitation Center For Live Video Conferencing(Technical Support) :
                </h3>
                <Link
                  to="/helpdesk"
                  className="inline-block bg-[#FFB800] hover:bg-[#F59E0B] text-black font-bold text-xs px-6 py-2 rounded-full shadow-xs transition-colors"
                >
                  Click Here to Know More
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-xs sm:text-sm font-extrabold text-[#002147] mb-2 leading-snug">
                  List of Unapproved Institution:
                </h3>
                <Link
                  to="/applications"
                  className="inline-block bg-[#FFB800] hover:bg-[#F59E0B] text-black font-bold text-xs px-6 py-2 rounded-full shadow-xs transition-colors"
                >
                  Click Here to Know More
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-xs sm:text-sm font-extrabold text-[#002147] mb-2 leading-snug">
                  Revised Academic Calendar 2026-27:
                </h3>
                <Link
                  to="/reports"
                  className="inline-block bg-[#FFB800] hover:bg-[#F59E0B] text-black font-bold text-xs px-6 py-2 rounded-full shadow-xs transition-colors"
                >
                  Click Here to Know More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: LATEST NEWS & THREE MOVING TOPICS IN BOX (Screenshot 2)        */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        {/* Yellow Header Badge matching Screenshot 2 */}
        <div className="inline-block bg-[#FFB800] text-black font-extrabold text-xs sm:text-sm px-4 py-1.5 uppercase tracking-wide shadow-xs">
          LATEST NEWS
        </div>

        {/* Three Moving Topics in Box side-by-side */}
        <div className="grid md:grid-cols-3 gap-5">
          {/* BOX 1: ANNOUNCEMENTS */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            {/* Wavy Deep Blue Header Banner */}
            <div className="bg-[#002147] text-white py-2.5 px-4 text-center font-extrabold text-xs tracking-wider uppercase border-b-2 border-[#FFB800]">
              ANNOUNCEMENTS
            </div>

            {/* Vertical Auto-Scrolling Moving Ticker Container */}
            <div className="h-[210px] overflow-hidden relative p-3">
              <div className="animate-ticker space-y-4">
                {[...announcements, ...announcements].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-slate-50 border border-slate-200/80 hover:bg-blue-50/50 hover:border-blue-300 transition-colors"
                  >
                    <Link
                      to={item.link}
                      className="text-xs font-semibold text-slate-800 hover:text-[#002147] line-clamp-2 leading-snug block"
                    >
                      {item.title}
                    </Link>
                    <div className="mt-1.5 flex justify-end">
                      <span className="inline-flex items-center gap-1 bg-[#FFB800] text-black text-[9.5px] font-bold px-2 py-0.5 rounded shadow-2xs">
                        <Calendar size={10} />
                        {item.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Read More Action Button (Screenshot 2) */}
            <div className="p-2.5 text-center border-t border-slate-100 bg-slate-50/50">
              <Link
                to="/applications"
                className="inline-block bg-[#FFB800] hover:bg-[#F59E0B] text-black font-bold text-xs px-5 py-1 rounded shadow-xs transition-colors"
              >
                Read More
              </Link>
            </div>
          </div>

          {/* BOX 2: CIRCULARS */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            {/* Wavy Deep Blue Header Banner */}
            <div className="bg-[#002147] text-white py-2.5 px-4 text-center font-extrabold text-xs tracking-wider uppercase border-b-2 border-[#FFB800]">
              CIRCULARS
            </div>

            {/* Vertical Auto-Scrolling Moving Ticker Container */}
            <div className="h-[210px] overflow-hidden relative p-3">
              <div className="animate-ticker space-y-4">
                {[...circulars, ...circulars].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-slate-50 border border-slate-200/80 hover:bg-blue-50/50 hover:border-blue-300 transition-colors"
                  >
                    <Link
                      to={item.link}
                      className="text-xs font-semibold text-slate-800 hover:text-[#002147] line-clamp-2 leading-snug block"
                    >
                      {item.title}
                    </Link>
                    <div className="mt-1.5 flex justify-end">
                      <span className="inline-flex items-center gap-1 bg-[#FFB800] text-black text-[9.5px] font-bold px-2 py-0.5 rounded shadow-2xs">
                        <Calendar size={10} />
                        {item.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Read More Action Button (Screenshot 2) */}
            <div className="p-2.5 text-center border-t border-slate-100 bg-slate-50/50">
              <Link
                to="/reports"
                className="inline-block bg-[#FFB800] hover:bg-[#F59E0B] text-black font-bold text-xs px-5 py-1 rounded shadow-xs transition-colors"
              >
                Read More
              </Link>
            </div>
          </div>

          {/* BOX 3: ADVERTISEMENTS */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            {/* Wavy Deep Blue Header Banner */}
            <div className="bg-[#002147] text-white py-2.5 px-4 text-center font-extrabold text-xs tracking-wider uppercase border-b-2 border-[#FFB800]">
              ADVERTISEMENTS
            </div>

            {/* Vertical Auto-Scrolling Moving Ticker Container */}
            <div className="h-[210px] overflow-hidden relative p-3">
              <div className="animate-ticker space-y-4">
                {[...advertisements, ...advertisements].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-slate-50 border border-slate-200/80 hover:bg-blue-50/50 hover:border-blue-300 transition-colors"
                  >
                    <Link
                      to={item.link}
                      className="text-xs font-semibold text-slate-800 hover:text-[#002147] line-clamp-2 leading-snug block"
                    >
                      {item.title}
                    </Link>
                    <div className="mt-1.5 flex justify-end">
                      <span className="inline-flex items-center gap-1 bg-[#FFB800] text-black text-[9.5px] font-bold px-2 py-0.5 rounded shadow-2xs">
                        <Calendar size={10} />
                        {item.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Read More Action Button (Screenshot 2) */}
            <div className="p-2.5 text-center border-t border-slate-100 bg-slate-50/50">
              <Link
                to="/helpdesk"
                className="inline-block bg-[#FFB800] hover:bg-[#F59E0B] text-black font-bold text-xs px-5 py-1 rounded shadow-xs transition-colors"
              >
                Read More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: QUICK LINKS & BUREAUS HERITAGE SECTION (Screenshot 3)           */}
      {/* ========================================================================= */}
      <section className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Links (4 Cols, Screenshot 3) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="font-extrabold text-sm text-[#002147] uppercase tracking-wider border-b-2 border-[#1E3A8A] pb-2 mb-3">
            QUICK LINKS
          </div>
          <ul className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            {quickLinks.map((ql, i) => (
              <li key={i}>
                {ql.to ? (
                  <Link
                    to={ql.to}
                    className="py-2 px-1 hover:text-[#002147] hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <span>{ql.label}</span>
                    <ChevronRight size={13} className="text-slate-400" />
                  </Link>
                ) : (
                  <a
                    href={ql.href}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-1 hover:text-[#002147] hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <span>{ql.label}</span>
                    <ExternalLink size={12} className="text-slate-400" />
                  </a>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-3 text-center">
            <Link
              to="/applications"
              className="inline-flex items-center gap-1 bg-[#002147] hover:bg-[#0B3566] text-white font-bold text-xs px-4 py-1.5 rounded shadow-xs transition-colors"
            >
              <Plus size={12} />
              <span>More</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Bureaus Tabs & Heritage Banner (8 Cols, Screenshot 3) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Bureau Navigation Tabs (Screenshot 3) */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
            <span className="font-extrabold text-xs text-[#002147] uppercase mr-2">Bureaus:</span>
            {bureauTabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveBureau(t)}
                className={`text-xs px-3 py-1.5 rounded transition-colors font-semibold italic ${
                  activeBureau === t
                    ? "bg-[#002147] text-white not-italic shadow-xs font-bold"
                    : "text-slate-700 hover:text-black hover:bg-slate-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Heritage Ancient Shloka & Technical Education Definition Banner (Screenshot 3) */}
          <div className="bg-gradient-to-r from-[#CA8A04]/20 via-[#EAB308]/20 to-[#FEF08A]/30 rounded-xl border border-amber-300/80 p-6 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-6">
            <div>
              {/* Sanskrit Shloka from Sulba Sutra / Baudhayana */}
              <div className="text-center">
                <p className="text-base sm:text-lg font-bold font-devanagari text-[#713F12] tracking-wide leading-relaxed">
                  || दीर्घचतुरस्रस्याक्ष्णया रज्जुः पार्श्वमानी तिर्यग् मानी च यत् पृथग् भूते कुरुतस्तदुभयं करोति ||
                </p>
                <p className="text-xs sm:text-sm text-[#854D0E] italic font-medium mt-1">
                  A rope stretched along the length of the diagonal produces an area which the vertical and horizontal sides make together.
                </p>
              </div>
            </div>

            {/* AICTE Act 1987 Technical Education Statutory Definition (Screenshot 3) */}
            <div className="bg-black/60 backdrop-blur-xs text-white p-4 rounded-lg text-xs leading-relaxed space-y-3">
              <p>
                As defined in the AICTE act 1987, Technical Education means programmes of Education, Research, and training in Engineering and Technology, Architecture, Town Planning, Management, Pharmacy, and Applied Arts and Crafts, and such other programmes or areas as the Central Government may in consultation with the Council, by notification in the official gazette declare
              </p>
              <div>
                <Link
                  to="/scrutiny"
                  className="inline-block bg-[#FFB800] hover:bg-[#F59E0B] text-black font-extrabold text-xs px-4 py-1.5 rounded shadow-xs transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

