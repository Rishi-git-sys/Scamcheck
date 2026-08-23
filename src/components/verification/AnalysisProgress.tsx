"use client";

import { useEffect, useState } from "react";

interface AnalysisProgressProps {
  onComplete?: () => void;
}

export default function AnalysisProgress({ onComplete }: AnalysisProgressProps) {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    "Reviewing submitted information",
    "Checking risk indicators",
    "Calculating risk score",
    "Preparing assessment",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          if (onComplete) onComplete();
          return prev;
        }
        return prev + 1;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [onComplete, steps.length]);

  return (
    <div className="py-12 text-center space-y-5 animate-in fade-in duration-200">
      <div className="w-9 h-9 mx-auto rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
      <div className="space-y-1.5">
        <h3 className="text-sm font-medium text-primary-color">
          Analyzing opportunity...
        </h3>
        <p className="text-xs text-secondary-color font-mono">
          {steps[stepIndex]}...
        </p>
      </div>
      <p className="text-[11px] text-tertiary-color">
        Evaluating submitted attributes against explainable risk heuristics
      </p>
    </div>
  );
}
