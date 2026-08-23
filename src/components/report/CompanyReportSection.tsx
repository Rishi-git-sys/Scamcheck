"use client";

import React from "react";
import { Building2, Check, AlertTriangle, Info, Globe } from "lucide-react";
import { CompanyReport } from "@/lib/report/types";

interface CompanyReportSectionProps {
  company: CompanyReport;
}

export default function CompanyReportSection({ company }: CompanyReportSectionProps) {
  const isConsistent = company.status === "consistent";
  const badgeBg = isConsistent
    ? "bg-accent-light text-accent-primary border-accent-light"
    : "bg-warning-light text-warning-color border-warning-light";

  return (
    <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-7 shadow-soft space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-accent-primary" strokeWidth={2} />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary-color">
            Company verification
          </h2>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border uppercase ${badgeBg}`}>
          {isConsistent ? "STRONG VERIFICATION EVIDENCE" : "NEEDS REVIEW"}
        </span>
      </div>

      <div className="p-4 rounded-xl bg-muted-custom border border-subtle space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-sm font-bold text-primary-color">
            {company.companyName}
          </span>
          {company.website && (
            <span className="text-xs font-mono text-tertiary-color flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {company.website}
            </span>
          )}
        </div>

        {/* Verification Checkpoints */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
          {company.isReachable !== undefined && (
            <div className="flex items-center gap-2 text-secondary-color">
              {company.isReachable ? (
                <Check className="w-3.5 h-3.5 text-accent-primary shrink-0" strokeWidth={2.5} />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-warning-color shrink-0" strokeWidth={2} />
              )}
              <span>{company.isReachable ? "Website online & reachable" : "Website unreachable"}</span>
            </div>
          )}

          {company.hasHttps !== undefined && (
            <div className="flex items-center gap-2 text-secondary-color">
              {company.hasHttps ? (
                <Check className="w-3.5 h-3.5 text-accent-primary shrink-0" strokeWidth={2.5} />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-warning-color shrink-0" strokeWidth={2} />
              )}
              <span>{company.hasHttps ? "HTTPS encrypted connection" : "Unencrypted HTTP"}</span>
            </div>
          )}

          {company.hasCareers !== undefined && (
            <div className="flex items-center gap-2 text-secondary-color">
              {company.hasCareers ? (
                <Check className="w-3.5 h-3.5 text-accent-primary shrink-0" strokeWidth={2.5} />
              ) : (
                <Info className="w-3.5 h-3.5 text-tertiary-color shrink-0" strokeWidth={2} />
              )}
              <span>{company.hasCareers ? "Careers section detected" : "No dedicated careers section"}</span>
            </div>
          )}

          {company.identityConsistent !== undefined && (
            <div className="flex items-center gap-2 text-secondary-color">
              {company.identityConsistent ? (
                <Check className="w-3.5 h-3.5 text-accent-primary shrink-0" strokeWidth={2.5} />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-warning-color shrink-0" strokeWidth={2} />
              )}
              <span>{company.identityConsistent ? "Domain matches brand identity" : "Domain identity unverified"}</span>
            </div>
          )}
        </div>
      </div>

      {company.reasons && company.reasons.length > 0 && (
        <div className="space-y-1.5 pt-1 text-xs text-secondary-color">
          {company.reasons.map((r, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-tertiary-color mt-0.5">•</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
