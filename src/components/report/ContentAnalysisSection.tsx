"use client";

import React from "react";
import { MessageSquare, AlertTriangle, AlertCircle, Check } from "lucide-react";
import { ContentReport } from "@/lib/report/types";

interface ContentAnalysisSectionProps {
  content: ContentReport;
}

export default function ContentAnalysisSection({ content }: ContentAnalysisSectionProps) {
  if (content.findings.length === 0 && !content.officialApplicationEvidence) {
    return null;
  }

  return (
    <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-7 shadow-soft space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-accent-primary" strokeWidth={2} />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary-color">
            Content analysis
          </h2>
        </div>
      </div>

      <div className="space-y-2.5">
        {content.findings.map((f, idx) => {
          const isHigh = f.severity === "high";
          const cardBg = isHigh
            ? "bg-danger-light/40 border-danger-light"
            : "bg-warning-light/40 border-warning-light";
          const iconColor = isHigh ? "text-danger-color" : "text-warning-color";
          const IconComp = isHigh ? AlertCircle : AlertTriangle;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border ${cardBg} flex items-start justify-between gap-3 text-xs`}
            >
              <div className="flex items-start gap-2.5">
                <IconComp className={`w-4 h-4 ${iconColor} shrink-0 mt-0.5`} strokeWidth={2} />
                <div>
                  <span className="font-semibold text-primary-color block">
                    {f.title}
                  </span>
                  <span className="text-secondary-color block mt-0.5">
                    {f.description}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-background border border-subtle text-secondary-color shrink-0">
                {f.source === "screenshot" ? "📷 Screenshot" : "📝 Text"}
              </span>
            </div>
          );
        })}

        {content.officialApplicationEvidence && (
          <div className="p-3.5 rounded-xl bg-accent-light border border-accent-light text-accent-primary flex items-start gap-2.5 text-xs">
            <Check className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2.5} />
            <div>
              <span className="font-semibold block">Official Application Portal Referenced</span>
              <span className="text-secondary-color block mt-0.5">
                Communication directs the applicant to an official corporate hiring portal.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
