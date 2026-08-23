"use client";

import React from "react";
import { UserCheck, Check, AlertTriangle, Info, Mail } from "lucide-react";
import { RecruiterReport } from "@/lib/report/types";

interface RecruiterReportSectionProps {
  recruiter: RecruiterReport;
}

export default function RecruiterReportSection({ recruiter }: RecruiterReportSectionProps) {
  const isConsistent = recruiter.status === "consistent";
  const isNeedsReview = recruiter.status === "needs_review";

  const badgeBg = isConsistent
    ? "bg-accent-light text-accent-primary border-accent-light"
    : isNeedsReview
    ? "bg-warning-light text-warning-color border-warning-light"
    : "bg-muted-custom text-secondary-color border-subtle";

  const badgeLabel = isConsistent
    ? "CONSISTENT"
    : isNeedsReview
    ? "NEEDS REVIEW"
    : recruiter.status === "limited"
    ? "LIMITED EVIDENCE"
    : "NOT AVAILABLE";

  return (
    <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-7 shadow-soft space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-accent-primary" strokeWidth={2} />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary-color">
            Recruiter verification
          </h2>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border uppercase ${badgeBg}`}>
          {badgeLabel}
        </span>
      </div>

      <div className="p-4 rounded-xl bg-muted-custom border border-subtle space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-tertiary-color block">
              Recruiter Details
            </span>
            <span className="font-semibold text-primary-color">
              {recruiter.recruiterName || "Name not specified"}
            </span>
          </div>

          {recruiter.recruiterEmail && (
            <div className="flex items-center gap-1.5 font-mono text-secondary-color">
              <Mail className="w-3.5 h-3.5 text-accent-primary" />
              <span>{recruiter.recruiterEmail}</span>
            </div>
          )}
        </div>

        {/* Verification Checkpoints */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-subtle/50">
          {recruiter.domainMatch !== null && recruiter.domainMatch !== undefined && (
            <div className="flex items-center gap-2 text-secondary-color">
              {recruiter.domainMatch ? (
                <Check className="w-3.5 h-3.5 text-accent-primary shrink-0" strokeWidth={2.5} />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-warning-color shrink-0" strokeWidth={2} />
              )}
              <span>{recruiter.domainMatch ? "Email domain matches company website" : "Email domain differs from company"}</span>
            </div>
          )}

          {recruiter.publicProvider !== null && recruiter.publicProvider !== undefined && (
            <div className="flex items-center gap-2 text-secondary-color">
              {recruiter.publicProvider ? (
                <AlertTriangle className="w-3.5 h-3.5 text-warning-color shrink-0" strokeWidth={2} />
              ) : (
                <Check className="w-3.5 h-3.5 text-accent-primary shrink-0" strokeWidth={2.5} />
              )}
              <span>{recruiter.publicProvider ? "Public email provider (Gmail/Yahoo)" : "Corporate email address"}</span>
            </div>
          )}
        </div>
      </div>

      {recruiter.reasons && recruiter.reasons.length > 0 && (
        <div className="space-y-1.5 pt-1 text-xs text-secondary-color">
          {recruiter.reasons.map((r, idx) => (
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
