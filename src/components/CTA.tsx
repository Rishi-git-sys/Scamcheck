import Link from "next/link";
import { ArrowRight, ShieldCheck, Lock, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-[#06080d]">
      {/* Background glowing gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/20 to-blue-950/30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center rounded-3xl bg-gradient-to-b from-slate-900/90 to-[#0c121e] border border-cyan-500/30 p-8 sm:p-14 lg:p-16 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl relative overflow-hidden">
          
          {/* Subtle top badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SECURE YOUR NEXT CAREER STEP</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Before You Apply, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
              Check First.
            </span>
          </h2>

          {/* Subtext */}
          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            One verification could save your money, identity, and time.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-base shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
            >
              <span>Start Checking</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white font-semibold text-base transition-colors"
            >
              <span>Sign In to Dashboard</span>
            </Link>
          </div>

          {/* Trust points */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              Zero tracking of private resumes
            </span>
            <span>•</span>
            <span>No credit card required</span>
          </div>

        </div>
      </div>
    </section>
  );
}
