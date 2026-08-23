// ==============================================================================
// Phase 11: Content Intelligence Analyzer
// Deterministic pattern intelligence with duplicate signal prevention
// ==============================================================================

import { ContentIntelligenceResult, ContentRiskCategory } from "./types";
import { RiskSignal } from "@/lib/risk-engine/types";
import { extractPaymentAmount } from "@/lib/evidence/extract";

// Payment & fee terms
const STRONG_FEE_PATTERNS = [
  "registration fee",
  "processing fee",
  "application fee",
  "training fee",
  "security deposit",
  "refundable deposit",
  "refundable fee",
  "verification fee",
  "interview fee",
  "joining fee",
  "pay to apply",
  "pay before joining",
  "pay to confirm",
  "payment required",
  "wire fee",
];

// Explicit negation patterns for payment
const PAYMENT_NEGATION_PATTERNS = [
  /no\s+(?:registration|processing|application|training)?\s*(?:fee|payment|deposit|charge)s?\s*(?:is|are)?\s*(?:required|needed|mandatory|asked)/i,
  /no\s+(?:fee|payment|charge)s?\s*(?:is|are)?\s*required/i,
  /without\s+(?:any\s+)?(?:fee|payment|charge|cost)/i,
  /free\s+of\s+(?:charge|cost)/i,
  /zero\s+(?:fee|cost|charges)/i,
];

// Sensitive Identity Information patterns
const SENSITIVE_IDENTITY_PATTERNS = [
  /\b(?:aadhaar|aadhar|uidai)\b/i,
  /\bpan\s*(?:card|number)?\b/i,
  /\bpassport\s*(?:copy|photo|details|number)\b/i,
  /\bvoter\s*id\b/i,
  /\bidentity\s*document\b/i,
  /\bbank\s*statement\b/i,
  /\bnational\s*id\b/i,
  /\bssn\b/i,
];

// Financial Information patterns
const FINANCIAL_INFO_PATTERNS = [
  /\bbank\s*(?:account|details|transfer)\b/i,
  /\baccount\s*number\b/i,
  /\bupi\s*(?:payment|id|pin|transfer)\b/i,
  /\bcard\s*number\b/i,
  /\bcvv\b/i,
  /\botp\b/i,
  /\bnet\s*banking\s*password\b/i,
  /\bcredit\s*card\b/i,
  /\bdebit\s*card\b/i,
];

// Urgency / Pressure patterns
const URGENCY_PATTERNS = [
  "apply immediately",
  "limited seats",
  "today only",
  "act now",
  "last chance",
  "offer expires",
  "urgent joining",
  "immediate joining",
  "respond within 1 hour",
  "respond immediately",
  "apply now limited",
  "urgent vacancy",
];

// Unrealistic Compensation patterns
const UNREALISTIC_COMP_PATTERNS = [
  "₹1 lakh per day",
  "1 lakh per day",
  "₹1 lakh/day",
  "1 lakh/day",
  "₹50,000 per day",
  "50000 per day",
  "₹50000/day",
  "earn ₹1 crore",
  "earn 1 crore",
  "work 1 hour/day",
  "work 1 hour per day",
  "easy money",
  "no experience high salary",
  "no experience required earn",
  "guaranteed income",
];

// Guaranteed Employment patterns
const GUARANTEED_EMPLOYMENT_PATTERNS = [
  "100% job guarantee",
  "100% guarantee",
  "guaranteed placement",
  "guaranteed selection",
  "job guaranteed after payment",
  "guaranteed job",
  "guaranteed internship",
];

// Official Application indicators
const OFFICIAL_APPLICATION_PATTERNS = [
  /careers\.[a-z0-9-]+\.[a-z]{2,}/i,
  /jobs\.[a-z0-9-]+\.[a-z]{2,}/i,
  /official\s+(?:careers|application|portal|website)/i,
  /apply\s+through\s+our\s+official/i,
  /apply\s+at\s+https?:\/\//i,
];

/**
 * Analyzes content text for scam patterns, sensitive data requests, urgency, and compensation claims.
 */
