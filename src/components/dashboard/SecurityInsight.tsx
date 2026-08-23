import { ShieldAlert, Lightbulb, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SecurityInsight() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-cyan-950/30 via-slate-900/60 to-[#070a12] border border-cyan-500/30 p-5 sm:p-6 relative overflow-hidden">
      {/* Glow dot */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white tracking-tight">
              ScamCheck Insight
            </h4>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-900">
              SAFETY TIP
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Most suspicious opportunities contain multiple warning signals. Always verify the company domain and never pay money to secure an internship or job.
          </p>

          <div className="pt-1">
            <Link
              href="/dashboard/check"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>Test an opportunity now</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
