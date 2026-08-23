"use client";

import React from "react";
import { AlertCircle, AlertTriangle, Info, ShieldCheck } from "lucide-react";
import { ReportSignal } from "@/lib/report/types";

interface WarningSignalsSectionProps {
  signals: ReportSignal[];
}

export default function WarningSignalsSection({ signals }: WarningSignalsSectionProps) {
  if (signals.length === 0) {
    return (
      <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-7 shadow-soft space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-accent-primary" strokeWidth={2} />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary-color">
            Warning Signals
          </h2>
        </div>
        <div className="p-4 rounded-xl bg-accent-light border border-accent-light text-accent-primary text-xs">
          <span className="font-semibold block mb-0.5">No major warning signals detected</span>
          <span className="text-secondary-color">
            The analyzed evidence did not trigger any known recruitment scam patterns. Continue standard career due diligence.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-8 shadow-soft space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary-color">
            Why we&apos;re flagging this
          </h2>
          <p className="text-xs text-secondary-color mt-0.5">
            Key warning signals identified across verified evidence layers ({signals.length} total)
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {signals.map((sig) => {
          const isHigh = sig.severity === "high";
          const isMedium = sig.severity === "medium";

          const cardBg = isHigh
            ? "bg-danger-light/40 border-danger-light"
            : isMedium
            ? "bg-warning-light/40 border-warning-light"
            : "bg-muted-custom border-subtle";

          const badgeBg = isHigh
            ? "bg-danger-light text-danger-color border-danger-light"
            : isMedium
            ? "bg-warning-light text-warning-color border-warning-light"
            : "bg-muted-custom text-secondary-color border-subtle";

          const IconComponent = isHigh ? AlertCircle : isMedium ? AlertTriangle : Info;
          const iconColor = isHigh
            ? "text-danger-color"
            : isMedium
            ? "text-warning-color"
            : "text-secondary-color";

          return (
            <div
              key={sig.id}
              className={`p-4 rounded-xl border ${cardBg} transition-all space-y-2`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <IconComponent className={`w-4 h-4 ${iconColor} shrink-0 mt-0.5`} strokeWidth={2.2} />
                  <div>
                    <span className="text-xs font-bold text-primary-color block">
                      {sig.title}
                    </span>
                    <p className="text-xs text-secondary-color leading-relaxed mt-0.5">
                      {sig.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                  {/* Source Provenance Badge */}
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-background border border-subtle text-secondary-color">
                    {sig.sourceLabel}
                  </span>

                  {/* Severity Badge */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${badgeBg}`}>
                    {sig.severity}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
