import { useState, useEffect } from "react";
import { NavLink, Outlet, Link, Navigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  User,
  LogOut,
  HelpCircle,
  Clock,
  Volume2,
  ChevronDown,
  LayoutDashboard,
  FolderKanban,
  FileSearch,
  FileCheck2,
  FileWarning,
  BarChart3,
  History,
  LifeBuoy,
  ExternalLink,
  ShieldCheck,
  MessageSquare,
  Building,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Spinner } from "../components/ui";
import AicteLogo, { AicteEmblem } from "../components/AicteLogo";
import LanguageSelector from "../components/LanguageSelector";

const NAV_ITEMS = [
  { label: "Officer Workplace", to: "/workspace", icon: UserCheck },
  { label: "Applications", to: "/applications", icon: FolderKanban },
  { label: "Scrutiny Checks", to: "/scrutiny", icon: FileSearch },
  { label: "Document Verification", to: "/documents", icon: FileCheck2 },
  { label: "Deficiency Reports", to: "/reports", icon: FileWarning },
  { label: "Statistics", to: "/analytics", icon: BarChart3 },
  { label: "Council Audit Trail", to: "/audit", icon: History },
  { label: "AICTE Portal", to: "/portal", icon: Building },
  { label: "Helpdesk", to: "/helpdesk", icon: LifeBuoy },
];

