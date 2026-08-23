"use client";

import { useState } from "react";
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Globe,
  FileText,
  UserCheck,
  CreditCard,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function VerificationPreview() {
  const [urlInput, setUrlInput] = useState(
    "https://careers-global-tech.xyz/internships/apply-wire-fee"
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleQuickAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 600);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
      {/* Background glow behind card */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-sky-400/20 rounded-2xl blur-xl opacity-70 -z-10 group-hover:opacity-100 transition duration-500" />

      {/* Main futuristic verification panel */}
      <div className="relative rounded-2xl bg-[#090d16]/90 border border-slate-700/60 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80 ring-4 ring-red-500/10 animate-ping duration-1000" />
            <span className="text-sm font-semibold tracking-wide text-white uppercase font-mono">
              Live Threat Inspector
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>ENGINE v2.4</span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Verify an Opportunity
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspect internship postings, job offer URLs, recruiter emails, or suspicious domains.
          </p>
        </div>

        {/* Input & Action Form */}
        <form onSubmit={handleQuickAnalyze} className="space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Globe className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste a job or internship URL"
              className="w-full pl-10 pr-24 py-3 bg-[#05070c] border border-slate-700/70 focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
            />
            <button
              type="submit"
              disabled={isAnalyzing}
              className="absolute inset-y-1.5 right-1.5 px-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer disabled:opacity-80"
            >
              {isAnalyzing ? (
                <>
                  <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Analyze Risk</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Signals Checklist */}
        <div className="mt-5 space-y-2.5">
          <div className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Detected Signals</span>
            <span className="text-[11px] text-cyan-400/80">4 Indicators Analyzed</span>
          </div>

          <div className="space-y-2 text-xs sm:text-[13px]">
            {/* Signal 1 */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-emerald-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium text-slate-200">Company domain detected</span>
              </div>
              <span className="font-mono text-[11px] text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded">
                VALID DNS
              </span>
            </div>

            {/* Signal 2 */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-emerald-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium text-slate-200">Job description analyzed</span>
              </div>
              <span className="font-mono text-[11px] text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded">
                EXTRACTED
              </span>
            </div>

            {/* Signal 3 */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-950/25 border border-amber-800/40 text-amber-300">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-medium text-slate-200">Recruiter identity requires verification</span>
              </div>
              <span className="font-mono text-[11px] text-amber-400 bg-amber-900/40 px-2 py-0.5 rounded">
                UNVERIFIED
              </span>
            </div>

            {/* Signal 4 */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-300">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-medium text-slate-200">Payment request detected</span>
              </div>
              <span className="font-mono text-[11px] text-rose-400 bg-rose-900/40 px-2 py-0.5 rounded">
                RED FLAG
              </span>
            </div>
          </div>
        </div>

        {/* Risk Score Display */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 bg-gradient-to-br from-rose-950/30 to-transparent p-4 rounded-xl border border-rose-900/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono font-medium text-slate-400 uppercase">
                Risk Score
              </div>
              <div className="text-3xl font-extrabold font-mono text-white tracking-tight mt-0.5 flex items-baseline gap-1.5">
                <span className="text-rose-400">82</span>
                <span className="text-sm font-normal text-slate-400">/ 100</span>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-300 text-xs font-bold font-mono uppercase tracking-wider shadow-sm shadow-rose-900/30">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                HIGH RISK
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-sans">
                Potential financial scam pattern
              </div>
            </div>
          </div>

          {/* Risk Level Gauge Bar */}
          <div className="mt-3.5">
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
              <div className="h-full bg-emerald-500 w-[20%]" />
              <div className="h-full bg-amber-500 w-[30%]" />
              <div className="h-full bg-rose-500 w-[50%] relative">
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>Safe (0-30)</span>
              <span>Moderate (31-60)</span>
              <span className="text-rose-400 font-semibold">High Risk (61-100)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
