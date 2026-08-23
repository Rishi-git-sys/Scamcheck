"use client";

import { ShieldCheck, Building2, UserCheck, Check, Globe, Sparkles, FileText, ArrowUpRight } from "lucide-react";

export default function HeroTrustVisual() {
  return (
    <div className="relative max-w-xl mx-auto w-full pt-4 pb-2 select-none">
      
      {/* Background Soft Ambient Light */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent-light/40 via-transparent to-transparent rounded-3xl -z-10 blur-xl opacity-70" />

      {/* Main Composite Card */}
      <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-7 shadow-card transition-all">
        
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-light border border-accent-light flex items-center justify-center text-accent-primary">
              <Building2 className="w-4 h-4" strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-xs font-medium text-primary-color flex items-center gap-1.5">
                <span>Apex Interactive Research</span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
              </div>
              <div className="text-[11px] text-tertiary-color font-mono">
                apexinteractive.org
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-accent-light border border-accent-light text-accent-primary px-2.5 py-1 rounded-full text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Safe to apply</span>
          </div>
        </div>

        {/* Center Opportunity Details */}
        <div className="py-5 space-y-3.5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-tertiary-color font-medium uppercase tracking-wider block">
                Verified opportunity
              </span>
              <h3 className="text-sm sm:text-base font-medium text-primary-color mt-0.5">
                Associate Research Intern — Summer 2026
              </h3>
            </div>
            <span className="text-xs text-secondary-color bg-muted-custom border border-subtle px-2.5 py-1 rounded-md">
              Full-time / Remote
            </span>
          </div>

          {/* Verification Pill Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-muted-custom border border-subtle flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-accent-light text-accent-primary flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" strokeWidth={2} />
              </div>
              <div className="text-[11px] leading-tight">
                <div className="font-medium text-primary-color">Corporate domain</div>
                <div className="text-tertiary-color">3+ yrs active</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-muted-custom border border-subtle flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-accent-light text-accent-primary flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" strokeWidth={2} />
              </div>
              <div className="text-[11px] leading-tight">
                <div className="font-medium text-primary-color">Verified recruiter</div>
                <div className="text-tertiary-color">Official handle</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-muted-custom border border-subtle flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-accent-light text-accent-primary flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" strokeWidth={2} />
              </div>
              <div className="text-[11px] leading-tight">
                <div className="font-medium text-primary-color">No upfront fee</div>
                <div className="text-tertiary-color">Compliant terms</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Decision Footer */}
        <div className="pt-3.5 border-t border-subtle flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-secondary-color">
            <span className="inline-block w-2 h-2 rounded-full bg-accent-primary" />
            <span>Passed 12 trust evaluation heuristics</span>
          </div>
          <span className="font-medium text-accent-primary">
            Risk rating: 4 / 100
          </span>
        </div>

      </div>

      {/* Floating Mini Decorative Badge (Top Right) */}
      <div className="hidden sm:flex absolute -top-2 -right-3 p-2.5 rounded-xl bg-card border border-subtle shadow-card items-center gap-2 animate-float-slow text-xs">
        <div className="w-5 h-5 rounded-md bg-accent-light text-accent-primary flex items-center justify-center">
          <Check className="w-3.5 h-3.5" strokeWidth={2} />
        </div>
        <span className="font-medium text-primary-color">Identity matched</span>
      </div>

      {/* Floating Mini Decorative Badge (Bottom Left) */}
      <div className="hidden sm:flex absolute -bottom-3 -left-3 p-2.5 rounded-xl bg-card border border-subtle shadow-card items-center gap-2 animate-float-delayed text-xs">
        <div className="w-5 h-5 rounded-md bg-accent-light text-accent-primary flex items-center justify-center">
          <FileText className="w-3.5 h-3.5" strokeWidth={2} />
        </div>
        <span className="font-medium text-primary-color">Clean offer terms</span>
      </div>

    </div>
  );
}
