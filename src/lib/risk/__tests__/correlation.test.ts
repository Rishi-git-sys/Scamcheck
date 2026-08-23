/**
 * Phase 17: Advanced Evidence Intelligence & Signal Correlation Unit Tests
 * Run with: npx tsx src/lib/risk/__tests__/correlation.test.ts
 */

import { extractEvidenceFromText } from "@/lib/evidence/extract";
import { correlateSignals, categorizeSignal } from "../correlateSignals";
import { analyzeOpportunity } from "@/lib/risk-engine/analyzer";
import { normalizeEvidenceToInput } from "@/lib/evidence/normalize";

export function runCorrelationTests(): boolean {
  console.log("--- Running Phase 17 Evidence Intelligence & Correlation Unit Tests ---");
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`✓ Passed: ${testName}`);
    } else {
      console.error(`✗ Failed: ${testName}`);
    }
  }

  // 1. Strong Scam Pattern with Correlation
  {
    const scamText = `Congratulations! You have been selected for a Data Entry Internship at TechCorp.
Pay ₹999 registration fee to confirm your seat.
Contact us on Telegram @examplejobs.
Limited seats. Apply immediately.
recruiter@gmail.com`;

    const { evidence } = extractEvidenceFromText(scamText, "screenshot", 88);
    assert(evidence.evidenceType === "internship" || evidence.evidenceType === "offer_letter", "Scam: Evidence classified as internship/offer");
    assert(evidence.paymentRequested === true, "Scam: paymentRequested is true");
    assert(evidence.paymentAmount === "₹999", "Scam: Extracted paymentAmount is ₹999");
    assert(evidence.telegramUsername === "examplejobs", "Scam: Extracted Telegram handle");
    assert(evidence.recruiterEmail === "recruiter@gmail.com", "Scam: Extracted Gmail address");

    const input = normalizeEvidenceToInput(evidence);
    const analysis = analyzeOpportunity(input);
    assert(analysis.level === "high", "Scam: Risk engine assigns High Risk");
    assert(analysis.score >= 60, "Scam: Risk score is >= 60");

    const corr = correlateSignals(analysis.signals, evidence);
    assert(corr.clusters.length >= 3, "Scam: At least 3 signal clusters detected");
    assert(corr.highRiskReinforcement === true, "Scam: Multiple high risk signals reinforce each other");
    assert(
      corr.correlatedFindings.some((f) => f.id === "corr-payment-informal"),
      "Scam: Correlated payment + informal channel"
    );
    assert(
      corr.correlatedFindings.some((f) => f.id === "corr-payment-urgency"),
      "Scam: Correlated payment + urgency"
    );
    assert(
      corr.correlationSummary.includes("reinforce each other"),
      "Scam: Generated multi-signal correlation summary"
    );
  }

  // 2. Offer Letter Entity & Consistency Extraction
  {
    const offerLetterText = `APPOINTMENT LETTER
Dear Rahul Sharma,
We are pleased to offer you the position of Software Engineer Intern at Microsoft India.
Date of Joining: 1st October 2026
Location: Bangalore
Stipend: ₹45,000 per month
For any questions, reach out to careers@microsoft.com`;

    const { evidence } = extractEvidenceFromText(offerLetterText, "text");
    assert(evidence.evidenceType === "offer_letter", "Offer: Classified as offer_letter");
    assert(Boolean(evidence.jobTitle?.includes("Software Engineer")), "Offer: Extracted job title");
    assert(Boolean(evidence.joiningDate?.includes("1st October 2026")), "Offer: Extracted joining date");
    assert(Boolean(evidence.workLocation?.toLowerCase().includes("bangalore")), "Offer: Extracted location");
    assert(evidence.paymentRequested === false, "Offer: No payment requested (stipend recognized as compensation)");

    const input = normalizeEvidenceToInput(evidence);
    const analysis = analyzeOpportunity(input);
    assert(analysis.level === "safe", "Offer: Legit offer letter evaluated as safe");

    const corr = correlateSignals(analysis.signals, evidence, {
      companyStatus: "consistent",
      recruiterStatus: "consistent",
    });
    assert(corr.confidenceLevel === "high", "Offer: High verification confidence from rich structured data");
    assert(
      corr.entityConsistency.every((e) => e.status === "consistent"),
      "Offer: All extracted entities marked consistent"
    );
  }

  // 3. Insufficient Evidence Detection
  {
    const briefText = "Congratulations, you got selected!";
    const { evidence } = extractEvidenceFromText(briefText, "text");
    assert(evidence.evidenceQuality === "insufficient", "Insufficient: Evidence quality is insufficient");

    const input = normalizeEvidenceToInput(evidence);
    const analysis = analyzeOpportunity(input);
    const corr = correlateSignals(analysis.signals, evidence);

    assert(corr.isInsufficientEvidence === true, "Insufficient: Correctly flagged as isInsufficientEvidence");
    assert(corr.confidenceLevel === "low", "Insufficient: Confidence level is low");
    assert(
      !analysis.signals.some((s) => s.id === "payment-requested" || s.id === "suspicious-job-language"),
      "Insufficient: Zero fake scam payment warnings hallucinated"
    );
  }

  // 4. Categorize Signal Clusters
  {
    const paySig = { id: "1", title: "Employment-related payment request", description: "Demands ₹999 fee", severity: "high" as const, points: 25 };
    assert(categorizeSignal(paySig) === "PAYMENT_RISK", "Cluster: Payment signal mapped to PAYMENT_RISK");

    const recSig = { id: "2", title: "Public recruiter email address", description: "Uses gmail.com", severity: "medium" as const, points: 15 };
    assert(categorizeSignal(recSig) === "RECRUITER_RISK", "Cluster: Recruiter signal mapped to RECRUITER_RISK");

    const urgSig = { id: "3", title: "Urgency and pressure language", description: "Limited seats", severity: "medium" as const, points: 12 };
    assert(categorizeSignal(urgSig) === "URGENCY_RISK", "Cluster: Urgency signal mapped to URGENCY_RISK");

    const telSig = { id: "4", title: "Informal recruitment channel (Telegram)", description: "Chat on telegram", severity: "medium" as const, points: 15 };
    assert(categorizeSignal(telSig) === "CONTACT_RISK", "Cluster: Telegram signal mapped to CONTACT_RISK");
  }

  console.log(`\n--- Results: ${passed}/${total} tests passed ---`);
  return passed === total;
}

runCorrelationTests();
