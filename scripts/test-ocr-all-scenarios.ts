/**
 * Comprehensive OCR Scenarios & Timeout Regression Test
 * Run with: npx tsx scripts/test-ocr-all-scenarios.ts
 */

import { performServerOcr, validateImageBuffer, getErrorMessage } from "../src/lib/evidence/server-ocr";
import { extractEvidenceFromText } from "../src/lib/evidence/extract";
import { normalizeEvidenceToInput } from "../src/lib/evidence/normalize";
import { analyzeOpportunity } from "../src/lib/risk-engine/analyzer";

async function runAllOcrScenarios() {
  console.log("=========================================");
  console.log("RUNNING COMPLETE OCR SCENARIOS TEST SUITE");
  console.log("=========================================\n");

  let passed = 0;
  let total = 0;

  function assert(cond: boolean, name: string) {
    total++;
    if (cond) {
      passed++;
      console.log(`✓ Passed: ${name}`);
    } else {
      console.error(`✗ Failed: ${name}`);
    }
  }

  // ─── TEST 1: Full Target Screenshot Pipeline ──────────────────────────────
  {
    console.log("--- Test 1: Full Email/Offer Screenshot Pipeline ---");
    const targetEmailText = `Urgent: Internship Offer & Registration
From: Recruiter <recruiter@gmail.com>
To: candidate@example.com

Congratulations! You have been selected for a Data Entry Internship at GlobalTech Solutions.
Please pay ₹999 registration fee to confirm your seat.
Contact us on Telegram @examplejobs for onboarding instructions.
Limited seats available. Apply immediately.`;

    const { evidence } = extractEvidenceFromText(targetEmailText, "screenshot", 90);
    assert(evidence.recruiterEmail === "recruiter@gmail.com", "Test 1: Extracted recruiter email");
    assert(evidence.telegramUsername?.includes("examplejobs") === true, "Test 1: Extracted Telegram handle");
    assert(evidence.paymentRequested === true && evidence.paymentAmount === "₹999", "Test 1: Extracted payment amount");

    const input = normalizeEvidenceToInput(evidence);
    const analysis = analyzeOpportunity(input);
    assert(analysis.level === "high" && analysis.score >= 60, "Test 1: High risk evaluated");
  }

  // ─── TEST 2: Error Normalization on Failure ─────────────────────────────────
  {
    console.log("\n--- Test 2: Error Normalization ---");
    const testErrors = [
      new Error("Worker initialization crashed"),
      "Network connection timed out",
      { message: "DOMException: Worker creation rejected" },
      { error: "Unknown internal state" },
      undefined,
      null,
    ];

    for (const err of testErrors) {
      const msg = getErrorMessage(err);
      assert(typeof msg === "string" && msg.length > 0 && msg !== "undefined", `Test 2: Safe message for ${typeof err}`);
    }
  }

  // ─── TEST 3: Invalid / Corrupted Image Validation ───────────────────────────
  {
    console.log("\n--- Test 3: Invalid Image Buffer Validation ---");
    const corruptedBuffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04]);
    const validation = validateImageBuffer(corruptedBuffer);
    assert(validation.valid === false, "Test 3: Corrupted buffer rejected before OCR");

    const result = await performServerOcr(corruptedBuffer);
    assert(result.status === "ocr_error", "Test 3: performServerOcr returns ocr_error status");
    assert(typeof result.message === "string", "Test 3: Returns human-readable error message");
  }

  // ─── TEST 4: Valid PNG Buffer with Minimal / Low Text ────────────────────────
  {
    console.log("\n--- Test 4: Low Text Image Simulation ---");
    // Minimal 1x1 valid PNG
    const minPng = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
      0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
      0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
      0x42, 0x60, 0x82,
    ]);

    const result = await performServerOcr(minPng);
    assert(result.status === "low_text", "Test 4: Blank image returns low_text status without hanging");
    assert(result.meaningfulCharCount < 10, "Test 4: Meaningful char count is < 10");
  }

  console.log(`\n=========================================`);
  console.log(`RESULTS: ${passed}/${total} SCENARIOS PASSED`);
  console.log(`=========================================`);

  return passed === total;
}

runAllOcrScenarios();
