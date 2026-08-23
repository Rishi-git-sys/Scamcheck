// ==============================================================================
// Phase 10: Recruiter Verification Types
// Deterministic, explainable recruiter assessment
// ==============================================================================

import { RiskSignal } from "@/lib/risk-engine/types";

export type RecruiterVerificationStatus =
  | "consistent"
  | "needs_review"
  | "limited"
  | "not_available";

export interface RecruiterVerificationInput {
  recruiterName?: string;
  recruiterEmail?: string;
  phoneNumber?: string;
  contactMethod?: string;
  companyName?: string;
  companyWebsite?: string;
  opportunityUrl?: string;
}

export interface RecruiterVerificationResult {
  status: RecruiterVerificationStatus;
  recruiterName?: string;
  recruiterEmail?: string;
  emailDomain?: string;
  domainMatch?: boolean;
  publicProvider?: boolean;
  contactMethod?: string;
  reasons: string[];
  signals: RiskSignal[];
  recommendations: string[];
}
