"use client";

import Link from "next/link";
import { Shield, Sparkles, ArrowRight, CheckCircle, Zap, Eye, Lock } from "lucide-react";
import VerificationPreview from "./VerificationPreview";

export default function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Cyber Glow & Grid Effects */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-wider shadow-sm shadow-cyan-500/10">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-semibold uppercase">AI-POWERED SCAM DETECTION</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Don&apos;t Get Scammed. <br />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                Verify Before You Trust.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
              ScamCheck uses AI and intelligent risk analysis to help students and job seekers verify companies, recruiters, job offers, internships, and suspicious links before they become victims.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all active:scale-95"
              >
                <span>Check an Opportunity</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => scrollToSection("how-it-works")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white font-semibold text-sm sm:text-base transition-colors"
              >
                <span>How It Works</span>
              </button>
            </div>

            {/* Trust Indicator */}
            <div className="pt-4 border-t border-slate-800/80 max-w-xl">
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Fast Analysis</span>
                </div>
                <span className="text-slate-700">•</span>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Explainable Results</span>
                </div>
                <span className="text-slate-700">•</span>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Privacy First</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Verification Card */}
          <div className="lg:col-span-5">
            <VerificationPreview />
          </div>

        </div>
      </div>
    </section>
  );
}
