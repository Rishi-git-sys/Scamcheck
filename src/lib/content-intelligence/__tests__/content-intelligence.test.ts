/**
 * Phase 11: Content Intelligence & Combined Phase 10+11 Unit Tests
 * Run with: npx tsx src/lib/content-intelligence/__tests__/content-intelligence.test.ts
 */

import { analyzeContentIntelligence } from "../analyzer";
import { verifyRecruiter } from "@/lib/recruiter-verification/analyzer";
import { analyzeOpportunity } from "@/lib/risk-engine/analyzer";
import { extractEvidenceFromText } from "@/lib/evidence/extract";
import { normalizeEvidenceToInput } from "@/lib/evidence/normalize";

export function runContentIntelligenceTests(): boolean {
  console.log("--- Running Phase 11 Content Intelligence & Combined Tests ---");
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

  // ─── TEST CASE 1: High Risk Telegram + ₹999 Registration Scam ──────────────
  {
    const input1 = `Congratulations! You have been selected for a Data Entry Internship.

Pay ₹999 registration fee to confirm your seat.

Contact us on Telegram @examplejobs.

Limited seats. Apply immediately.

recruiter@gmail.com`;

    const { evidence } = extractEvidenceFromText(input1, "text");
    const recruiter = verifyRecruiter({
      recruiterName: evidence.recruiterName,
      recruiterEmail: evidence.recruiterEmail,
      contactMethod: evidence.contactMethod,
      companyName: evidence.companyName,
    });
    const content = analyzeContentIntelligence(input1);

    const combinedSignals = [...recruiter.signals, ...content.signals];
    const oppInput = normalizeEvidenceToInput({
      ...evidence,
      paymentRequested: content.paymentRequested,
      paymentAmount: content.paymentAmount,
    });
    const analysis = analyzeOpportunity(oppInput, combinedSignals);

    assert(analysis.level === "high", "Test Case 1: Overall Risk Level is HIGH RISK");
    assert(analysis.score >= 60, "Test Case 1: Risk score >= 60");
    assert(content.paymentRequested === true, "Test Case 1: paymentRequested is true");
    assert(content.paymentAmount === "₹999", "Test Case 1: paymentAmount is '₹999'");
    assert(content.urgencyDetected === true, "Test Case 1: urgencyDetected is true");
    assert(recruiter.status === "needs_review", "Test Case 1: Recruiter status is 'needs_review'");
    assert(recruiter.publicProvider === true, "Test Case 1: Recruiter uses public provider (gmail)");

    const signalTitles = analysis.signals.map((s) => s.title);
    assert(
      signalTitles.some((t) => t.includes("payment") || t.includes("Payment")),
      "Test Case 1: Includes Employment-related payment request signal"
    );
    assert(
      signalTitles.some((t) => t.includes("recruiter email") || t.includes("Recruiter email") || t.includes("public")),
      "Test Case 1: Includes Public recruiter email signal"
    );
    assert(
      signalTitles.some((t) => t.includes("urgency") || t.includes("Urgency") || t.includes("Pressure")),
      "Test Case 1: Includes Urgency language signal"
    );
  }

  // ─── TEST CASE 2: Domain Match ──────────────────────────────────────────────
  {
    const recruiter = verifyRecruiter({
      recruiterEmail: "recruiter@microsoft.com",
      companyWebsite: "https://www.microsoft.com",
      companyName: "Microsoft",
    });

    assert(recruiter.status === "consistent", "Test Case 2: Recruiter status is 'consistent'");
    assert(recruiter.domainMatch === true, "Test Case 2: domainMatch is true");
    assert(
      !recruiter.signals.some((s) => s.id === "recruiter-domain-mismatch"),
      "Test Case 2: No recruiter-domain mismatch warning"
    );
  }

  // ─── TEST CASE 3: Sensitive / Financial Data Request ────────────────────────
  {
    const input3 = "Send your Aadhaar, PAN, bank account number and OTP to complete verification.";
    const content = analyzeContentIntelligence(input3);
    const analysis = analyzeOpportunity(
      { inputType: "manual", jobDescription: input3 },
      content.signals
    );

    assert(content.sensitiveInfoRequested === true, "Test Case 3: sensitiveInfoRequested is true (Aadhaar/PAN)");
    assert(content.financialInfoRequested === true, "Test Case 3: financialInfoRequested is true (Bank/OTP)");
    assert(analysis.level === "high", "Test Case 3: Risk Level is HIGH RISK");
    assert(analysis.score >= 60, "Test Case 3: Risk score >= 60");
    const signalIds = analysis.signals.map((s) => s.id);
    assert(signalIds.includes("identity-info-requested"), "Test Case 3: Triggered identity-info-requested");
    assert(signalIds.includes("financial-info-requested"), "Test Case 3: Triggered financial-info-requested");
  }

  // ─── TEST CASE 4: Normal Job ────────────────────────────────────────────────
  {
    const input4 = `Software Engineer Intern

Apply through our official careers portal.

No payment is required.

Interview will be conducted online.`;

    const { evidence } = extractEvidenceFromText(input4, "text");
    const recruiter = verifyRecruiter({
      recruiterEmail: evidence.recruiterEmail,
      companyName: evidence.companyName,
    });
    const content = analyzeContentIntelligence(input4);
    const analysis = analyzeOpportunity(
      normalizeEvidenceToInput(evidence),
      [...recruiter.signals, ...content.signals]
    );

    assert(content.paymentRequested === false, "Test Case 4: No payment warning (negation respected)");
    assert(content.officialApplicationEvidence === true, "Test Case 4: Official application portal recognized");
    assert(analysis.level === "safe", "Test Case 4: Risk Level is SAFE");
    assert(analysis.score === 0 || analysis.score < 30, "Test Case 4: Low score (<30)");
  }

  // ─── TEST CASE 5: LinkedIn Opportunity URL + Corporate Recruiter Email ─────
  {
    const recruiter = verifyRecruiter({
      recruiterEmail: "recruiter@microsoft.com",
      opportunityUrl: "https://www.linkedin.com/jobs/view/987654321",
      companyName: "Microsoft",
    });

    assert(recruiter.status !== "needs_review", "Test Case 5: No false domain mismatch for LinkedIn URL");
    assert(
      !recruiter.signals.some((s) => s.id === "recruiter-domain-mismatch"),
      "Test Case 5: No recruiter-domain-mismatch signal"
    );
  }

  // ─── TEST CASE 6: Unrealistic Compensation ──────────────────────────────────
  {
    const input6 = "Earn ₹1 lakh per day with no experience required. Easy money.";
    const content = analyzeContentIntelligence(input6);
    assert(content.unrealisticCompensation === true, "Test Case 6: Unrealistic compensation detected");
    assert(content.signals.some((s) => s.id === "unrealistic-compensation"), "Test Case 6: Generated unrealistic-compensation signal");
  }

  // ─── TEST CASE 7: Guaranteed Employment ─────────────────────────────────────
  {
    const input7 = "100% job guarantee after payment. Guaranteed placement.";
    const content = analyzeContentIntelligence(input7);
    assert(content.guaranteedEmployment === true, "Test Case 7: Guaranteed employment detected");
    assert(content.signals.some((s) => s.id === "guaranteed-employment"), "Test Case 7: Generated guaranteed-employment signal");
  }

  // ─── TEST CASE 8: Duplicate Signal Prevention ───────────────────────────────
  {
    const input8 = "Pay ₹999 registration fee before joining.";
    const content = analyzeContentIntelligence(input8);
    const analysis = analyzeOpportunity(
      { inputType: "manual", paymentRequested: true, jobDescription: input8 },
      content.signals
    );

    const paymentSignals = analysis.signals.filter(
      (s) => s.id === "payment-requested" || s.title.toLowerCase().includes("payment")
    );
    assert(paymentSignals.length === 1, "Test Case 8: Exactly 1 payment signal generated without duplicates");
  }

  console.log(`\n--- Results: ${passed}/${total} tests passed ---`);
  return passed === total;
}

runContentIntelligenceTests();
