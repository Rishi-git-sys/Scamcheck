// ==============================================================================
// Phase 17: Advanced Evidence Intelligence & Signal Correlation Layer
// Deterministic cross-evidence signal grouping, clustering, and correlation
// ==============================================================================

import { RiskSignal, RiskLevel, VerificationCoverage } from "@/lib/risk-engine/types";
import { OpportunityEvidence } from "@/lib/evidence/types";

export type SignalClusterType =
  | "PAYMENT_RISK"
  | "RECRUITER_RISK"
  | "URGENCY_RISK"
  | "IDENTITY_RISK"
  | "CONTACT_RISK"
  | "DATA_REQUEST_RISK";

export interface SignalCluster {
  type: SignalClusterType;
  title: string;
  count: number;
  severity: "high" | "medium" | "low";
  signals: RiskSignal[];
}

export interface CorrelatedFinding {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  clusterTypes: SignalClusterType[];
  evidenceExcerpt?: string;
  sourceLabel?: string;
}

export interface EntityConsistencyItem {
  entity: string;
  claimedValue: string;
  verifiedValue?: string;
  status: "consistent" | "needs_review" | "unverified";
  note: string;
}

export interface CorrelatedAnalysis {
  clusters: SignalCluster[];
  correlatedFindings: CorrelatedFinding[];
  correlationSummary: string;
  confidenceLevel: "high" | "medium" | "low";
  isInsufficientEvidence: boolean;
  entityConsistency: EntityConsistencyItem[];
  highRiskReinforcement: boolean;
}

/**
 * Maps a risk signal to its primary signal cluster.
 */
export function categorizeSignal(signal: RiskSignal): SignalClusterType {
  const t = (signal.title || "").toLowerCase();
  const d = (signal.description || "").toLowerCase();

  // Payment risk
  if (
    t.includes("payment") ||
    t.includes("fee") ||
    t.includes("deposit") ||
    d.includes("payment") ||
    d.includes("fee") ||
    d.includes("₹")
  ) {
    return "PAYMENT_RISK";
  }

  // Data request risk
  if (
    t.includes("sensitive") ||
    t.includes("identity") ||
    t.includes("financial") ||
    t.includes("aadhaar") ||
    t.includes("pan") ||
    t.includes("otp") ||
    d.includes("bank account") ||
    d.includes("otp")
  ) {
    return "DATA_REQUEST_RISK";
  }

  // Recruiter risk
  if (
    t.includes("recruiter") ||
    t.includes("public email") ||
    t.includes("domain mismatch") ||
    d.includes("gmail.com") ||
    d.includes("domain mismatch")
  ) {
    return "RECRUITER_RISK";
  }

  // Urgency risk
  if (
    t.includes("urgency") ||
    t.includes("pressure") ||
    t.includes("limited time") ||
    t.includes("immediate") ||
    d.includes("limited seats")
  ) {
    return "URGENCY_RISK";
  }

  // Contact channel risk
  if (
    t.includes("telegram") ||
    t.includes("whatsapp") ||
    t.includes("informal") ||
    t.includes("contact") ||
    d.includes("telegram") ||
    d.includes("whatsapp")
  ) {
    return "CONTACT_RISK";
  }

  // Default to identity risk (company / domain / lookalike)
  return "IDENTITY_RISK";
}

/**
 * Deterministically correlates signals across evidence sources.
 */
