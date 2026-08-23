/**
 * Phase 8 — Unified Evidence Intake Unit Tests
 *
 * Uses the tsx manual test runner pattern.
 * Run with: npx tsx src/lib/evidence/__tests__/evidence.test.ts
 */

import { extractEvidenceFromText } from "../extract";
import { normalizeEvidenceToInput, getEvidenceTypeLabel, getSourceTypeLabel } from "../normalize";
import { validateScreenshotFile, analyzeScreenshot } from "../screenshot";
import { analyzeOpportunity } from "@/lib/risk-engine/analyzer";

export function runEvidenceTests(): boolean {
  console.log("--- Running Unified Evidence Intake Unit Tests ---");
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

  // ─── Test B: Scam text (internship, fee, telegram, urgency, gmail) ───────────
  {
    const scamText = `Congratulations! You have been selected for a Data Entry Internship.
Pay ₹999 registration fee to confirm your seat.
Contact us on Telegram @examplejobs.
Limited seats. Apply immediately.
recruiter@gmail.com`;

    const { evidence } = extractEvidenceFromText(scamText, "text");

    assert(
      evidence.evidenceType === "internship" || evidence.evidenceType === "recruiter_message" || evidence.evidenceType === "offer_letter",
      "Test B: classified as internship/recruiter_message/offer_letter"
    );
    assert(evidence.paymentRequested === true, "Test B: payment requested is true");
    assert(evidence.recruiterEmail === "recruiter@gmail.com", "Test B: extracted recruiter gmail");
    assert(evidence.contactMethod?.toLowerCase() === "telegram", "Test B: contact method identified as telegram");
    assert(
      (evidence.suspiciousPhrases?.length || 0) > 0,
      "Test B: detected suspicious phrases"
    );

    // Normalize and run through existing risk engine
    const oppInput = normalizeEvidenceToInput(evidence);
    const analysis = analyzeOpportunity(oppInput);

    assert(analysis.level === "high", "Test B: Risk engine assigns High Risk");
    assert(analysis.score >= 60, "Test B: Score is high (>= 60)");
    const signalIds = analysis.signals.map((s) => s.id);
    assert(
      signalIds.includes("payment-requested"),
      "Test B: Includes payment signal"
    );
    assert(
      signalIds.includes("telegram-recruitment"),
      "Test B: Includes telegram recruitment signal"
    );
    assert(
      signalIds.includes("public-recruiter-email"),
      "Test B: Includes public recruiter email signal"
    );
  }

  // ─── Test C: Legitimate-looking text (interview invite, official portal, no fee) ──
  {
    const legitText = `You have been invited to interview for Software Engineer Intern.
The interview will be conducted through the company's official careers portal.
No payment is required.`;

    const { evidence } = extractEvidenceFromText(legitText, "text");

    assert(evidence.paymentRequested === false, "Test C: paymentRequested is false");

    const oppInput = normalizeEvidenceToInput(evidence);
    const analysis = analyzeOpportunity(oppInput);

    assert(analysis.level === "safe" || analysis.level === "review", "Test C: Level is safe or review");
    assert(analysis.score < 50, "Test C: Score is low/moderate (< 50)");
    const signalTitles = analysis.signals.map((s) => s.title.toLowerCase());
    assert(
      !signalTitles.some((t) => t.includes("payment")),
      "Test C: No payment risk signal detected"
    );
  }

  // ─── Test E: URL inside text (detect URL without auto-fetching) ──────────────
  {
    const textWithUrl = `Apply here:
https://example.com/internship

No payment required.`;

    const { evidence } = extractEvidenceFromText(textWithUrl, "text");

    assert(
      evidence.detectedUrls !== undefined && evidence.detectedUrls.length === 1,
      "Test E: Exactly 1 URL detected in text"
    );
    assert(
      evidence.detectedUrls?.[0] === "https://example.com/internship",
      "Test E: URL is correctly extracted"
    );
  }

  // ─── Test D: Screenshot analysis abstraction & validation ────────────────────
  {
    const mockPngFile = {
      name: "screenshot.png",
      type: "image/png",
      size: 1024 * 100, // 100 KB
    } as File;

    const validation = validateScreenshotFile(mockPngFile);
    assert(validation.valid === true, "Test D: PNG file passes validation");

    const mockPdfFile = {
      name: "document.pdf",
      type: "application/pdf",
      size: 1024 * 100,
    } as File;

    const invalidTypeValidation = validateScreenshotFile(mockPdfFile);
    assert(invalidTypeValidation.valid === false, "Test D: PDF file rejected by validation");

    const mockOversizeFile = {
      name: "large.png",
      type: "image/png",
      size: 6 * 1024 * 1024, // 6 MB
    } as File;

    const sizeValidation = validateScreenshotFile(mockOversizeFile);
    assert(sizeValidation.valid === false, "Test D: >5MB file rejected by validation");
  }

  // ─── Async screenshot analyzer test ─────────────────────────────────────────
  async function runAsyncTests() {
    const analysis = await analyzeScreenshot("mockData");
    assert(
      analysis.status === "failed",
      "Test D: analyzeScreenshot returns status 'failed' on invalid image"
    );
    assert(
      analysis.extractedText === "",
      "Test D: analyzeScreenshot returns empty text without fake data"
    );
    assert(
      analysis.message?.includes("couldn't read text") === true || analysis.message?.includes("manually") === true,
      "Test D: analyzeScreenshot provides user-friendly fallback guidance"
    );
  }

  // ─── Extra field extraction tests ───────────────────────────────────────────
  {
    const detailedText = `Company: Acme Corp
Role: Senior Frontend Engineer
Salary: 25 LPA
Email: jobs@acmecorp.com
Phone: +91 9876543210
We are looking for an experienced developer.`;

    const { evidence } = extractEvidenceFromText(detailedText, "text");

    assert(evidence.companyName?.includes("Acme") === true, "Extracted company name");
    assert(evidence.jobTitle?.includes("Frontend Engineer") === true, "Extracted job title");
    assert(evidence.recruiterEmail === "jobs@acmecorp.com", "Extracted business email");
    assert(evidence.salaryText !== undefined, "Extracted salary text");
    assert(evidence.phoneNumber !== undefined, "Extracted phone number");
  }

  // ─── Label Helpers ──────────────────────────────────────────────────────────
  {
    assert(getEvidenceTypeLabel("job") === "Job opportunity", "Label helper: job");
    assert(getEvidenceTypeLabel("internship") === "Internship offer", "Label helper: internship");
    assert(getEvidenceTypeLabel("offer_letter") === "Offer letter", "Label helper: offer_letter");
    assert(getSourceTypeLabel("screenshot") === "Screenshot", "Source helper: screenshot");
    assert(getSourceTypeLabel("text") === "Pasted text", "Source helper: text");
  }

  // Run async tests
  runAsyncTests().then(() => {
    console.log(`\n--- Results: ${passed}/${total} tests passed ---`);
    if (passed < total) {
      console.error(`${total - passed} test(s) failed.`);
      process.exit(1);
    }
    console.log("All unified evidence intake tests passed.");
  });

  return true;
}

runEvidenceTests();
