"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Printer,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import { ScamCheckReport } from "@/lib/report/types";

interface RiskHeaderProps {
  report: ScamCheckReport;
}

export default function RiskHeader({ report }: RiskHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(report.shareableSummaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Severity styles
  const isHighRisk = report.riskLevel === "high";
  const isReview = report.riskLevel === "review";
  const isSafe = report.riskLevel === "safe";

  const levelBg = isHighRisk
    ? "bg-danger-light text-danger-color border-danger-light"
    : isReview
    ? "bg-warning-light text-warning-color border-warning-light"
    : "bg-accent-light text-accent-primary border-accent-light";

  const barColor = isHighRisk
    ? "bg-danger-color"
    : isReview
    ? "bg-warning-color"
    : "bg-accent-primary";

  const confidenceBadgeBg =
    report.confidenceLevel === "high"
      ? "bg-accent-light text-accent-primary border-accent-light"
      : report.confidenceLevel === "medium"
      ? "bg-muted-custom text-primary-color border-subtle"
      : "bg-warning-light text-warning-color border-warning-light";

  return (
    <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-8 shadow-soft space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-subtle pb-5">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-accent-primary" strokeWidth={2.2} />
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary-color block">
              ScamCheck Verification Report
            </span>
            <span className="text-[11px] text-tertiary-color font-mono">
              ID: {report.id.slice(0, 18)} • {new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action Buttons (Print & Share) */}
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-subtle bg-background hover:bg-muted-custom text-xs font-medium text-secondary-color hover:text-primary-color transition-colors"
            title="Copy concise text summary to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-accent-primary" strokeWidth={2.5} />
                <span className="text-accent-primary">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Copy summary</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-subtle bg-background hover:bg-muted-custom text-xs font-medium text-secondary-color hover:text-primary-color transition-colors"
            title="Print or save as PDF"
          >
            <Printer className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Print report</span>
          </button>
        </div>
      </div>

      {/* Primary Assessment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Risk Score & Level Box */}
        <div className="md:col-span-5 p-5 rounded-2xl bg-muted-custom border border-subtle space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-secondary-color">
              Risk Assessment
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${levelBg}`}>
              {report.riskLevelLabel}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight text-primary-color font-mono">
              {report.riskScore}
            </span>
            <span className="text-sm font-medium text-tertiary-color">/ 100</span>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-1.5">
            <div className="h-2.5 w-full bg-background rounded-full overflow-hidden border border-subtle">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${Math.max(4, Math.min(100, report.riskScore))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-tertiary-color font-mono">
              <span>0 (Low Risk)</span>
              <span>30 (Review)</span>
              <span>60 (High Risk)</span>
            </div>
          </div>
        </div>

        {/* Coverage & Executive Summary */}
        <div className="md:col-span-7 space-y-4">
          {/* Coverage & Confidence Badges */}
          <div className="p-4 rounded-xl bg-muted-custom/60 border border-subtle space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary-color">
                <Layers className="w-3.5 h-3.5 text-accent-primary" />
                <span>Verification Confidence</span>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${confidenceBadgeBg}`}>
                {report.confidenceLabel || "Moderate confidence"}
              </span>
            </div>
            <p className="text-[11px] text-tertiary-color leading-relaxed">
              {report.coverageExplanation}
            </p>
          </div>

          {/* Assessment Summary */}
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary-color block">
              Assessment Summary
            </span>
            <p className="text-sm text-primary-color leading-relaxed">
              {report.assessmentSummary}
            </p>
          </div>
        </div>
      </div>

      {/* Why We Flagged This / Correlated Signal Synthesis Banner */}
      {report.correlationSummary && report.signals && report.signals.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-accent-light/40 border border-accent-light space-y-2">
          <div className="flex items-center gap-2 text-accent-primary">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary-color">
              Why we flagged this opportunity
            </h3>
          </div>
          <p className="text-xs text-secondary-color leading-relaxed">
            {report.correlationSummary}
          </p>
        </div>
      )}
    </div>
  );
}
