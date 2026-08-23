/**
 * Unified Test Suite Runner for ScamCheck
 */

import { runCorrelationTests } from "../src/lib/risk/__tests__/correlation.test";
import { runOcrEvidenceTests } from "../src/lib/evidence/__tests__/ocr-evidence.test";

async function run() {
  console.log("=========================================");
  console.log("SCAMCHECK COMPLETE SUITE VALIDATION");
  console.log("=========================================\n");

  const corrPassed = runCorrelationTests();
  console.log("\n");
  const ocrPassed = runOcrEvidenceTests();

  if (corrPassed && ocrPassed) {
    console.log("\nALL TESTS PASSED SUCCESSFULLY! ✓");
  } else {
    console.error("\nTEST SUITE FAILED ✗");
    process.exit(1);
  }
}

run();