export default function Layout() {
  const { user, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [fontSize, setFontSize] = useState<number>(14);
  const [clockString, setClockString] = useState<string>("");
  const location = useLocation();

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Live Clock format matching Screenshot 1: "Wednesday , 10-28-2026 ,11:08 PM"
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const year = now.getFullYear();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      const formattedHours = String(hours).padStart(2, "0");
      setClockString(`${dayName} , ${month}-${day}-${year} ,${formattedHours}:${minutes} ${ampm}`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const changeFontSize = (px: number) => {
    setFontSize(px);
    document.documentElement.style.fontSize = `${px}px`;
  };

  if (loading) return <Spinner text="Authenticating session..." />;
  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9] text-slate-800 relative">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 bg-[#002147] text-white px-3 py-1.5 rounded z-50 shadow-md text-xs font-semibold"
      >
        Skip to main content
      </a>

      {/* 1. Official Top Black Utility Bar (Screenshot 1) */}
      <div className="bg-[#111827] text-white text-[11px] py-1 px-4 border-b border-black">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          {/* Left: Clock & Screen Reader Access */}
          <div className="flex items-center gap-4 text-slate-200">
            <span className="font-medium tracking-tight">{clockString}</span>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
              title="Screen Reader Access"
            >
              <Volume2 size={12} className="text-amber-400" />
              <span>Screen Reader Access</span>
            </button>
          </div>

          {/* Right: Text Size, High Contrast, Web Portal Login / User Profile, Social Icons */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-slate-300">
              <span className="text-[10px] mr-1 hidden sm:inline">Text Size:</span>
              <button
                type="button"
                onClick={() => changeFontSize(12)}
                className={`px-1.5 py-0.2 rounded font-bold ${
                  fontSize === 12 ? "bg-amber-400 text-black" : "hover:text-white text-slate-300"
                }`}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => changeFontSize(14)}
                className={`px-1.5 py-0.2 rounded font-bold ${
                  fontSize === 14 ? "bg-amber-400 text-black" : "hover:text-white text-slate-300"
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => changeFontSize(16)}
                className={`px-1.5 py-0.2 rounded font-bold ${
                  fontSize === 16 ? "bg-amber-400 text-black" : "hover:text-white text-slate-300"
                }`}
              >
                A+
              </button>
            </div>

            <span className="text-slate-600 hidden sm:inline">|</span>

            {/* Accessibility & Language Dropdown Scroller */}
            <div className="flex items-center gap-1.5">
              <span className="bg-[#FFB800] text-black text-[9px] font-black px-1.5 py-0.5 rounded font-mono">
                A12
              </span>
              <LanguageSelector variant="dark" />
            </div>

            {/* Official Yellow Web Portal Login / Officer Profile Button (Screenshot 1) */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 bg-[#FFB800] hover:bg-[#F59E0B] text-black font-bold text-xs px-2.5 py-0.5 rounded shadow-sm transition-colors"
                  aria-expanded={profileDropdownOpen}
                >
                  <User size={12} className="stroke-[2.5]" />
                  <span>{user.name}</span>
                  <ChevronDown size={11} className="stroke-[2.5]" />
                </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-elevated w-60 z-50 py-1.5 divide-y divide-slate-100 text-slate-800 animate-in fade-in duration-100">
                  <div className="px-3.5 py-2">
                    <div className="font-bold text-xs text-[#002147]">{user.name}</div>
                    <div className="text-[11px] text-slate-500">{user.role}</div>
                    <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Officer Session
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/portal"
                      className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <LayoutDashboard size={13} className="text-slate-400" />
                      Approval Portal Home
                    </Link>
                    <Link
                      to="/applications"
                      className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <FolderKanban size={13} className="text-slate-400" />
                      EoA Applications Queue
                    </Link>
                    <Link
                      to="/audit"
                      className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <History size={13} className="text-slate-400" />
                      Council Audit Trail
                    </Link>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/workspace"
                      className="w-full text-left px-3.5 py-1.5 text-xs text-[#002147] hover:bg-slate-50 flex items-center gap-2 font-bold"
                    >
                      <UserCheck size={13} className="text-amber-500" />
                      Officer Workplace
                    </Link>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      className="w-full text-left px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold"
                      onClick={logout}
                    >
                      <LogOut size={13} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 bg-[#FFB800] hover:bg-[#F59E0B] text-black font-bold text-xs px-2.5 py-0.5 rounded shadow-sm transition-colors"
              >
                <User size={12} className="stroke-[2.5]" />
                <span>Web Portal Login</span>
              </Link>
            )}

            {/* Social Icons matching Screenshot 1 */}
            <div className="hidden sm:flex items-center gap-2 text-slate-300 ml-1">
              <span className="hover:text-white cursor-pointer font-bold text-xs">f</span>
              <span className="hover:text-white cursor-pointer font-bold text-xs">𝕏</span>
              <span className="hover:text-white cursor-pointer font-bold text-xs">📱</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main White AICTE Header matching Screenshot 1 */}
      <header className="bg-white border-b border-slate-200 shadow-2xs py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/workspace" className="flex items-center gap-4 group">
            <AicteLogo size={62} showText={true} />
          </Link>
          <div className="hidden md:flex flex-col items-end text-right">
            <span className="text-[11px] font-bold text-[#002147] uppercase tracking-wider">
              Approval Process 2026–2027
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              Approval Bureau · Ministry of Education, Govt. of India
            </span>
          </div>
        </div>
      </header>

      {/* 3. Official Deep Navy Navigation Bar matching Screenshot 1 */}
      <nav className="bg-[#002147] text-white shadow-md sticky top-0 z-40 border-t border-white/10" aria-label="Primary">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden py-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              <span>Portal Navigation</span>
            </button>

            {/* Desktop Navigation Links (Screenshot 1) */}
            <ul
              className={`${
                mobileMenuOpen ? "block" : "hidden"
              } lg:flex flex-wrap w-full lg:w-auto py-1 lg:py-0 divide-y lg:divide-y-0 divide-white/10`}
            >
              {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    end={to === "/"}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold transition-all duration-150 border-b-[3px] ${
                        isActive
                          ? "border-[#FFB800] text-amber-300 bg-white/10 font-bold"
                          : "border-transparent text-slate-100 hover:text-white hover:bg-white/5 hover:border-amber-300/40"
                      }`
                    }
                  >
                    <Icon size={13} className="shrink-0 opacity-80" />
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Quick Access Status Pill */}
            <div className="hidden xl:flex items-center">
              <span className="bg-white/10 px-2.5 py-1 rounded text-[10.5px] font-mono text-amber-300 border border-white/10 font-semibold">
                APH 2024–27
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* 4. Main Body Content */}
      <main id="main-content" className="flex-1 w-full">
        <Outlet />
      </main>

      {/* 5. Sticky Floating Social Media Sidebar (Screenshot 1, 2, 3) */}
      <aside className="fixed right-0 top-1/2 -translate-y-1/2 z-50 hidden sm:flex flex-col shadow-lg select-none" aria-label="Social Links">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noreferrer"
          className="w-8 h-9 bg-[#1877F2] text-white flex items-center justify-center font-bold text-sm hover:w-10 transition-all shadow-sm"
          title="AICTE on Facebook"
        >
          f
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noreferrer"
          className="w-8 h-9 bg-black text-white flex items-center justify-center font-bold text-sm hover:w-10 transition-all shadow-sm"
          title="AICTE on X"
        >
          𝕏
        </a>
        <a
          href="https://play.google.com"
          target="_blank"
          rel="noreferrer"
          className="w-8 h-9 bg-[#EA4335] text-white flex items-center justify-center font-bold text-xs hover:w-10 transition-all shadow-sm"
          title="AICTE Mobile App"
        >
          🤖
        </a>
      </aside>

      {/* 6. Floating AICTE Facilitation Avatar Chatbot Icon (Bottom Right, Screenshot 1, 2, 3) */}
      <aside className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => window.location.href = "/helpdesk"}
          className="w-13 h-13 rounded-full bg-white border-[3px] border-[#F97316] shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform group"
          title="AICTE Student & Institution Helpdesk Facilitation"
          aria-label="Open AICTE Support Helpdesk"
        >
          <span className="text-2xl" role="img" aria-label="Chatbot Avatar">👨‍💼</span>
        </button>
      </aside>

      {/* 7. Official AICTE Government Footer */}
      <footer className="bg-[#002147] text-slate-300 text-xs mt-auto border-t-4 border-[#FF9933]">
        <div className="tricolour-bar opacity-90" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="md:col-span-2 space-y-2.5">
              <div className="flex items-center gap-3.5">
                <AicteEmblem size={52} />
                <div>
                  <div className="text-[12px] font-bold font-devanagari text-amber-300">
                    अखिल भारतीय तकनीकी शिक्षा परिषद
                  </div>
                  <div className="font-extrabold text-white text-base">
                    All India Council for Technical Education (AICTE)
                  </div>
                  <div className="text-[11px] text-amber-200 font-medium">
                    Approval Bureau · Official Scrutiny Portal for Extension of Approval (EoA)
                  </div>
                  <div className="text-[10.5px] text-slate-300 mt-0.5">
                    Nelson Mandela Marg, Vasant Kunj, New Delhi-110070 | Phone: 011-29581000
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed max-w-xl">
                Official regulatory scrutiny portal supporting the AICTE Approval Bureau and Regional Scrutiny Officers in evaluation of Extension of Approval (EoA) applications under the AICTE Act, 1987. Automates compliance verification against the AICTE Approval Process Handbook (APH 2024–2027), evidence-linked document audit, and cross-document reconciliation.
              </p>
            </div>

            <div>
              <div className="font-bold text-white text-xs uppercase tracking-wider mb-2.5 border-b border-white/10 pb-1 text-amber-300">
                Official AICTE Links
              </div>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <a
                    href="https://www.aicte.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink size={11} className="opacity-70" />
                    AICTE Official Portal (aicte.gov.in)
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.aicte-india.org/bureaus/approval"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink size={11} className="opacity-70" />
                    Approval Bureau
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.aicte-india.org/aphandbook"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink size={11} className="opacity-70" />
                    Approval Process Handbook (APH)
                  </a>
                </li>
                <li>
                  <a
                    href="https://facilities.aicte-india.org/dashboard/pages/angulardashboard.php"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink size={11} className="opacity-70" />
                    AICTE Central Dashboard
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-white text-xs uppercase tracking-wider mb-2.5 border-b border-white/10 pb-1 text-amber-300">
                Regulatory Standards
              </div>
              <ul className="space-y-1.5 text-[11px]">
                <li>Guidelines for Indian Government Websites (GIGW)</li>
                <li>Right to Information (RTI)</li>
                <li>Citizen Charter</li>
                <li>Vigilance Cell</li>
                <li>Privacy Policy &amp; Terms of Use</li>
              </ul>
              <div className="mt-3 pt-2 border-t border-white/10 text-[10.5px] text-slate-300">
                <div>National Informatics Centre (NIC) Standards</div>
                <div className="text-emerald-400 font-semibold mt-0.5">TLS 1.3 256-bit Secure Session</div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-300">
            <div>
              Copyright &copy; {new Date().getFullYear()} All India Council for Technical Education (AICTE). All Rights Reserved.
            </div>
            <div className="flex items-center gap-3">
              <span>Ministry of Education, Govt. of India</span>
              <span>&bull;</span>
              <span className="text-amber-300 font-medium">Approval Bureau · Scrutiny Portal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
