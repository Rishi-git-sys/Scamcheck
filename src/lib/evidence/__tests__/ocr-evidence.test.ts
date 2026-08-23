/**
 * Phase 9 & OCR Bug Fix: Screenshot OCR, Buffer Validation & Evidence Unit Tests
 *
 * Run with: npx tsx src/lib/evidence/__tests__/ocr-evidence.test.ts
 */

import { cleanOcrText } from "../ocr-clean";
import { extractEvidenceFromText } from "../extract";
import { normalizeEvidenceToInput } from "../normalize";
import { validateScreenshotFile } from "../screenshot";
import { getErrorMessage, validateImageBuffer } from "../server-ocr";
import { analyzeOpportunity } from "@/lib/risk-engine/analyzer";

export function runOcrEvidenceTests(): boolean {
  console.log("--- Running OCR & Evidence Pipeline Unit Tests ---");
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

  // ─── 1. Error Normalization Tests ───────────────────────────────────────────
  {
    assert(getErrorMessage(new Error("Network failed")) === "Network failed", "Error Normalizer: Standard Error");
    assert(getErrorMessage("String error") === "String error", "Error Normalizer: String literal");
    assert(getErrorMessage({ message: "Worker Error" }) === "Worker Error", "Error Normalizer: Object with message");
    assert(getErrorMessage(undefined) === "Unknown OCR error", "Error Normalizer: undefined");
    assert(getErrorMessage(null) === "Unknown OCR error", "Error Normalizer: null");
  }

  // ─── 2. Image Buffer Magic Bytes Validation ─────────────────────────────────
  {
    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0, 0, 0, 0, 0]);
    assert(validateImageBuffer(pngHeader).valid === true, "Magic Bytes: PNG header recognized");

    const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    assert(validateImageBuffer(jpegHeader).valid === true, "Magic Bytes: JPEG header recognized");

    const webpHeader = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 0, 0, 0, 0,
    ]);
    assert(validateImageBuffer(webpHeader).valid === true, "Magic Bytes: WEBP header recognized");

    const corruptedHeader = Buffer.from([0x00, 0x01, 0x02, 0x03, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    assert(validateImageBuffer(corruptedHeader).valid === false, "Magic Bytes: Corrupted header rejected");
  }

  // ─── 3. OCR Text Cleaning ───────────────────────────────────────────────────
  {
    const messyOcrText = `Congratulations !   You  have been selected .

Role :  Data Entry Intern

Pay   ₹ 999  registration   fee .
Contact   us on Telegram @ examplejobs .
Email : recruiter @ gmail . com
https : // example . com / apply`;

    const cleaned = cleanOcrText(messyOcrText);

    assert(cleaned.cleanedText.includes("₹999"), "cleanOcrText: Normalizes currency spacing ₹ 999 -> ₹999");
    assert(cleaned.cleanedText.includes("@examplejobs"), "cleanOcrText: Normalizes Telegram handle @ examplejobs -> @examplejobs");
    assert(cleaned.cleanedText.includes("recruiter@gmail.com"), "cleanOcrText: Normalizes broken email spaces");
    assert(cleaned.cleanedText.includes("https://"), "cleanOcrText: Normalizes broken URL spaces");
    assert(cleaned.meaningfulCharCount > 50, "cleanOcrText: Accurately counts meaningful characters");
  }

  // ─── 4. Test Case: WhatsApp / Telegram Scam Screenshot ───────────────────────
  {
    const ocrScamOutput = `Congratulations! You have been selected for a Data Entry Internship.
Pay ₹999 registration fee to confirm your seat.
Contact us on Telegram @examplejobs.
Limited seats. Apply immediately.
recruiter@gmail.com`;

    const { evidence } = extractEvidenceFromText(ocrScamOutput, "screenshot", 88);

    assert(evidence.sourceType === "screenshot", "Scam Screenshot: sourceType is 'screenshot'");
    assert(evidence.evidenceType === "internship" || evidence.evidenceType === "offer_letter", "Scam Screenshot: Classified as internship or offer_letter");
    assert(evidence.paymentRequested === true, "Scam Screenshot: paymentRequested is true");
    assert(evidence.paymentAmount === "₹999", "Scam Screenshot: Extracted paymentAmount is '₹999'");
    assert(evidence.recruiterEmail === "recruiter@gmail.com", "Scam Screenshot: Extracted recruiter email");
    assert(evidence.telegramUsername?.includes("examplejobs") === true, "Scam Screenshot: Extracted Telegram handle examplejobs");
    assert(evidence.contactMethod === "Telegram", "Scam Screenshot: Contact method identified as Telegram");
    assert(evidence.ocrConfidence === 88, "Scam Screenshot: Preserves OCR confidence");
    assert(evidence.evidenceQuality === "high", "Scam Screenshot: Evidence quality calculated as 'high'");

    // Feed to deterministic risk engine
    const oppInput = normalizeEvidenceToInput(evidence);
    const analysis = analyzeOpportunity(oppInput);

    assert(analysis.level === "high", "Scam Screenshot: Risk engine assigns High Risk");
    assert(analysis.score >= 60, "Scam Screenshot: Risk score >= 60");
    const signalIds = analysis.signals.map((s) => s.id);
    assert(signalIds.includes("payment-requested"), "Scam Screenshot: Triggered payment-requested signal");
    assert(signalIds.includes("telegram-recruitment"), "Scam Screenshot: Triggered telegram-recruitment signal");
    assert(signalIds.includes("public-recruiter-email"), "Scam Screenshot: Triggered public-recruiter-email signal");
  }

  // ─── 5. Test Case: Offer Letter Screenshot ──────────────────────────────────
  {
    const offerLetterText = `We are pleased to offer you the position of Software Developer Intern at Acme Technologies.
Joining date: 1st October 2026.
Stipend: ₹25,000 per month.
Contact HR at careers@acmetech.com for joining formalities.`;

    const { evidence } = extractEvidenceFromText(offerLetterText, "screenshot", 92);

    assert(evidence.evidenceType === "offer_letter" || evidence.evidenceType === "internship", "Offer Letter: Classified as offer_letter or internship");
    assert(evidence.paymentRequested === false, "Offer Letter: paymentRequested is false");
    assert(evidence.recruiterEmail === "careers@acmetech.com", "Offer Letter: Extracted corporate email");
    assert(evidence.stipendText?.includes("₹25,000") === true, "Offer Letter: Extracted stipend");

    const oppInput = normalizeEvidenceToInput(evidence);
    const analysis = analyzeOpportunity(oppInput);
    assert(analysis.level === "safe" || analysis.level === "review", "Offer Letter: Not flagged as high scam risk");
  }

  // ─── 6. Test Case: Low Quality / Blurry Screenshot (< 15 chars) ─────────────
  {
    const blurryOcrText = `... x # `;
    const { evidence } = extractEvidenceFromText(blurryOcrText, "screenshot", 25);

    assert(evidence.evidenceQuality === "insufficient", "Low Quality: evidenceQuality is 'insufficient'");
    assert(evidence.paymentRequested === false || evidence.paymentRequested === null, "Low Quality: No payment hallucinated");
  }

  // ─── 7. File Validation Tests ───────────────────────────────────────────────
  {
    const validPng = { size: 1024 * 500, type: "image/png" } as File;
    assert(validateScreenshotFile(validPng).valid === true, "Validator: PNG under 5MB passes");

    const validJpg = { size: 1024 * 1024 * 3, type: "image/jpeg" } as File;
    assert(validateScreenshotFile(validJpg).valid === true, "Validator: JPEG 3MB passes");

    const validWebp = { size: 1024 * 200, type: "image/webp" } as File;
    assert(validateScreenshotFile(validWebp).valid === true, "Validator: WEBP passes");

    const oversize = { size: 1024 * 1024 * 6, type: "image/png" } as File;
    assert(validateScreenshotFile(oversize).valid === false, "Validator: > 5MB rejected");

    const invalidType = { size: 1024 * 100, type: "application/pdf" } as File;
    assert(validateScreenshotFile(invalidType).valid === false, "Validator: PDF rejected");

    const emptyFile = { size: 0, type: "image/png" } as File;
    assert(validateScreenshotFile(emptyFile).valid === false, "Validator: Empty 0-byte file rejected");
  }

  console.log(`\n--- Results: ${passed}/${total} tests passed ---`);
  return passed === total;
}

runOcrEvidenceTests();
