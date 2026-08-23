"use client";

import React from "react";
import { CheckSquare, ArrowRight } from "lucide-react";

interface ActionRecommendationsProps {
  recommendations: string[];
}

export default function ActionRecommendations({ recommendations }: ActionRecommendationsProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-8 shadow-soft space-y-4">
      <div className="flex items-center gap-2">
        <CheckSquare className="w-4 h-4 text-accent-primary" strokeWidth={2.2} />
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary-color">
          What you should do
        </h2>
      </div>

      <div className="space-y-2.5">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-muted-custom border border-subtle flex items-start gap-3 text-xs"
          >
            <div className="w-5 h-5 rounded-full bg-accent-light border border-accent-light text-accent-primary flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
              {idx + 1}
            </div>
            <span className="text-primary-color leading-relaxed font-medium">
              {rec}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
