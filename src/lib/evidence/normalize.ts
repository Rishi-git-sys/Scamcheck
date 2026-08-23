// ==============================================================================
// Normalize OpportunityEvidence → OpportunityInput
// All evidence types feed into the SAME existing risk engine.
// ==============================================================================

import { OpportunityEvidence } from "./types";
import { OpportunityInput } from "@/lib/risk-engine/types";

export function normalizeEvidenceToInput(evidence: OpportunityEvidence): OpportunityInput {
  return {
    inputType: "manual", // Uses the manual risk analysis path
    companyName: evidence.companyName,
    jobTitle: evidence.jobTitle,
    recruiterEmail: evidence.recruiterEmail,
    salaryText: evidence.salaryText || evidence.stipendText,
    contactMethod: evidence.contactMethod,
    paymentRequested: evidence.paymentRequested ?? null,
    jobDescription: evidence.jobDescription || evidence.rawText,
  };
}

export function getEvidenceTypeLabel(evidenceType: string): string {
  switch (evidenceType) {
    case "job": return "Job opportunity";
    case "internship": return "Internship offer";
    case "offer_letter": return "Offer letter";
    case "recruiter_message": return "Recruiter message";
    case "company": return "Company information";
    default: return "Opportunity information";
  }
}

export function getSourceTypeLabel(sourceType: string): string {
  switch (sourceType) {
    case "url": return "Opportunity URL";
    case "screenshot": return "Screenshot";
    case "text": return "Pasted text";
    default: return "Unknown source";
  }
}
