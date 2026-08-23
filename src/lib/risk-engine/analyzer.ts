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

export function analyzeOpportunity(
  input: OpportunityInput,
  extraSignals?: RiskSignal[]
): RiskAnalysis {
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

  // Merge any extra signals from Recruiter Verification / Content Intelligence
  if (extraSignals && extraSignals.length > 0) {
    for (const sig of extraSignals) {
      rawSignals.push(sig);
    }
  }

  // Deduplicate signals by id
  const signalMap = new Map<string, RiskSignal>();
  for (const sig of rawSignals) {
    // If we already have a signal with this ID, prefer higher points / more specific title
    if (!signalMap.has(sig.id)) {
      signalMap.set(sig.id, sig);
    } else {
      const existing = signalMap.get(sig.id)!;
      if (sig.points > existing.points) {
        signalMap.set(sig.id, sig);
      }
    }
  }

  // Duplicate signal prevention:
  // If payment-requested exists, only suppress generic suspicious-job-language if no other urgency/scam phrases exist
  if (signalMap.has("payment-requested") && signalMap.has("suspicious-job-language")) {
    const desc = (input.jobDescription || "").toLowerCase();
    const otherScamPhrases = [
      "limited seats",
      "act immediately",
      "urgent hiring",
      "guaranteed income",
      "no experience high salary",
      "earn money instantly",
      "telegram interview",
    ];
    const hasOtherPhrases = otherScamPhrases.some((p) => desc.includes(p));
    // If urgency-pressure-language is already explicitly present, we can safely delete redundant generic suspicious-job-language
    if (signalMap.has("urgency-pressure-language") || !hasOtherPhrases) {
      signalMap.delete("suspicious-job-language");
    }
  }

  const uniqueSignals = Array.from(signalMap.values());

  // Sort signals: high -> medium -> low, then by points descending
  const severityWeight = {
    high: 3,
    medium: 2,
    low: 1,
  };

  const sortedSignals = uniqueSignals.sort((a, b) => {
    const diff = severityWeight[b.severity] - severityWeight[a.severity];
    if (diff !== 0) return diff;
    return b.points - a.points;
  });

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

  // Dynamic recommendations based on active signals
  if (signalMap.has("payment-requested")) {
    specificRecommendations.push("Do not pay any registration, training, security, or processing fee.");
  }
  if (signalMap.has("recruiter-domain-mismatch") || signalMap.has("public-recruiter-email")) {
    specificRecommendations.push("Verify the recruiter through the company's official website.");
  }
  if (signalMap.has("identity-info-requested") || signalMap.has("financial-info-requested")) {
    specificRecommendations.push("Do not share identity or financial information until the employer is independently verified.");
  }
  if (signalMap.has("urgency-pressure-language")) {
    specificRecommendations.push("Do not allow time pressure to prevent independent verification.");
  }

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
