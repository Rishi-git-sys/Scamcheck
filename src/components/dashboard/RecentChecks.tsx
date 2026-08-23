import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Building,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { VerificationRecord } from "@/types/dashboard";

export default function RecentChecks() {
  const recentRecords: VerificationRecord[] = [
    {
      id: "rec-1",
      company: "TechNova Solutions",
      opportunity: "Frontend Developer Intern",
      riskLevel: "Low Risk",
      riskScore: 18,
      status: "SAFE",
      date: "Today",
      domain: "technova.io",
      flagCount: 0,
    },
    {
      id: "rec-2",
      company: "Global Career Hub",
      opportunity: "Work From Home Data Entry",
      riskLevel: "High Risk",
      riskScore: 86,
      status: "HIGH RISK",
      date: "Yesterday",
      domain: "careerhub-telegram.xyz",
      flagCount: 3,
    },
    {
      id: "rec-3",
      company: "NextGen Labs",
      opportunity: "AI/ML Internship",
      riskLevel: "Medium Risk",
      riskScore: 54,
      status: "REVIEW",
      date: "2 days ago",
      domain: "nextgenlabs.co",
      flagCount: 1,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SAFE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            SAFE
          </span>
        );
      case "HIGH RISK":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-rose-950/60 border border-rose-500/30 text-rose-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            HIGH RISK
          </span>
        );
      case "REVIEW":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-amber-950/60 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            REVIEW
          </span>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 60) return "text-rose-400";
    if (score > 30) return "text-amber-400";
    return "text-emerald-400";
  };

  return (
    <div className="rounded-2xl bg-[#090d16] border border-slate-800/80 p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Recent Verification Checks
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit logs for the latest analyzed opportunities.
          </p>
        </div>
        <Link
          href="/dashboard/history"
          className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table / List */}
      <div className="space-y-3">
        {recentRecords.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-[#06080e] border border-slate-800/60 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            {/* Left: Company & Opportunity */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {item.company}
                </span>
                {item.domain && (
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {item.domain}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-300 font-medium">
                {item.opportunity}
              </div>
            </div>

            {/* Right: Score, Status & Date */}
            <div className="flex items-center justify-between sm:justify-end gap-5 sm:gap-6 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-800/60">
              {/* Score */}
              <div className="text-left sm:text-right">
                <div className="text-[10px] font-mono uppercase text-slate-400">
                  Risk Score
                </div>
                <div className="text-sm font-extrabold font-mono text-white">
                  <span className={getScoreColor(item.riskScore)}>
                    {item.riskScore}
                  </span>
                  <span className="text-slate-400 text-xs font-normal">
                    /100
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div>{getStatusBadge(item.status)}</div>

              {/* Date */}
              <div className="text-[11px] font-mono text-slate-400 min-w-[70px] text-right">
                {item.date}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