export function correlateSignals(
  signals: RiskSignal[],
  evidence?: OpportunityEvidence,
  metadata?: {
    companyStatus?: string;
    recruiterStatus?: string;
    companyDomain?: string;
    recruiterEmail?: string;
  }
): CorrelatedAnalysis {
  // 1. Group signals into clusters
  const clusterMap: Record<SignalClusterType, RiskSignal[]> = {
    PAYMENT_RISK: [],
    RECRUITER_RISK: [],
    URGENCY_RISK: [],
    IDENTITY_RISK: [],
    CONTACT_RISK: [],
    DATA_REQUEST_RISK: [],
  };

  for (const sig of signals) {
    const cluster = categorizeSignal(sig);
    clusterMap[cluster].push(sig);
  }

  const clusters: SignalCluster[] = [];
  const clusterTitles: Record<SignalClusterType, string> = {
    PAYMENT_RISK: "Payment & Fee Demands",
    RECRUITER_RISK: "Recruiter Authenticity",
    URGENCY_RISK: "Urgency & Pressure Language",
    IDENTITY_RISK: "Company & Domain Integrity",
    CONTACT_RISK: "Informal Communication Channels",
    DATA_REQUEST_RISK: "Sensitive Data Inquiries",
  };

  for (const [key, sigs] of Object.entries(clusterMap) as [SignalClusterType, RiskSignal[]][]) {
    if (sigs.length > 0) {
      const maxSeverity = sigs.some((s) => s.severity === "high")
        ? "high"
        : sigs.some((s) => s.severity === "medium")
        ? "medium"
        : "low";
      clusters.push({
        type: key,
        title: clusterTitles[key],
        count: sigs.length,
        severity: maxSeverity,
        signals: sigs,
      });
    }
  }

  // 2. Correlate Multi-Signal Patterns
  const correlatedFindings: CorrelatedFinding[] = [];

  const hasPayment =
    clusterMap.PAYMENT_RISK.length > 0 ||
    evidence?.paymentRequested === true ||
    (evidence?.suspiciousPhrases || []).some((p) => p.includes("fee") || p.includes("deposit") || p.includes("₹"));

  const hasUrgency =
    clusterMap.URGENCY_RISK.length > 0 ||
    (evidence?.suspiciousPhrases || []).some(
      (p) =>
        p.includes("limited") ||
        p.includes("immediately") ||
        p.includes("act now") ||
        p.includes("urgent") ||
        p.includes("today only")
    );

  const hasRecruiterRisk =
    clusterMap.RECRUITER_RISK.length > 0 ||
    (evidence?.recruiterEmail ? evidence.recruiterEmail.includes("@gmail.com") : false);

  const hasContactRisk =
    clusterMap.CONTACT_RISK.length > 0 ||
    !!evidence?.telegramUsername ||
    evidence?.contactMethod === "Telegram" ||
    evidence?.contactMethod === "WhatsApp";

  const hasDataRisk = clusterMap.DATA_REQUEST_RISK.length > 0;
  const hasIdentityRisk = clusterMap.IDENTITY_RISK.length > 0;

  // Correlation Rule 1: Payment + Urgency
  if (hasPayment && hasUrgency) {
    correlatedFindings.push({
      id: "corr-payment-urgency",
      title: "Fee Demand Combined with High-Pressure Urgency",
      description:
        "The opportunity pairs an upfront candidate fee request with artificial deadlines or limited-seat pressure to discourage due diligence.",
      severity: "high",
      clusterTypes: ["PAYMENT_RISK", "URGENCY_RISK"],
      evidenceExcerpt: evidence?.paymentAmount ? `Amount: ${evidence.paymentAmount}` : undefined,
    });
  }

  // Correlation Rule 2: Payment + Informal Channel (Telegram/WhatsApp)
  if (hasPayment && hasContactRisk) {
    correlatedFindings.push({
      id: "corr-payment-informal",
      title: "Payment Requested via Informal Chat Channel",
      description:
        "Recruitment is being conducted over an informal messaging service (e.g. Telegram/WhatsApp) while requesting upfront candidate money, a hallmark of recruitment scams.",
      severity: "high",
      clusterTypes: ["PAYMENT_RISK", "CONTACT_RISK"],
      evidenceExcerpt: evidence?.telegramUsername ? `Handle: @${evidence.telegramUsername}` : undefined,
    });
  }

  // Correlation Rule 3: Payment + Unofficial Recruiter
  if (hasPayment && hasRecruiterRisk) {
    correlatedFindings.push({
      id: "corr-payment-recruiter",
      title: "Payment Requested by Unverified Recruiter",
      description:
        "An individual using a public email provider or mismatched domain is requesting payment on behalf of an organization.",
      severity: "high",
      clusterTypes: ["PAYMENT_RISK", "RECRUITER_RISK"],
      evidenceExcerpt: evidence?.recruiterEmail ? `Email: ${evidence.recruiterEmail}` : undefined,
    });
  }

  // Correlation Rule 4: Sensitive Personal Data + Unofficial Recruiter
  if (hasDataRisk && hasRecruiterRisk) {
    correlatedFindings.push({
      id: "corr-data-recruiter",
      title: "Sensitive Identity Data Solicited by Non-Corporate Channel",
      description:
        "Government IDs, banking details, or OTPs are being requested without verified corporate domain authentication.",
      severity: "high",
      clusterTypes: ["DATA_REQUEST_RISK", "RECRUITER_RISK"],
    });
  }

  // Correlation Rule 5: Company Mismatch + Suspicious Domain
  if (hasIdentityRisk && (hasRecruiterRisk || hasContactRisk)) {
    correlatedFindings.push({
      id: "corr-identity-mismatch",
      title: "Discrepancy Between Claimed Brand & Outreach Channel",
      description:
        "The claimed employer brand does not match the communication address or web domain provided in the opportunity materials.",
      severity: "medium",
      clusterTypes: ["IDENTITY_RISK", "RECRUITER_RISK"],
    });
  }

  // 3. Synthesize Plain-English Correlation Summary
  let correlationSummary = "";
  const highRiskReinforcement = correlatedFindings.some((f) => f.severity === "high");

  if (correlatedFindings.length >= 2) {
    const parts: string[] = [];
    if (hasPayment) parts.push("requests an upfront candidate fee");
    if (hasContactRisk) parts.push("operates through an informal chat channel");
    if (hasRecruiterRisk) parts.push("uses an unverified recruiter identity");
    if (hasUrgency) parts.push("applies artificial deadline pressure");
    if (hasDataRisk) parts.push("solicits sensitive identity documents");

    correlationSummary = `Several independent warning signals reinforce each other: this opportunity ${parts.join(
      ", "
    )}.`;
  } else if (correlatedFindings.length === 1) {
    correlationSummary = correlatedFindings[0].description;
  } else if (signals.length > 0) {
    correlationSummary =
      "One or more isolated warning indicators were flagged from the submitted evidence. Review the detailed breakdown below.";
  } else {
    correlationSummary =
      "No major warning signals were detected from the available evidence. Standard career diligence is still recommended.";
  }

  // 4. Entity Consistency Graph
  const entityConsistency: EntityConsistencyItem[] = [];

  if (evidence?.companyName) {
    entityConsistency.push({
      entity: "Company Name",
      claimedValue: evidence.companyName,
      status: metadata?.companyStatus === "needs_review" ? "needs_review" : "consistent",
      note:
        metadata?.companyStatus === "needs_review"
          ? "Provided name requires manual corporate verification."
          : "Matches verified corporate entity records.",
    });
  }

  if (evidence?.recruiterEmail) {
    const isPublic =
      evidence.recruiterEmail.includes("@gmail.com") ||
      evidence.recruiterEmail.includes("@yahoo.com") ||
      evidence.recruiterEmail.includes("@hotmail.com") ||
      evidence.recruiterEmail.includes("@outlook.com");

    entityConsistency.push({
      entity: "Recruiter Email",
      claimedValue: evidence.recruiterEmail,
      status: isPublic ? "needs_review" : "consistent",
      note: isPublic
        ? "Uses a free public mail provider rather than a verified business domain."
        : "Uses a dedicated business email domain.",
    });
  }

  if (evidence?.telegramUsername) {
    entityConsistency.push({
      entity: "Primary Contact",
      claimedValue: `@${evidence.telegramUsername}`,
      status: "needs_review",
      note: "Conducted via Telegram, an informal unverified recruitment medium.",
    });
  } else if (evidence?.contactMethod) {
    const isInformal = evidence.contactMethod === "Telegram" || evidence.contactMethod === "WhatsApp";
    entityConsistency.push({
      entity: "Primary Contact",
      claimedValue: evidence.contactMethod,
      status: isInformal ? "needs_review" : "consistent",
      note: isInformal
        ? `Conducted via ${evidence.contactMethod}, an informal recruitment medium.`
        : "Standard corporate recruitment channel.",
    });
  }

  if (evidence?.paymentRequested !== undefined && evidence.paymentRequested !== null) {
    entityConsistency.push({
      entity: "Candidate Financials",
      claimedValue: evidence.paymentRequested ? `Fee demanded (${evidence.paymentAmount || "unspecified"})` : "No upfront fee",
      status: evidence.paymentRequested ? "needs_review" : "consistent",
      note: evidence.paymentRequested
        ? "Legitimate employers generally do not demand fees from candidates."
        : "Consistent with standard hiring practices.",
    });
  }

  // 5. Verification Confidence vs Risk
  // Confidence is based on evidence completeness (Coverage), NOT scam probability
  let confidenceLevel: "high" | "medium" | "low" = "low";
  const hasText = !!evidence?.rawText && evidence.rawText.length > 50;
  const hasCompany = !!evidence?.companyName;
  const hasRecruiter = !!evidence?.recruiterEmail;
  const hasSource = !!evidence?.sourceType;

  const score = (hasText ? 1 : 0) + (hasCompany ? 1 : 0) + (hasRecruiter ? 1 : 0) + (hasSource ? 1 : 0);
  if (score >= 3) {
    confidenceLevel = "high";
  } else if (score >= 2) {
    confidenceLevel = "medium";
  }

  // 6. Insufficient Evidence Detection
  const isInsufficientEvidence =
    !hasCompany &&
    !hasRecruiter &&
    (!evidence?.rawText || evidence.rawText.trim().length < 50);

  return {
    clusters,
    correlatedFindings,
    correlationSummary,
    confidenceLevel,
    isInsufficientEvidence,
    entityConsistency,
    highRiskReinforcement,
  };
}
