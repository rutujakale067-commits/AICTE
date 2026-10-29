import React from "react";
import { Link } from "react-router-dom";
import { UserCheck, ArrowRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import AictePortalHero from "../components/AictePortalHero";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-4">
      {/* Officer Signed-In Quick Notification Bar (Screenshot 1, only visible when an officer is signed in) */}
      {user && (
        <div className="bg-[#002147] text-white px-4 py-3 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm border-l-4 border-[#FF9933] animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
              <UserCheck size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300">
                Official Session: {user.name} ({user.role})
              </div>
              <div className="text-[11px] text-slate-200">
                You have active institution dossiers assigned to your scrutiny desk.
              </div>
            </div>
          </div>
          <Link
            to="/workspace"
            className="inline-flex items-center gap-1.5 bg-[#FFB800] hover:bg-[#F59E0B] text-black font-extrabold text-xs px-4 py-1.5 rounded-full shadow-xs transition-colors"
          >
            <span>Open Officer Workplace</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Official AICTE Portal Presentation (Screenshots 1, 2, 3) */}
      <AictePortalHero />
    </div>
  );
}

