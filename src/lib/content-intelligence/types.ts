// ==============================================================================
// Phase 11: Content Intelligence Types
// Deterministic NLP-free text pattern intelligence and risk categorization
// ==============================================================================

import { RiskSignal } from "@/lib/risk-engine/types";

export type ContentRiskCategory =
  | "payment"
  | "financial_request"
  | "identity_request"
  | "urgency"
  | "unrealistic_compensation"
  | "guaranteed_employment"
  | "informal_contact"
  | "recruitment_fee"
  | "official_application";

export interface ContentIntelligenceResult {
  paymentRequested: boolean;
  paymentAmount?: string;
  sensitiveInfoRequested: boolean;
  financialInfoRequested: boolean;
  urgencyDetected: boolean;
  unrealisticCompensation: boolean;
  guaranteedEmployment: boolean;
  informalContact?: string;
  officialApplicationEvidence: boolean;
  categories: ContentRiskCategory[];
  detectedPhrases: string[];
  signals: RiskSignal[];
  recommendations: string[];
}