export function analyzeContentIntelligence(text: string): ContentIntelligenceResult {
  const lower = (text || "").toLowerCase();
  const categories: ContentRiskCategory[] = [];
  const detectedPhrases: string[] = [];
  const signals: RiskSignal[] = [];
  const recommendations: string[] = [];

  if (!lower.trim()) {
    return {
      paymentRequested: false,
      sensitiveInfoRequested: false,
      financialInfoRequested: false,
      urgencyDetected: false,
      unrealisticCompensation: false,
      guaranteedEmployment: false,
      officialApplicationEvidence: false,
      categories,
      detectedPhrases,
      signals,
      recommendations,
    };
  }

  // 1. Payment & Recruitment Fee Analysis
  const isPaymentNegated = PAYMENT_NEGATION_PATTERNS.some((pattern) => pattern.test(lower));
  let paymentRequested = false;
  let paymentAmount: string | undefined = undefined;

  if (!isPaymentNegated) {
    const matchedFee = STRONG_FEE_PATTERNS.filter((p) => lower.includes(p));
    if (matchedFee.length > 0) {
      paymentRequested = true;
      categories.push("payment", "recruitment_fee");
      detectedPhrases.push(...matchedFee);
      paymentAmount = extractPaymentAmount(text);

      signals.push({
        id: "payment-requested",
        title: "Employment-related payment request",
        description: paymentAmount
          ? `The opportunity requests a fee (${paymentAmount}) before employment or training.`
          : "The opportunity appears to require payment before employment or placement.",
        severity: "high",
        points: 35,
      });

      recommendations.push("Do not pay any registration, training, security, or processing fee.");
    }
  }

  // 2. Sensitive Identity Information Request
  let sensitiveInfoRequested = false;
  const matchedIdentity = SENSITIVE_IDENTITY_PATTERNS.filter((p) => p.test(lower));
  if (matchedIdentity.length > 0) {
    sensitiveInfoRequested = true;
    categories.push("identity_request");
    detectedPhrases.push("Sensitive identity document request");

    signals.push({
      id: "identity-info-requested",
      title: "Sensitive identity information requested",
      description: "The content requests government identity records (such as Aadhaar, PAN, or Passport) prematurely.",
      severity: "high",
      points: 30,
    });

    recommendations.push("Do not share identity or financial information until the employer is independently verified.");
  }

  // 3. Financial Information Request
  let financialInfoRequested = false;
  const matchedFinancial = FINANCIAL_INFO_PATTERNS.filter((p) => p.test(lower));
  if (matchedFinancial.length > 0) {
    financialInfoRequested = true;
    categories.push("financial_request");
    detectedPhrases.push("Financial information request");

    signals.push({
      id: "financial-info-requested",
      title: "Financial information requested",
      description: "The communication asks for bank account details, UPI ID, OTP, or card credentials.",
      severity: "high",
      points: 35,
    });

    recommendations.push("Never disclose bank credentials, UPI PINs, or OTPs during a job recruitment process.");
  }

  // 4. Pressure / Urgency Language
  let urgencyDetected = false;
  const matchedUrgency = URGENCY_PATTERNS.filter((p) => lower.includes(p));
  if (matchedUrgency.length > 0) {
    urgencyDetected = true;
    categories.push("urgency");
    detectedPhrases.push(...matchedUrgency);

    signals.push({
      id: "urgency-pressure-language",
      title: "Pressure or urgency language",
      description: "The opportunity uses high-pressure phrasing or artificial deadlines to rush decision making.",
      severity: "medium",
      points: 10,
    });

    recommendations.push("Do not allow time pressure to prevent independent verification.");
  }

  // 5. Unrealistic Compensation Claim
  let unrealisticCompensation = false;
  const matchedComp = UNREALISTIC_COMP_PATTERNS.filter((p) => lower.includes(p));
  if (matchedComp.length > 0) {
    unrealisticCompensation = true;
    categories.push("unrealistic_compensation");
    detectedPhrases.push(...matchedComp);

    signals.push({
      id: "unrealistic-compensation",
      title: "Unrealistic compensation claim",
      description: "The opportunity promises compensation that is unusually disproportionate to the required experience.",
      severity: "high",
      points: 25,
    });

    recommendations.push("Compare the offered compensation with standard industry benchmarks for similar roles.");
  }

  // 6. Guaranteed Employment Claim
  let guaranteedEmployment = false;
  const matchedGuarantee = GUARANTEED_EMPLOYMENT_PATTERNS.filter((p) => lower.includes(p));
  if (matchedGuarantee.length > 0) {
    guaranteedEmployment = true;
    categories.push("guaranteed_employment");
    detectedPhrases.push(...matchedGuarantee);

    signals.push({
      id: "guaranteed-employment",
      title: "Guaranteed employment claim",
      description: "The offer guarantees placement or hiring, which is often used in misleading recruitment schemes.",
      severity: "high",
      points: 25,
    });

    recommendations.push("Legitimate employers evaluate candidates through standard merit-based selection processes.");
  }

  // 7. Informal Contact Channel Detection
  let informalContact: string | undefined = undefined;
  if (lower.includes("telegram")) {
    informalContact = "Telegram";
    categories.push("informal_contact");
  } else if (lower.includes("whatsapp")) {
    informalContact = "WhatsApp";
    categories.push("informal_contact");
  }

  // Contextual Suspicious Contact combination: Informal channel + payment requested
  if (informalContact && paymentRequested) {
    signals.push({
      id: "informal-channel-payment",
      title: "Payment requested through informal recruitment channel",
      description: `Payment was requested alongside communication on ${informalContact}, an informal recruitment channel.`,
      severity: "high",
      points: 25,
    });
  }

  // 8. Official Application Process Evidence
  const officialApplicationEvidence = OFFICIAL_APPLICATION_PATTERNS.some((p) => p.test(lower));
  if (officialApplicationEvidence) {
    categories.push("official_application");
  }

  return {
    paymentRequested,
    paymentAmount,
    sensitiveInfoRequested,
    financialInfoRequested,
    urgencyDetected,
    unrealisticCompensation,
    guaranteedEmployment,
    informalContact,
    officialApplicationEvidence,
    categories: Array.from(new Set(categories)),
    detectedPhrases: Array.from(new Set(detectedPhrases)),
    signals,
    recommendations,
  };
}
