"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  FileText,
  Globe,
  ImageIcon,
  Building2,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { ReportSignal } from "@/lib/report/types";

interface RiskBreakdownProps {
  signals: ReportSignal[];
  riskScore: number;
  riskLevel: string;
}

export default function RiskBreakdown({
  signals,
  riskScore,
  riskLevel,
}: RiskBreakdownProps) {
  const [expandedSignalId, setExpandedSignalId] = useState<string | null>(null);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "screenshot":
        return <ImageIcon className="w-3.5 h-3.5 text-accent-primary" />;
      case "url":
        return <Globe className="w-3.5 h-3.5 text-accent-primary" />;
      case "company":
        return <Building2 className="w-3.5 h-3.5 text-accent-primary" />;
      case "recruiter":
        return <UserCheck className="w-3.5 h-3.5 text-accent-primary" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-secondary-color" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-danger-light text-danger-color border border-danger-light uppercase">
            High
          </span>
        );
      case "medium":
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-warning-light text-warning-color border border-warning-light uppercase">
            Medium
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted-custom text-tertiary-color border border-subtle uppercase">
            Low
          </span>
        );
    }
  };

  if (!signals || signals.length === 0) {
    return (
      <div className="bg-card border border-subtle rounded-2xl p-6 shadow-soft space-y-3">
        <div className="flex items-center gap-2 text-accent-primary">
          <CheckCircle2 className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary-color">
            Risk Score Breakdown
          </h3>
        </div>
        <p className="text-xs text-secondary-color leading-relaxed">
          No deterministic risk signals were triggered for this opportunity. The baseline risk score is{" "}
          <strong className="text-primary-color font-mono">{riskScore} / 100</strong>.
        </p>
      </div>
    );
  }

  // Calculate sum of positive signal contributions
  const totalSignalPoints = signals.reduce((sum, s) => sum + (s.points || 0), 0);

  return (
    <div className="bg-card border border-subtle rounded-2xl p-5 sm:p-6 shadow-soft space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-subtle pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-danger-color" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary-color">
              Risk score breakdown
            </h3>
          </div>
          <p className="text-xs text-secondary-color">
            Transparent breakdown of deterministic warning contributors.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-tertiary-color font-medium">Assessed score:</span>
          <span className="text-sm font-bold font-mono text-primary-color px-2 py-0.5 rounded-lg bg-muted-custom border border-subtle">
            {riskScore} / 100
          </span>
        </div>
      </div>

      {/* Table / List of Contributors */}
      <div className="space-y-2">
        {signals.map((sig) => {
          const isExpanded = expandedSignalId === sig.id;
          return (
            <div
              key={sig.id}
              className="rounded-xl bg-muted-custom border border-subtle/80 overflow-hidden transition-all duration-150"
            >
              {/* Row Header */}
              <button
                type="button"
                onClick={() => setExpandedSignalId(isExpanded ? null : sig.id)}
                className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-card/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 rounded-lg bg-card border border-subtle shrink-0">
                    {getSourceIcon(sig.source)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-primary-color block truncate">
                      {sig.title}
                    </span>
                    <span className="text-[10px] text-tertiary-color block">
                      Source: {sig.sourceLabel || sig.source}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {getSeverityBadge(sig.severity)}
                  <span className="text-xs font-mono font-bold text-danger-color min-w-[32px] text-right">
                    +{sig.points}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-tertiary-color" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-tertiary-color" />
                  )}
                </div>
              </button>

              {/* Expanded Description & Excerpt */}
              {isExpanded && (
                <div className="px-4 pb-3.5 pt-1 text-xs space-y-2 border-t border-subtle/40 bg-card/40">
                  <p className="text-secondary-color leading-relaxed">
                    {sig.description}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="flex items-center justify-between pt-2 text-xs text-tertiary-color font-medium">
        <span>{signals.length} active signal contributors</span>
        <span>
          Combined risk weight: <strong className="font-mono text-primary-color">{totalSignalPoints} pts</strong>
        </span>
      </div>
    </div>
  );
}
