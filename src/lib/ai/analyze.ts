// ==============================================================================
// Phase 12: AI Analysis Controller
// Redacts sensitive data and orchestrates AI opportunity analysis
// ==============================================================================

import { AIAnalysisInput, AIAnalysisResult, AIProvider } from "./types";
import { StandardAIProvider } from "./provider";
import { redactSensitiveData } from "@/lib/security/redact";

let defaultProvider: AIProvider = new StandardAIProvider();

/**
 * Set custom AI provider if needed (for dependency injection or testing).
 */
export function setAIProvider(provider: AIProvider) {
  defaultProvider = provider;
}

/**
 * Run AI opportunity analysis with mandatory data redaction and safe error handling.
 */
export async function analyzeOpportunityWithAI(
  input: AIAnalysisInput
): Promise<AIAnalysisResult> {
  // 1. Mandatory Sensitive Data Redaction
  const redactedContent = input.content ? redactSensitiveData(input.content).redactedText : undefined;
  const redactedJobTitle = input.jobTitle ? redactSensitiveData(input.jobTitle).redactedText : undefined;
  const redactedCompanyName = input.companyName ? redactSensitiveData(input.companyName).redactedText : undefined;
  const redactedRecruiterName = input.recruiterName ? redactSensitiveData(input.recruiterName).redactedText : undefined;

  const sanitizedInput: AIAnalysisInput = {
    ...input,
    content: redactedContent,
    jobTitle: redactedJobTitle,
    companyName: redactedCompanyName,
    recruiterName: redactedRecruiterName,
  };

  try {
    return await defaultProvider.analyzeOpportunity(sanitizedInput);
  } catch (err: any) {
    console.error("[ai-analysis] Error during AI execution:", err?.message);
    return {
      status: "unavailable",
      summary: "AI analysis is currently unavailable. Your risk assessment is based on deterministic verification signals.",
      concerns: [],
      positiveEvidence: [],
      missingEvidence: [],
      recommendedActions: ["Independently verify the employer through their official corporate website."],
      contextAssessment: "Deterministic verification rules remain active and authoritative.",
      analysisQuality: "limited",
      errorMessage: err?.message,
    };
  }
}
