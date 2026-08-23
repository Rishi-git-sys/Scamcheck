import { OpportunityInput, RiskAnalysis, RiskLevel, RiskSignal } from "./types";
import {
  checkPaymentRequested,
  checkTelegramRecruitment,
  checkWhatsAppRecruitment,
  checkPublicRecruiterEmail,
  checkMissingCompany,
  checkMissingJobDescription,
  checkSuspiciousUrl,
  checkSuspiciousJobLanguage,
  checkUnrealisticCompensation,
  checkMissingRecruiter,
} from "./rules";

export function analyzeOpportunity(input: OpportunityInput): RiskAnalysis {
  const rules = [
    checkPaymentRequested,
    checkTelegramRecruitment,
    checkWhatsAppRecruitment,
    checkPublicRecruiterEmail,
    checkMissingCompany,
    checkMissingJobDescription,
    checkSuspiciousUrl,
    checkSuspiciousJobLanguage,
    checkUnrealisticCompensation,
    checkMissingRecruiter,
  ];

  const rawSignals: RiskSignal[] = [];
  const specificRecommendations: string[] = [];

  for (const rule of rules) {
    const res = rule(input);
    if (res.signal) {
      rawSignals.push(res.signal);
    }
    if (res.recommendation) {
      specificRecommendations.push(res.recommendation);
    }
  }

  // Deduplicate signals by id
  const signalMap = new Map<string, RiskSignal>();
  for (const sig of rawSignals) {
    if (!signalMap.has(sig.id)) {
      signalMap.set(sig.id, sig);
    }
  }
  const uniqueSignals = Array.from(signalMap.values());

  // Sort signals: high -> medium -> low, preserving order
  const severityWeight = {
    high: 3,
    medium: 2,
    low: 1,
  };

  const sortedSignals = uniqueSignals.sort(
    (a, b) => severityWeight[b.severity] - severityWeight[a.severity]
  );

  // Sum points, cap at 100
  const rawScore = sortedSignals.reduce((sum, s) => sum + s.points, 0);
  const score = Math.min(rawScore, 100);

  // Determine Level and Summary
  let level: RiskLevel = "safe";
  let summary = "No major warning signals were detected from the information provided.";

  if (score >= 60) {
    level = "high";
    summary = "Multiple warning signals were detected. Proceed carefully and independently verify the opportunity.";
  } else if (score >= 30) {
    level = "review";
    summary = "Some warning signs were detected. Verify the opportunity before continuing.";
  }

  // Base general recommendations
  const baseRecommendations = [
    "Verify the company through its official website.",
    "Independently verify the recruiter.",
    "Never pay money to obtain a job or internship.",
    "Do not share sensitive banking or identity information until the employer is verified.",
  ];

  // Combine recommendations and deduplicate
  const allRecommendations = Array.from(
    new Set([...baseRecommendations, ...specificRecommendations])
  );

  return {
    score,
    level,
    summary,
    signals: sortedSignals,
    recommendations: allRecommendations,
  };
}
