import React from "react";
import {
  FileText,
  Clock,
  Loader,
  CheckCircle2,
  XCircle,
  Undo2,
  UserX,
  ListChecks,
} from "lucide-react";

interface CardStyle {
  icon: any;
  border: string;
  bgIcon: string;
  textIcon: string;
  badge: string;
}

const CARD_STYLES: Record<string, CardStyle> = {
  total: {
    icon: FileText,
    border: "border-l-navy",
    bgIcon: "bg-navy/10",
    textIcon: "text-navy",
    badge: "Total",
  },
  pending: {
    icon: Clock,
    border: "border-l-slate-400",
    bgIcon: "bg-slate-100",
    textIcon: "text-slate-600",
    badge: "Queue",
  },
  under: {
    icon: Loader,
    border: "border-l-sky-600",
    bgIcon: "bg-sky-50",
    textIcon: "text-sky-600",
    badge: "Active",
  },
  approved: {
    icon: CheckCircle2,
    border: "border-l-emerald-600",
    bgIcon: "bg-emerald-50",
    textIcon: "text-emerald-600",
    badge: "Cleared",
  },
  rejected: {
    icon: XCircle,
    border: "border-l-rose-600",
    bgIcon: "bg-rose-50",
    textIcon: "text-rose-600",
    badge: "Action",
  },
  returned: {
    icon: Undo2,
    border: "border-l-amber-500",
    bgIcon: "bg-amber-50",
    textIcon: "text-amber-600",
    badge: "Returned",
  },
  unassigned: {
    icon: UserX,
    border: "border-l-saffron",
    bgIcon: "bg-saffron/15",
    textIcon: "text-saffron-dark",
    badge: "Unassigned",
  },
  completed: {
    icon: ListChecks,
    border: "border-l-indigo-600",
    bgIcon: "bg-indigo-50",
    textIcon: "text-indigo-600",
    badge: "Done",
  },
};

export const StatGrid = ({
  items,
}: {
  items: [string, string, number, string?][];
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 2xl:grid-cols-8 gap-3 mb-5">
    {items.map(([k, l, n, hint]) => {
      const cfg = CARD_STYLES[k] || CARD_STYLES.total;
      const Icon = cfg.icon;
      return (
        <div
          key={l}
          className={`bg-white rounded-lg border border-slate-200/90 border-l-4 ${cfg.border} p-3.5 shadow-card hover:shadow-md transition-shadow duration-150 flex flex-col justify-between`}
          title={hint}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className={`p-1.5 rounded-md ${cfg.bgIcon} ${cfg.textIcon}`}>
              <Icon size={16} />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {cfg.badge}
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-slate-800 leading-none">
              {n}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1 truncate">
              {l}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);
