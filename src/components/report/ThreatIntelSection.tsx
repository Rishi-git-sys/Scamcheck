"use client";

import React from "react";
import { Globe, Check, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { ThreatIntelReport } from "@/lib/report/types";

interface ThreatIntelSectionProps {
  threatIntel: ThreatIntelReport;
}

export default function ThreatIntelSection({ threatIntel }: ThreatIntelSectionProps) {
  if (threatIntel.status === "unavailable" && (!threatIntel.reasons || threatIntel.reasons.length === 0)) {
    return null;
  }

  const isClean = threatIntel.status === "clean";
  const isMalicious = threatIntel.status === "malicious";
  const isSuspicious = threatIntel.status === "suspicious";

  const badgeBg = isClean
    ? "bg-accent-light text-accent-primary border-accent-light"
    : isMalicious
    ? "bg-danger-light text-danger-color border-danger-light"
    : isSuspicious
    ? "bg-warning-light text-warning-color border-warning-light"
    : "bg-muted-custom text-secondary-color border-subtle";

  const badgeLabel = isClean
    ? "NO KNOWN THREATS"
    : isMalicious
    ? "KNOWN THREAT INDICATOR"
    : isSuspicious
    ? "SUSPICIOUS DOMAIN"
    : "NO REPUTATION DATA";

  return (
    <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-7 shadow-soft space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-accent-primary" strokeWidth={2} />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary-color">
            Threat intelligence
          </h2>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border uppercase ${badgeBg}`}>
          {badgeLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {threatIntel.rootDomain && (
          <div className="p-3 rounded-xl bg-muted-custom border border-subtle">
            <span className="text-[10px] uppercase font-semibold text-tertiary-color block">
              Analyzed Domain
            </span>
            <span className="text-primary-color font-mono font-medium block mt-0.5">
              {threatIntel.rootDomain}
            </span>
            {threatIntel.source && (
              <span className="text-[11px] text-tertiary-color block mt-0.5">
                Source: {threatIntel.source}
              </span>
            )}
          </div>
        )}

        {threatIntel.domainAgeYears !== null && threatIntel.domainAgeYears !== undefined && (
          <div className="p-3 rounded-xl bg-muted-custom border border-subtle">
            <span className="text-[10px] uppercase font-semibold text-tertiary-color block">
              Domain Age (RDAP)
            </span>
            <span className="text-primary-color font-medium block mt-0.5">
              {threatIntel.domainAgeYears} years
            </span>
            {threatIntel.creationDate && (
              <span className="text-[11px] text-tertiary-color block mt-0.5">
                Registered: {threatIntel.creationDate}
              </span>
            )}
          </div>
        )}
      </div>

      {threatIntel.reasons && threatIntel.reasons.length > 0 && (
        <div className="space-y-1.5 pt-1 text-xs text-secondary-color">
          {threatIntel.reasons.map((r, idx) => (
            <div key={idx} className="flex items-start gap-2">
              {isClean ? (
                <Check className="w-3.5 h-3.5 text-accent-primary shrink-0 mt-0.5" strokeWidth={2.5} />
              ) : isMalicious ? (
                <AlertCircle className="w-3.5 h-3.5 text-danger-color shrink-0 mt-0.5" strokeWidth={2} />
              ) : (
                <Info className="w-3.5 h-3.5 text-tertiary-color shrink-0 mt-0.5" strokeWidth={2} />
              )}
              <span>{r}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
