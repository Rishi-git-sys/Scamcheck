/**
 * Test Screenshot Analysis Pipeline with Exact Diagnostic Logging
 */

import { performServerOcr } from "../src/lib/evidence/server-ocr";
import { extractEvidenceFromText } from "../src/lib/evidence/extract";
import { normalizeEvidenceToInput } from "../src/lib/evidence/normalize";
import { analyzeOpportunity } from "../src/lib/risk-engine/analyzer";
import { verifyRecruiter } from "../src/lib/recruiter-verification/analyzer";
import { analyzeContentIntelligence } from "../src/lib/content-intelligence/analyzer";
import { checkDomainThreatIntelligence } from "../src/lib/threat-intel";
import { analyzeOpportunityWithAI } from "../src/lib/ai/analyze";

async function debugScreenshotPipeline() {
  console.log("[SCREENSHOT] upload complete");
  console.log("[SCREENSHOT] analysis started");

  const sampleOfferText = `Urgent: Internship Offer & Registration
From: Recruiter <recruiter@gmail.com>
To: candidate@example.com

Congratulations! You have been selected for a Data Entry Internship at GlobalTech Solutions.
Please pay ₹999 registration fee to confirm your seat.
Contact us on Telegram @examplejobs for onboarding instructions.
Limited seats available. Apply immediately.`;

  // Test 1: Full OCR execution on a valid minimal image buffer
  console.log("[SCREENSHOT] OCR started");
  console.log("[SCREENSHOT] OCR request sent");

  // Valid 1x1 PNG header
  const pngHeader = Buffer.from([
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

  const ocrResult = await performServerOcr(pngHeader);
  console.log("[SCREENSHOT] OCR response received (status:", ocrResult.status, ")");
  console.log("[SCREENSHOT] OCR parsing started");
  console.log("[SCREENSHOT] OCR parsing complete");

  // Test 2: Downstream Analysis Pipeline
  console.log("[SCREENSHOT] evidence extraction started");
  const { evidence, notes } = extractEvidenceFromText(sampleOfferText, "screenshot", 90);
  console.log("[SCREENSHOT] evidence extraction complete");

  const recruiterResult = verifyRecruiter({
    recruiterName: evidence.recruiterName,
    recruiterEmail: evidence.recruiterEmail,
    phoneNumber: evidence.phoneNumber,
    contactMethod: evidence.contactMethod,
    companyName: evidence.companyName,
    opportunityUrl: evidence.detectedUrls?.[0],
  });

  const contentResult = analyzeContentIntelligence(sampleOfferText);

  let threatIntelResult: any = null;
  if (evidence.detectedUrls && evidence.detectedUrls.length > 0) {
    threatIntelResult = await checkDomainThreatIntelligence(evidence.detectedUrls[0]);
  }

  const combinedExtraSignals = [
    ...recruiterResult.signals,
    ...contentResult.signals,
    ...(threatIntelResult?.signals || []),
  ];

  const opportunityInput = normalizeEvidenceToInput({
    ...evidence,
    paymentRequested: contentResult.paymentRequested || evidence.paymentRequested,
    paymentAmount: contentResult.paymentAmount || evidence.paymentAmount,
  });

  const analysis = analyzeOpportunity(opportunityInput, combinedExtraSignals);

  const aiResult = await analyzeOpportunityWithAI({
    companyName: evidence.companyName,
    jobTitle: evidence.jobTitle,
    recruiterEmail: evidence.recruiterEmail,
    recruiterName: evidence.recruiterName,
    contactMethod: evidence.contactMethod,
    paymentRequested: contentResult.paymentRequested || evidence.paymentRequested,
    paymentAmount: contentResult.paymentAmount || evidence.paymentAmount,
    urgencyDetected: contentResult.urgencyDetected,
    sensitiveInfoRequested: contentResult.sensitiveInfoRequested,
    financialInfoRequested: contentResult.financialInfoRequested,
    officialApplicationEvidence: contentResult.officialApplicationEvidence,
    detectedUrls: evidence.detectedUrls,
    deterministicLevel: analysis.level,
    deterministicSignals: analysis.signals.map((s) => s.title),
    content: sampleOfferText,
  });

  console.log("[SCREENSHOT] analysis complete (risk level:", analysis.level, ", score:", analysis.score, ")");
}

debugScreenshotPipeline();
