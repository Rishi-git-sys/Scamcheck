// ==============================================================================
// Phase 12: AI Analysis Types
// Explainable AI assistant types for opportunity analysis
// ==============================================================================

export type AIAnalysisQuality = "high" | "medium" | "limited";
export type AIStatus = "available" | "unavailable" | "error";

export interface AIConcern {
  title: string;
  explanation: string;
  severity: "low" | "medium" | "high";
}

export interface AIAnalysisInput {
  companyName?: string;
  jobTitle?: string;
  recruiterEmail?: string;
  recruiterName?: string;
  contactMethod?: string;
  paymentRequested?: boolean | null;
  paymentAmount?: string;
  urgencyDetected?: boolean;
  sensitiveInfoRequested?: boolean;
  financialInfoRequested?: boolean;
  officialApplicationEvidence?: boolean;
  detectedUrls?: string[];
  content?: string;
  deterministicScore?: number;
  deterministicLevel?: string;
  deterministicSignals?: string[];
}

export interface AIAnalysisResult {
  status: AIStatus;
  summary: string;
  concerns: AIConcern[];
  positiveEvidence: string[];
  missingEvidence: string[];
  recommendedActions: string[];
  contextAssessment: string;
  analysisQuality: AIAnalysisQuality;
  errorMessage?: string;
}

export interface AIProvider {
  name: string;
  isAvailable(): boolean;
  analyzeOpportunity(input: AIAnalysisInput): Promise<AIAnalysisResult>;
}
