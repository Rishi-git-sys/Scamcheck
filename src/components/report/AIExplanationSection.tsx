"use client";

import React from "react";
import { FileSearch, Check, Info, AlertTriangle } from "lucide-react";
import { AIReport } from "@/lib/report/types";

interface AIExplanationSectionProps {
  aiReport: AIReport;
  positiveEvidence: string[];
  missingEvidence: string[];
}

export default function AIExplanationSection({
  aiReport,
  positiveEvidence,
  missingEvidence,
}: AIExplanationSectionProps) {
  if (aiReport.status !== "available" && positiveEvidence.length === 0 && missingEvidence.length === 0) {
    return null;
  }

  const qualityLabel =
    aiReport.analysisQuality === "high"
      ? "High"
      : aiReport.analysisQuality === "medium"
      ? "Moderate"
      : "Limited";

  return (
    <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-7 shadow-soft space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSearch className="w-4 h-4 text-accent-primary" strokeWidth={2} />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary-color">
            AI-assisted analysis & context
          </h2>
        </div>
        {aiReport.analysisQuality && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted-custom border border-subtle text-secondary-color">
            Evidence Quality: {qualityLabel}
          </span>
        )}
      </div>

      <p className="text-[11px] text-tertiary-color leading-relaxed">
        AI analysis provides contextual interpretation of the evidence. The final risk assessment is determined by ScamCheck&apos;s deterministic verification rules.
      </p>

      {/* AI Summary */}
      {aiReport.summary && (
        <div className="p-4 rounded-xl bg-muted-custom border border-subtle text-xs text-primary-color leading-relaxed space-y-1">
          <span className="text-[10px] uppercase font-semibold text-tertiary-color tracking-wider block">
            Contextual Overview
          </span>
          <p>{aiReport.summary}</p>
        </div>
      )}

      {/* Why This Matters (Concerns) */}
      {aiReport.concerns && aiReport.concerns.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-xs font-semibold text-primary-color block">
            Why this matters
          </span>
          <div className="space-y-2">
            {aiReport.concerns.map((concern, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border text-xs ${
                  concern.severity === "high"
                    ? "bg-danger-light/30 border-danger-light"
                    : "bg-warning-light/30 border-warning-light"
                }`}
              >
                <span className="font-semibold text-primary-color block mb-1">
                  {concern.title}
                </span>
                <span className="text-secondary-color leading-relaxed block">
                  {concern.explanation}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observed Consistency & Missing Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
        {positiveEvidence.length > 0 && (
          <div className="p-3.5 rounded-xl bg-muted-custom border border-subtle space-y-2">
            <span className="text-[10px] uppercase font-semibold text-tertiary-color tracking-wider block">
              What looks consistent
            </span>
            <div className="space-y-1.5">
              {positiveEvidence.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-secondary-color text-xs">
                  <Check className="w-3.5 h-3.5 text-accent-primary shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {missingEvidence.length > 0 && (
          <div className="p-3.5 rounded-xl bg-muted-custom border border-subtle space-y-2">
            <span className="text-[10px] uppercase font-semibold text-tertiary-color tracking-wider block">
              What we could not verify
            </span>
            <div className="space-y-1.5">
              {missingEvidence.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-secondary-color text-xs">
                  <Info className="w-3.5 h-3.5 text-tertiary-color shrink-0 mt-0.5" strokeWidth={2} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
