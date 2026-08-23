"use client";

import React, { useState } from "react";
import {
  Network,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface EntityConsistencyItem {
  entity: string;
  claimedValue: string;
  verifiedValue?: string;
  status: "consistent" | "needs_review" | "unverified";
  note: string;
}

interface EntityConsistencySectionProps {
  entities?: EntityConsistencyItem[];
}

export default function EntityConsistencySection({
  entities,
}: EntityConsistencySectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!entities || entities.length === 0) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "consistent":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-accent-light text-accent-primary border border-accent-light">
            <CheckCircle2 className="w-3 h-3" />
            <span>Consistent</span>
          </span>
        );
      case "needs_review":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-warning-light text-warning-color border border-warning-light">
            <AlertCircle className="w-3 h-3" />
            <span>Needs review</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted-custom text-tertiary-color border border-subtle">
            <HelpCircle className="w-3 h-3" />
            <span>Unverified</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-card border border-subtle rounded-2xl shadow-soft overflow-hidden transition-all duration-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left hover:bg-muted-custom/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-accent-light text-accent-primary shrink-0">
            <Network className="w-4 h-4" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary-color">
              Cross-Entity Consistency
            </h3>
            <p className="text-xs text-secondary-color">
              Automated comparison between claimed identity and outreach channels.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-tertiary-color">
          <span className="text-xs font-mono">{entities.length} entities</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-subtle space-y-2.5">
          {entities.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-muted-custom border border-subtle/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] font-semibold text-tertiary-color block">
                  {item.entity}
                </span>
                <span className="text-xs font-bold text-primary-color block truncate">
                  {item.claimedValue}
                </span>
                <p className="text-[11px] text-secondary-color">
                  {item.note}
                </p>
              </div>

              <div className="shrink-0 self-start sm:self-auto">
                {getStatusBadge(item.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
