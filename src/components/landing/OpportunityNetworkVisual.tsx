"use client";

import { Building2, UserCheck, Globe, ShieldCheck, Check, Briefcase, FileSearch } from "lucide-react";

export default function OpportunityNetworkVisual() {
  return (
    <div className="relative w-full max-w-2xl mx-auto py-8 select-none">
      
      {/* SVG Connecting Vector Lines Background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none stroke-subtle"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Center to Top */}
        <line
          x1="50%"
          y1="50%"
          x2="50%"
          y2="14%"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className="opacity-70"
        />
        {/* Center to Bottom */}
        <line
          x1="50%"
          y1="50%"
          x2="50%"
          y2="86%"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className="opacity-70"
        />
        {/* Center to Left */}
        <line
          x1="50%"
          y1="50%"
          x2="15%"
          y2="50%"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className="hidden sm:block opacity-70"
        />
        {/* Center to Right */}
        <line
          x1="50%"
          y1="50%"
          x2="85%"
          y2="50%"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className="hidden sm:block opacity-70"
        />
      </svg>

      <div className="relative flex flex-col items-center justify-center min-h-[420px] gap-6">
        
        {/* 1. TOP NODE: Company */}
        <div className="z-10 bg-card border border-subtle rounded-xl p-3 shadow-soft flex items-center gap-2.5 animate-float-slow">
          <div className="w-7 h-7 rounded-lg bg-accent-light text-accent-primary flex items-center justify-center">
            <Building2 className="w-4 h-4" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-xs font-medium text-primary-color flex items-center gap-1">
              <span>Company validation</span>
              <Check className="w-3 h-3 text-accent-primary" strokeWidth={2.5} />
            </div>
            <div className="text-[10px] text-tertiary-color">
              Active corporate registry
            </div>
          </div>
        </div>

        {/* 2. MIDDLE ROW: Left Recruiter — Center Opportunity Card — Right Domain */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
          
          {/* Left Node: Recruiter */}
          <div className="w-full sm:w-auto bg-card border border-subtle rounded-xl p-3 shadow-soft flex items-center gap-2.5 animate-float-delayed">
            <div className="w-7 h-7 rounded-lg bg-accent-light text-accent-primary flex items-center justify-center">
              <UserCheck className="w-4 h-4" strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-xs font-medium text-primary-color flex items-center gap-1">
                <span>Recruiter identity</span>
                <Check className="w-3 h-3 text-accent-primary" strokeWidth={2.5} />
              </div>
              <div className="text-[10px] text-tertiary-color">
                Domain handle matched
              </div>
            </div>
          </div>

          {/* Center Main Opportunity Profile Document */}
          <div className="w-full sm:w-64 bg-card border-2 border-accent-light-border rounded-2xl p-5 shadow-card space-y-3 relative text-center">
            <div className="w-8 h-8 rounded-xl bg-accent-light text-accent-primary flex items-center justify-center mx-auto">
              <Briefcase className="w-4 h-4" strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-xs font-medium text-primary-color">
                Opportunity review
              </div>
              <div className="text-[11px] text-secondary-color mt-0.5 font-normal">
                Frontend Engineering Intern
              </div>
            </div>
            <div className="pt-2 border-t border-subtle flex items-center justify-center gap-1 text-[11px] font-medium text-accent-primary">
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
              <span>All 4 checks passed</span>
            </div>
          </div>

          {/* Right Node: Domain */}
          <div className="w-full sm:w-auto bg-card border border-subtle rounded-xl p-3 shadow-soft flex items-center gap-2.5 animate-float-slow">
            <div className="w-7 h-7 rounded-lg bg-accent-light text-accent-primary flex items-center justify-center">
              <Globe className="w-4 h-4" strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-xs font-medium text-primary-color flex items-center gap-1">
                <span>Domain history</span>
                <Check className="w-3 h-3 text-accent-primary" strokeWidth={2.5} />
              </div>
              <div className="text-[10px] text-tertiary-color">
                Valid SSL & DNS origin
              </div>
            </div>
          </div>

        </div>

        {/* 3. BOTTOM NODE: Signals */}
        <div className="z-10 bg-card border border-subtle rounded-xl p-3 shadow-soft flex items-center gap-2.5 animate-float-delayed">
          <div className="w-7 h-7 rounded-lg bg-accent-light text-accent-primary flex items-center justify-center">
            <FileSearch className="w-4 h-4" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-xs font-medium text-primary-color flex items-center gap-1">
              <span>Risk signal analysis</span>
              <Check className="w-3 h-3 text-accent-primary" strokeWidth={2.5} />
            </div>
            <div className="text-[10px] text-tertiary-color">
              Zero advance-fee patterns
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
