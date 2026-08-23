// ==============================================================================
// Phase 14: Unified ScamCheck Verification Report Data Model
// Normalized, traceable, evidence-backed report schema
// ==============================================================================

import { RiskLevel, VerificationCoverage } from "@/lib/risk-engine/types";

export type EvidenceSourceType =
  | "url"
  | "screenshot"
  | "text"
  | "manual"
  | "company"
  | "recruiter"
  | "content"
  | "threat_intel"
  | "ai";

export interface ReportSignal {
  id: string;
  title: string;
  severity: "low" | "medium" | "high";
  description: string;
  points: number;
  source: EvidenceSourceType;
  sourceLabel: string;
}

export interface EvidenceField {
  label: string;
  value: string;
  source?: EvidenceSourceType;
}

export interface EvidenceSummary {
  sourceType: string;
  evidenceType?: string;
  quality: VerificationCoverage;
  ocrConfidence?: number | null;
  fields: EvidenceField[];
  detectedUrls: string[];
  rawExcerpt?: string;
}

export interface CompanyReport {
  companyName: string;
  website?: string | null;
  status: "consistent" | "needs_review" | "unverified" | "unavailable";
  coverage: VerificationCoverage;
  isReachable?: boolean;
  hasHttps?: boolean;
  hasCareers?: boolean;
  hasContact?: boolean;
  identityConsistent?: boolean;
  reasons: string[];
}

export interface RecruiterReport {
  status: "consistent" | "needs_review" | "limited" | "not_available";
  recruiterName?: string | null;
  recruiterEmail?: string | null;
  emailDomain?: string | null;
  domainMatch?: boolean | null;
  publicProvider?: boolean | null;
  contactMethod?: string | null;
  reasons: string[];
}

export interface ContentFinding {
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  source: EvidenceSourceType;
}

export interface ContentReport {
  paymentRequested: boolean;
  paymentAmount?: string | null;
  sensitiveInfoRequested: boolean;
  financialInfoRequested: boolean;
  urgencyDetected: boolean;
  unrealisticCompensation: boolean;
  guaranteedEmployment: boolean;
  informalContact?: string | null;
  officialApplicationEvidence: boolean;
  findings: ContentFinding[];
  detectedPhrases: string[];
}

export interface ThreatIntelReport {
  status: "clean" | "suspicious" | "malicious" | "unknown" | "unavailable";
  hostname?: string;
  rootDomain?: string;
  source?: string | null;
  domainAgeYears?: number | null;
  creationDate?: string | null;
  isRecentlyRegistered?: boolean;
  checkedAt?: string;
  reasons: string[];
}

export interface AIConcernReport {
  title: string;
  explanation: string;
  severity: "low" | "medium" | "high";
}

export interface AIReport {
  status: "available" | "unavailable" | "error";
  summary: string;
  concerns: AIConcernReport[];
  positiveEvidence: string[];
  missingEvidence: string[];
  recommendedActions: string[];
  contextAssessment?: string;
  analysisQuality?: "high" | "medium" | "limited";
}

export interface ScamCheckReport {
  id: string;
  createdAt: string;
  inputType: string;
  url?: string | null;

  // 1. Primary Risk Assessment
  riskScore: number;
  riskLevel: RiskLevel;
  riskLevelLabel: string;
  verificationCoverage: VerificationCoverage;
  coverageLabel: string;
  coverageExplanation: string;
  assessmentSummary: string;

  // Phase 17 Advanced Intelligence & Correlation
  confidenceLevel?: "high" | "medium" | "low";
  confidenceLabel?: string;
  correlationSummary?: string;
  correlatedFindings?: Array<{
    id: string;
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
    clusterTypes: string[];
    evidenceExcerpt?: string;
  }>;
  entityConsistency?: Array<{
    entity: string;
    claimedValue: string;
    verifiedValue?: string;
    status: "consistent" | "needs_review" | "unverified";
    note: string;
  }>;
  isInsufficientEvidence?: boolean;

  // 2. Prioritized Key Warning Signals
  signals: ReportSignal[];

  // 3. Evidence Analyzed
  evidence: EvidenceSummary;

  // 4. Verification Layers
  company?: CompanyReport | null;
  recruiter?: RecruiterReport | null;
  content?: ContentReport | null;
  threatIntelligence?: ThreatIntelReport | null;
  aiAnalysis?: AIReport | null;

  // 5. Positive & Missing Evidence
  positiveEvidence: string[];
  missingEvidence: string[];

  // 6. Actionable Next Steps
  recommendations: string[];

  // 7. Shareable Summary Text
  shareableSummaryText: string;
}
