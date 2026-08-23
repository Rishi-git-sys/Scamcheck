import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  TrendingUp,
} from "lucide-react";

export default function StatsCard() {
  const stats = [
    {
      title: "Opportunities Checked",
      value: "24",
      change: "+12% this month",
      changeType: "positive",
      icon: FileCheck2,
      accentColor: "cyan",
      borderColor: "border-slate-800/80 hover:border-cyan-500/40",
      textColor: "text-white",
      badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    },
    {
      title: "High Risk",
      value: "5",
      change: "Threats intercepted",
      changeType: "danger",
      icon: ShieldAlert,
      accentColor: "rose",
      borderColor: "border-rose-900/30 hover:border-rose-500/40",
      textColor: "text-rose-400",
      badgeBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    },
    {
      title: "Medium Risk",
      value: "7",
      change: "Review required",
      changeType: "warning",
      icon: AlertTriangle,
      accentColor: "amber",
      borderColor: "border-amber-900/30 hover:border-amber-500/40",
      textColor: "text-amber-400",
      badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      title: "Low Risk",
      value: "12",
      change: "Verified safe",
      changeType: "success",
      icon: ShieldCheck,
      accentColor: "emerald",
      borderColor: "border-emerald-900/30 hover:border-emerald-500/40",
      textColor: "text-emerald-400",
      badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-[#090d16] border ${stat.borderColor} transition-all duration-200 shadow-sm flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                {stat.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center ${stat.badgeBg}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-3xl font-extrabold font-mono tracking-tight text-white mb-2">
                <span className={stat.textColor}>{stat.value}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                {stat.changeType === "positive" && (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                <span>{stat.change}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
