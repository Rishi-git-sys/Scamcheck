"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Globe, Shield, ArrowRight, Sparkles, Terminal } from "lucide-react";

export default function VerificationCard() {
  const router = useRouter();
  const [url, setUrl] = useState("");

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    // Route to /dashboard/check
    if (url.trim()) {
      router.push(`/dashboard/check?url=${encodeURIComponent(url.trim())}`);
    } else {
      router.push("/dashboard/check");
    }
  };

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-[#0c121e] via-[#090d17] to-[#070a12] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl shadow-cyan-950/20 overflow-hidden">
      {/* Background glow lines */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-blue-600/10 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="relative z-10 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Verify an Opportunity
              </h2>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>INSTANT AI SCANNER</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          Paste a job or internship URL and ScamCheck will analyze potential risk signals.
        </p>

        {/* Form Input */}
        <form onSubmit={handleAnalyze} className="pt-1">
          <div className="relative flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <Globe className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://company.com/internship"
                className="w-full pl-11 pr-4 py-3.5 bg-[#05070c] border border-slate-700/80 focus:border-cyan-400 rounded-xl text-sm sm:text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Analyze</span>
            </button>
          </div>
        </form>

        {/* Supported Types Subtext */}
        <div className="pt-2 flex items-center gap-2 text-xs font-mono text-slate-400">
          <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Supported: Job URLs • Internship URLs • Company Websites</span>
        </div>
      </div>
    </div>
  );
}
