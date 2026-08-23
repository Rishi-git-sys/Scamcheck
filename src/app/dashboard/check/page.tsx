"use client";

import { Suspense } from "react";
import VerificationForm from "@/components/verification/VerificationForm";

function CheckPageContent() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-1">
        <span className="text-xs text-tertiary-color font-medium block">
          Workspace / New check
        </span>
        <h1 className="text-2xl font-medium tracking-tight text-primary-color">
          Check an opportunity
        </h1>
        <p className="text-sm text-secondary-color">
          Review a job or internship before you trust it.
        </p>
      </div>

      {/* Verification Form */}
      <VerificationForm />
    </div>
  );
}

export default function CheckOpportunityPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto py-12 text-xs text-tertiary-color">
          Loading verification workspace...
        </div>
      }
    >
      <CheckPageContent />
    </Suspense>
  );
}
