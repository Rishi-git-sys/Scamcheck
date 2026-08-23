import { PieChart, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";

export default function RiskOverview() {
  const total = 24;
  const safe = 12;
  const review = 7;
  const highRisk = 5;

  const safePercent = Math.round((safe / total) * 100);
  const reviewPercent = Math.round((review / total) * 100);
  const highRiskPercent = Math.round((highRisk / total) * 100);

  return (
    <div className="rounded-2xl bg-[#090d16] border border-slate-800/80 p-5 sm:p-6 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Risk Overview
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Distribution of 24 analyzed items.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/20 px-2.5 py-0.5 rounded">
            TOTAL: 24
          </span>
        </div>

        {/* Visual Progress Stacked Bar */}
        <div className="space-y-2 mb-6">
          <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex p-0.5 border border-slate-800">
            <div
              style={{ width: `${safePercent}%` }}
              className="h-full bg-emerald-500 rounded-l-full"
              title={`Safe: ${safe} (${safePercent}%)`}
            />
            <div
              style={{ width: `${reviewPercent}%` }}
              className="h-full bg-amber-500"
              title={`Review: ${review} (${reviewPercent}%)`}
            />
            <div
              style={{ width: `${highRiskPercent}%` }}
              className="h-full bg-rose-500 rounded-r-full"
              title={`High Risk: ${highRisk} (${highRiskPercent}%)`}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>50% Safe</span>
            <span>29% Review</span>
            <span className="text-rose-400">21% High Risk</span>
          </div>
        </div>

        {/* Legend / Category Breakdown */}
        <div className="space-y-3">
          {/* Safe */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-300">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">Safe Opportunities</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="font-bold text-emerald-400">{safe}</span>
              <span className="text-[11px] text-slate-400">({safePercent}%)</span>
            </div>
          </div>

          {/* Review */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-950/20 border border-amber-900/30 text-amber-300">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-xs font-semibold text-slate-200">Needs Review</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="font-bold text-amber-400">{review}</span>
              <span className="text-[11px] text-slate-400">({reviewPercent}%)</span>
            </div>
          </div>

          {/* High Risk */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-950/20 border border-rose-900/30 text-rose-300">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="text-xs font-semibold text-slate-200">High Risk Scam Patterns</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="font-bold text-rose-400">{highRisk}</span>
              <span className="text-[11px] text-slate-400">({highRiskPercent}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
