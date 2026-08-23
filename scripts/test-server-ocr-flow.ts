/**
 * Test Server OCR & Error Normalization
 */

import { getErrorMessage, performServerOcr } from "../src/lib/evidence/server-ocr";
import { extractEvidenceFromText } from "../src/lib/evidence/extract";
import { analyzeOpportunity } from "../src/lib/risk-engine/analyzer";
import { normalizeEvidenceToInput } from "../src/lib/evidence/normalize";

async function testServerOcrFlow() {
  console.log("=== Testing Error Normalization ===");
  
  // Test 1: Standard Error
  const err1 = new Error("Connection timed out");
  console.log("Error 1:", getErrorMessage(err1) === "Connection timed out" ? "✓ PASS" : "✗ FAIL");

  // Test 2: String error
  const err2 = "Worker failed to initialize";
  console.log("Error 2:", getErrorMessage(err2) === "Worker failed to initialize" ? "✓ PASS" : "✗ FAIL");

  // Test 3: Object without Error prototype (like ErrorEvent or DOMException)
  const err3 = { message: "DOMException: The operation is insecure" };
  console.log("Error 3:", getErrorMessage(err3) === "DOMException: The operation is insecure" ? "✓ PASS" : "✗ FAIL");

  // Test 4: undefined / null
  const err4 = undefined;
  console.log("Error 4:", getErrorMessage(err4) === "Unknown OCR error" ? "✓ PASS" : "✗ FAIL");

  // Test 5: Empty Buffer OCR (low_text or error handling)
  console.log("\n=== Testing Server OCR on Empty / Minimal Input ===");
  const emptyBuffer = Buffer.alloc(10);
  const result = await performServerOcr(emptyBuffer);
  console.log("Empty Buffer OCR Status:", result.status, "(expected: ocr_error or low_text)");
  console.log("Empty Buffer OCR Message:", result.message);

  // Test 6: Pipeline extraction from target email screenshot text
  console.log("\n=== Testing Target Email/Offer Extracted Content ===");
  const emailOfferText = `Urgent: Internship Offer & Registration
From: Recruiter <recruiter@gmail.com>
To: candidate@example.com

Congratulations! You have been selected for a Data Entry Internship at GlobalTech Solutions.
Please pay ₹999 registration fee to confirm your seat.
Contact us on Telegram @examplejobs for onboarding instructions.
Limited seats available. Apply immediately.`;

  const { evidence } = extractEvidenceFromText(emailOfferText, "screenshot", 92);
  const input = normalizeEvidenceToInput(evidence);
  const analysis = analyzeOpportunity(input);

  console.log("Extracted Company:", evidence.companyName);
  console.log("Extracted Email:", evidence.recruiterEmail);
  console.log("Extracted Telegram:", evidence.telegramUsername);
  console.log("Extracted Payment:", evidence.paymentRequested, evidence.paymentAmount);
  console.log("Assessed Risk Level:", analysis.level);
  console.log("Assessed Risk Score:", analysis.score);
  console.log("Generated Signals:", analysis.signals.map((s) => s.title));

  const allPassed =
    evidence.paymentRequested === true &&
    evidence.paymentAmount === "₹999" &&
    evidence.telegramUsername === "examplejobs" &&
    evidence.recruiterEmail === "recruiter@gmail.com" &&
    analysis.level === "high" &&
    analysis.score >= 60;

  if (allPassed) {
    console.log("\n✓ ALL SERVER OCR PIPELINE TESTS PASSED!");
  } else {
    console.error("\n✗ PIPELINE TESTS FAILED!");
  }
}

testServerOcrFlow();
