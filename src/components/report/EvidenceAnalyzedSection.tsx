"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Layers } from "lucide-react";
import { EvidenceSummary } from "@/lib/report/types";

interface EvidenceAnalyzedSectionProps {
  evidence: EvidenceSummary;
}

export default function EvidenceAnalyzedSection({ evidence }: EvidenceAnalyzedSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (evidence.fields.length === 0 && (!evidence.detectedUrls || evidence.detectedUrls.length === 0)) {
    return null;
  }

  return (
    <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-7 shadow-soft space-y-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent-primary" strokeWidth={2} />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary-color">
            Evidence analyzed
          </h2>
          <span className="text-[11px] text-tertiary-color">
            ({evidence.fields.length} detected fields)
          </span>
        </div>
        <div className="text-secondary-color hover:text-primary-color">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="space-y-4 pt-1 animate-in fade-in">
          {/* Structured Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {evidence.fields.map((field, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-muted-custom border border-subtle space-y-0.5"
              >
                <span className="text-[10px] uppercase font-semibold text-tertiary-color tracking-wider block">
                  {field.label}
                </span>
                <span className="text-xs font-medium text-primary-color break-words block">
                  {field.value}
                </span>
              </div>
            ))}
          </div>

          {/* Detected URLs */}
          {evidence.detectedUrls && evidence.detectedUrls.length > 0 && (
            <div className="p-3 rounded-xl bg-muted-custom border border-subtle text-xs space-y-1">
              <span className="text-[10px] uppercase font-semibold text-tertiary-color tracking-wider block">
                Detected Links / Opportunity URLs
              </span>
              <div className="space-y-1">
                {evidence.detectedUrls.map((url, idx) => (
                  <div key={idx} className="font-mono text-accent-primary break-all">
                    {url}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Excerpt */}
          {evidence.rawExcerpt && (
            <div className="p-3 rounded-xl bg-muted-custom/60 border border-subtle text-xs space-y-1">
              <span className="text-[10px] uppercase font-semibold text-tertiary-color tracking-wider block">
                Submitted Message Excerpt
              </span>
              <p className="text-secondary-color leading-relaxed font-mono text-[11px] max-h-32 overflow-y-auto whitespace-pre-wrap">
                {evidence.rawExcerpt}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
