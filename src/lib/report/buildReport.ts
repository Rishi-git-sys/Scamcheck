// ==============================================================================
// Phase 14: Unified ScamCheck Report Builder
// Transforms raw database record, metadata JSONB, and signals into a normalized report
// ==============================================================================

import {
  ScamCheckReport,
  ReportSignal,
  EvidenceSummary,
  EvidenceField,
  EvidenceSourceType,
  CompanyReport,
  RecruiterReport,
  ContentReport,
  ContentFinding,
  ThreatIntelReport,
  AIReport,
} from "./types";
import { RiskLevel, VerificationCoverage } from "@/lib/risk-engine/types";
import { correlateSignals } from "@/lib/risk/correlateSignals";

interface RawVerificationRecord {
  id: string;
  created_at?: string;
  input_type?: string;
  url?: string | null;
  company_name?: string | null;
  job_title?: string | null;
  recruiter_email?: string | null;
  salary_text?: string | null;
  contact_method?: string | null;
  payment_requested?: boolean | null;
  job_description?: string | null;
  risk_score: number;
  risk_level: string;
  summary?: string | null;
  recommendations?: string[] | null;
  metadata?: Record<string, any> | null;
  risk_signals?: Array<{
    id?: string;
    signal_id?: string;
    title: string;
    description: string;
    severity: string;
    points?: number;
    rule_id?: string;
  }>;
}

/**
 * Maps risk level string to standard RiskLevel type.
 */
function normalizeRiskLevel(level: string): RiskLevel {
  const l = (level || "").toLowerCase();
  if (l.includes("high") || l === "danger") return "high";
  if (l.includes("review") || l.includes("medium") || l === "warning") return "review";
  return "safe";
}

/**
 * Returns human-readable label for risk level.
 */
function getRiskLevelLabel(level: RiskLevel): string {
  switch (level) {
    case "high":
      return "HIGH RISK";
    case "review":
      return "REVIEW";
    case "safe":
    default:
      return "LOW RISK";
  }
}

/**
 * Determines appropriate source badge for a risk signal.
 */
function determineSignalSource(
  signalId: string,
  sourceType: string
): { source: EvidenceSourceType; sourceLabel: string } {
  const id = (signalId || "").toLowerCase();

  if (id.includes("malicious") || id.includes("reputation") || id.includes("registered-domain")) {
    return { source: "threat_intel", sourceLabel: "🛡️ Threat Intel" };
  }
  if (id.includes("recruiter") || id.includes("email-domain")) {
    return { source: "recruiter", sourceLabel: "👤 Recruiter" };
  }
  if (id.includes("company") || id.includes("brand")) {
    return { source: "company", sourceLabel: "🏢 Company" };
  }

  if (sourceType === "screenshot") {
    return { source: "screenshot", sourceLabel: "📷 Screenshot" };
  }
  if (sourceType === "url") {
    return { source: "url", sourceLabel: "🔗 Opportunity URL" };
  }
  return { source: "text", sourceLabel: "📝 Pasted Text" };
}

/**
 * Build the unified ScamCheck verification report.
 */
export function buildScamCheckReport(raw: RawVerificationRecord): ScamCheckReport {
  const metadata = raw.metadata || {};
  const sourceType = metadata.sourceType || (raw.input_type === "url" ? "url" : "text");
  const riskLevel = normalizeRiskLevel(raw.risk_level);
  const riskLevelLabel = getRiskLevelLabel(riskLevel);

  // 1. Coverage calculation & explanation
  const rawCoverage = metadata.evidenceQuality || metadata.coverage || "medium";
  const verificationCoverage: VerificationCoverage =
    rawCoverage === "high" || rawCoverage === "medium" || rawCoverage === "low" || rawCoverage === "insufficient"
      ? rawCoverage
      : "medium";

  const coverageLabel =
    verificationCoverage === "high"
      ? "HIGH COVERAGE"
      : verificationCoverage === "medium"
      ? "MEDIUM COVERAGE"
      : verificationCoverage === "low"
      ? "LOW COVERAGE"
      : "INSUFFICIENT COVERAGE";

  let coverageExplanation = "";
  if (verificationCoverage === "insufficient" || verificationCoverage === "low") {
    coverageExplanation =
      "Coverage reflects how much independently verifiable evidence was available. Low coverage indicates limited data, not necessarily low risk.";
  } else {
    coverageExplanation =
      "Coverage reflects how much independently verifiable evidence ScamCheck analyzed across company, recruiter, and content layers.";
  }

  // 2. Prioritized Key Warning Signals
  const rawSignals = raw.risk_signals || [];
  const signalsMap = new Map<string, ReportSignal>();

  for (const sig of rawSignals) {
    const sigId = sig.signal_id || sig.id || sig.rule_id || sig.title.toLowerCase().replace(/\s+/g, "-");
    const severity = (sig.severity || "medium").toLowerCase() as "low" | "medium" | "high";
    const points = sig.points !== undefined ? sig.points : severity === "high" ? 30 : severity === "medium" ? 15 : 5;
    const { source, sourceLabel } = determineSignalSource(sigId, sourceType);

    if (!signalsMap.has(sigId)) {
      signalsMap.set(sigId, {
        id: sigId,
        title: sig.title,
        severity,
        description: sig.description,
        points,
        source,
        sourceLabel,
      });
    }
  }

  // Sort: High severity first, then medium, then low. Within severity: higher points first.
  const severityRank = { high: 3, medium: 2, low: 1 };
  const sortedSignals = Array.from(signalsMap.values()).sort((a, b) => {
    const diffSev = (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
    if (diffSev !== 0) return diffSev;
    return b.points - a.points;
  });

  // 3. Evidence Analyzed
  const evidenceFields: EvidenceField[] = [];
  if (metadata.companyName || raw.company_name) {
    evidenceFields.push({ label: "Company", value: metadata.companyName || raw.company_name });
  }
  if (metadata.jobTitle || raw.job_title) {
    evidenceFields.push({ label: "Role / Opportunity", value: metadata.jobTitle || raw.job_title });
  }
  if (metadata.recruiterName) {
    evidenceFields.push({ label: "Recruiter Name", value: metadata.recruiterName, source: "recruiter" });
  }
  if (metadata.recruiterEmail || raw.recruiter_email) {
    evidenceFields.push({ label: "Recruiter Email", value: metadata.recruiterEmail || raw.recruiter_email, source: "recruiter" });
  }
  if (metadata.contactMethod || raw.contact_method) {
    evidenceFields.push({ label: "Contact Channel", value: metadata.contactMethod || raw.contact_method });
  }
  if (metadata.telegramUsername) {
    evidenceFields.push({ label: "Telegram Handle", value: metadata.telegramUsername });
  }
  if (metadata.phoneNumber) {
    evidenceFields.push({ label: "Phone Number", value: metadata.phoneNumber });
  }
  if (metadata.paymentAmount || (metadata.paymentRequested && "Yes")) {
    evidenceFields.push({
      label: "Payment Requested",
      value: metadata.paymentAmount ? `${metadata.paymentAmount} fee requested` : "Upfront payment requested",
      source: "content",
    });
  }
  if (metadata.salaryText || metadata.stipendText || raw.salary_text) {
    evidenceFields.push({ label: "Offered Compensation", value: metadata.salaryText || metadata.stipendText || raw.salary_text });
  }

  const evidenceSummary: EvidenceSummary = {
    sourceType,
    evidenceType: metadata.evidenceType,
    quality: verificationCoverage,
    ocrConfidence: metadata.ocrConfidence,
    fields: evidenceFields,
    detectedUrls: metadata.detectedUrls || (raw.url ? [raw.url] : []),
    rawExcerpt: raw.job_description || undefined,
  };

  // 4. Company Section
  let companyReport: CompanyReport | null = null;
  if (metadata.companyVerification || metadata.companyName || raw.company_name) {
    const compMeta = metadata.companyVerification || {};
    companyReport = {
      companyName: compMeta.companyName || metadata.companyName || raw.company_name || "Company",
      website: compMeta.website || metadata.hostname || raw.url || null,
      status: compMeta.status || (compMeta.websiteReachable ? "consistent" : "unverified"),
      coverage: compMeta.coverage || "medium",
      isReachable: compMeta.websiteReachable ?? (metadata.https !== undefined ? true : undefined),
      hasHttps: compMeta.hasHttps ?? metadata.https,
      hasCareers: compMeta.careersPageDetected ?? metadata.jobRelated,
      hasContact: compMeta.contactPageDetected,
      identityConsistent: compMeta.companyNameMatchesDomain,
      reasons: compMeta.reasons || [],
    };
  }

  // 5. Recruiter Section
  let recruiterReport: RecruiterReport | null = null;
  if (metadata.recruiterVerification || metadata.recruiterEmail || raw.recruiter_email) {
    const recMeta = metadata.recruiterVerification || {};
    recruiterReport = {
      status: recMeta.status || (recMeta.domainMatch ? "consistent" : "needs_review"),
      recruiterName: recMeta.recruiterName || metadata.recruiterName || null,
      recruiterEmail: recMeta.recruiterEmail || metadata.recruiterEmail || raw.recruiter_email || null,
      emailDomain: recMeta.emailDomain || null,
      domainMatch: recMeta.domainMatch ?? null,
      publicProvider: recMeta.publicProvider ?? null,
      contactMethod: metadata.contactMethod || raw.contact_method || null,
      reasons: recMeta.reasons || [],
    };
  }

  // 6. Content Section
  let contentReport: ContentReport | null = null;
  if (metadata.contentIntelligence) {
    const cMeta = metadata.contentIntelligence;
    const findings: ContentFinding[] = [];

    if (cMeta.paymentRequested) {
      findings.push({
        title: "Upfront Payment Request",
        description: cMeta.paymentAmount ? `Requested payment amount: ${cMeta.paymentAmount}` : "Candidate is asked to pay a fee before joining.",
        severity: "high",
        source: sourceType === "screenshot" ? "screenshot" : "text",
      });
    }
    if (cMeta.sensitiveInfoRequested) {
      findings.push({
        title: "Premature Identity Information Request",
        description: "Government identity card (Aadhaar, PAN, Passport) requested prematurely.",
        severity: "high",
        source: "content",
      });
    }
    if (cMeta.financialInfoRequested) {
      findings.push({
        title: "Financial Credentials Requested",
        description: "Banking details, UPI PIN, or OTP credentials requested.",
        severity: "high",
        source: "content",
      });
    }
    if (cMeta.informalContact) {
      findings.push({
        title: "Informal Recruitment Channel",
        description: `Recruitment conducted via informal platform (${cMeta.informalContact}).`,
        severity: "medium",
        source: "content",
      });
    }
    if (cMeta.urgencyDetected) {
      findings.push({
        title: "Urgency and High-Pressure Language",
        description: "Artificial deadlines designed to rush candidate decisions.",
        severity: "medium",
        source: "content",
      });
    }
    if (cMeta.unrealisticCompensation) {
      findings.push({
        title: "Unrealistic Compensation Claim",
        description: "Disproportionate pay promises for simple entry-level work.",
        severity: "high",
        source: "content",
      });
    }
    if (cMeta.guaranteedEmployment) {
      findings.push({
        title: "Guaranteed Placement Promise",
        description: "100% job guarantee promises without credible assessment.",
        severity: "medium",
        source: "content",
      });
    }

    contentReport = {
      paymentRequested: !!cMeta.paymentRequested,
      paymentAmount: cMeta.paymentAmount || null,
      sensitiveInfoRequested: !!cMeta.sensitiveInfoRequested,
      financialInfoRequested: !!cMeta.financialInfoRequested,
      urgencyDetected: !!cMeta.urgencyDetected,
      unrealisticCompensation: !!cMeta.unrealisticCompensation,
      guaranteedEmployment: !!cMeta.guaranteedEmployment,
      informalContact: cMeta.informalContact || null,
      officialApplicationEvidence: !!cMeta.officialApplicationEvidence,
      findings,
      detectedPhrases: cMeta.detectedPhrases || [],
    };
  }

  // 7. Threat Intelligence Section
  let threatIntelReport: ThreatIntelReport | null = null;
  if (metadata.threatIntelligence) {
    const tMeta = metadata.threatIntelligence;
    threatIntelReport = {
      status: tMeta.status || "unavailable",
      hostname: tMeta.hostname,
      rootDomain: tMeta.rootDomain,
      source: tMeta.source,
      domainAgeYears: tMeta.domainAgeYears,
      creationDate: tMeta.creationDate,
      isRecentlyRegistered: tMeta.isRecentlyRegistered,
      checkedAt: tMeta.checkedAt,
      reasons: tMeta.reasons || [],
    };
  }

  // 8. AI Analysis Section
  let aiReport: AIReport | null = null;
  if (metadata.aiAnalysis) {
    const aiMeta = metadata.aiAnalysis;
    aiReport = {
      status: aiMeta.status || "available",
      summary: aiMeta.summary || "",
      concerns: aiMeta.concerns || [],
      positiveEvidence: aiMeta.positiveEvidence || [],
      missingEvidence: aiMeta.missingEvidence || [],
      recommendedActions: aiMeta.recommendedActions || [],
      contextAssessment: aiMeta.contextAssessment,
      analysisQuality: aiMeta.analysisQuality,
    };
  }

  // 9. Consolidate Positive Evidence & Missing Evidence
  const positiveEvidence: string[] = [];
  const missingEvidence: string[] = [];

  if (metadata.https) positiveEvidence.push("HTTPS encrypted connection enabled on opportunity website.");
  if (recruiterReport?.status === "consistent" && recruiterReport.domainMatch) {
    positiveEvidence.push("Recruiter email domain matches the official company website.");
  }
  if (contentReport?.officialApplicationEvidence) {
    positiveEvidence.push("Opportunity links to an official corporate careers portal.");
  }
  if (contentReport && !contentReport.paymentRequested) {
    positiveEvidence.push("No upfront registration, training, or deposit fee was requested.");
  }
  if (aiReport?.positiveEvidence) {
    for (const p of aiReport.positiveEvidence) {
      if (!positiveEvidence.includes(p)) positiveEvidence.push(p);
    }
  }

  if (!recruiterReport?.recruiterEmail) {
    missingEvidence.push("No corporate recruiter email provided to verify identity.");
  }
  if (!evidenceFields.some((f) => f.label === "Company")) {
    missingEvidence.push("Company identity could not be independently confirmed.");
  }
  if (verificationCoverage === "insufficient" || verificationCoverage === "low") {
    missingEvidence.push("Limited structured text/evidence was available in the submitted material.");
  }
  if (aiReport?.missingEvidence) {
    for (const m of aiReport.missingEvidence) {
      if (!missingEvidence.includes(m)) missingEvidence.push(m);
    }
  }

  // 10. Consolidate Actionable Recommendations
  const recommendations: string[] = [];
  if (raw.recommendations && raw.recommendations.length > 0) {
    recommendations.push(...raw.recommendations);
  }

  if (contentReport?.paymentRequested) {
    const payRec = "Do not pay any registration, processing, training, or equipment fee.";
    if (!recommendations.includes(payRec)) recommendations.unshift(payRec);
  }
  if (contentReport?.sensitiveInfoRequested || contentReport?.financialInfoRequested) {
    const sensRec = "Do not share government IDs (Aadhaar/PAN), bank account details, or OTPs.";
    if (!recommendations.includes(sensRec)) recommendations.push(sensRec);
  }
  if (recruiterReport?.status === "needs_review") {
    const recRev = "Verify the recruiter using contact information from the company's official website.";
    if (!recommendations.includes(recRev)) recommendations.push(recRev);
  }
  if (recommendations.length === 0) {
    recommendations.push("Independently verify this opening on the employer's official website.");
    recommendations.push("Never send money or confidential credentials during the hiring process.");
  }

  // 11. Assessment Summary
  let assessmentSummary = raw.summary || "";
  if (!assessmentSummary && aiReport?.summary) {
    assessmentSummary = aiReport.summary;
  }
  if (!assessmentSummary) {
    if (riskLevel === "high") {
      assessmentSummary = `ScamCheck detected ${sortedSignals.length} significant warning signals in this opportunity. Independent verification is strongly recommended before proceeding.`;
    } else if (riskLevel === "review") {
      assessmentSummary = "Some warning signals require additional verification. Review the details carefully before taking action.";
    } else {
      assessmentSummary = "No major warning signals were detected from the available evidence. Standard career diligence is still recommended.";
    }
  }

  // 12. Cross-Evidence Signal Correlation (Phase 17)
  const convertedSignalsForCorr = sortedSignals.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    severity: s.severity,
    points: s.points,
  }));

  const rawEvidence = metadata.evidence || {
    sourceType: (sourceType as any) || "text",
    evidenceType: metadata.evidenceType || "unknown",
    rawText: raw.job_description || undefined,
    companyName: raw.company_name || undefined,
    recruiterEmail: raw.recruiter_email || undefined,
    salaryText: raw.salary_text || undefined,
    paymentRequested: raw.payment_requested,
    contactMethod: raw.contact_method || undefined,
    detectedUrls: raw.url ? [raw.url] : [],
    suspiciousPhrases: metadata.suspiciousPhrases || [],
    evidenceQuality: verificationCoverage,
  };

  const correlationResult = correlateSignals(convertedSignalsForCorr, rawEvidence, {
    companyStatus: companyReport?.status,
    recruiterStatus: recruiterReport?.status,
    companyDomain: companyReport?.website || undefined,
    recruiterEmail: recruiterReport?.recruiterEmail || raw.recruiter_email || undefined,
  });

  const confidenceLevel = correlationResult.confidenceLevel;
  const confidenceLabel =
    confidenceLevel === "high"
      ? "High confidence"
      : confidenceLevel === "medium"
      ? "Moderate confidence"
      : "Low confidence";

  const correlationSummary = correlationResult.correlationSummary;
  const correlatedFindings = correlationResult.correlatedFindings;
  const entityConsistency = correlationResult.entityConsistency;
  const isInsufficientEvidence = correlationResult.isInsufficientEvidence;

  // 13. Shareable Summary Text
  const keyConcernsText =
    sortedSignals.length > 0
      ? sortedSignals.slice(0, 4).map((s) => `• ${s.title}: ${s.description}`).join("\n")
      : "• No major warning signals detected";

  const keyActionsText = recommendations.slice(0, 3).map((r) => `• ${r}`).join("\n");

  const shareableSummaryText = `ScamCheck Verification Report
=============================
Assessment: ${riskLevelLabel} (${raw.risk_score}/100)
Coverage: ${coverageLabel}
Confidence: ${confidenceLabel}

Summary:
${assessmentSummary}

Correlation:
${correlationSummary}

Key Findings:
${keyConcernsText}

Recommended Actions:
${keyActionsText}

Verified via ScamCheck (https://scamcheck.dev)`;

  return {
    id: raw.id,
    createdAt: raw.created_at || new Date().toISOString(),
    inputType: raw.input_type || "evidence",
    url: raw.url,
    riskScore: raw.risk_score,
    riskLevel,
    riskLevelLabel: isInsufficientEvidence ? "INSUFFICIENT EVIDENCE" : riskLevelLabel,
    verificationCoverage,
    coverageLabel,
    coverageExplanation,
    assessmentSummary,
    confidenceLevel,
    confidenceLabel,
    correlationSummary,
    correlatedFindings,
    entityConsistency,
    isInsufficientEvidence,
    signals: sortedSignals,
    evidence: evidenceSummary,
    company: companyReport,
    recruiter: recruiterReport,
    content: contentReport,
    threatIntelligence: threatIntelReport,
    aiAnalysis: aiReport,
    positiveEvidence,
    missingEvidence,
    recommendations,
    shareableSummaryText,
  };
}
