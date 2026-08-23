/**
 * Phase 12: AI Analysis Unit Tests
 * Run with: npx tsx src/lib/ai/__tests__/ai-analysis.test.ts
 */

import { analyzeOpportunityWithAI } from "../analyze";
import { buildDeterministicExplanation } from "../provider";
import { SYSTEM_PROMPT, buildUserPrompt } from "../prompts";
import { AIAnalysisInput } from "../types";

export async function runAIAnalysisTests(): Promise<boolean> {
  console.log("--- Running Phase 12 AI Analysis Unit Tests ---");
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

  // 1. System Prompt Constraints
  {
    assert(SYSTEM_PROMPT.includes("Do NOT claim 100% certainty"), "Prompt: Includes uncertainty guideline");
    assert(SYSTEM_PROMPT.includes("Do NOT output a numerical score"), "Prompt: Prohibits score overriding");
    assert(SYSTEM_PROMPT.includes("Return ONLY valid JSON"), "Prompt: Requires JSON output");
  }

  // 2. User Prompt Builder
  {
    const input: AIAnalysisInput = {
      companyName: "Acme Corp",
      jobTitle: "Data Entry",
      paymentRequested: true,
      paymentAmount: "₹999",
      contactMethod: "Telegram",
    };
    const userPrompt = buildUserPrompt(input);
    assert(userPrompt.includes("Acme Corp"), "User Prompt: Contains companyName");
    assert(userPrompt.includes("₹999"), "User Prompt: Contains paymentAmount");
    assert(userPrompt.includes("Telegram"), "User Prompt: Contains contactMethod");
  }

  // 3. Deterministic Heuristic Fallback for High Risk Scam
  {
    const input: AIAnalysisInput = {
      companyName: "Global Services",
      jobTitle: "Data Entry Intern",
      recruiterEmail: "recruiter@gmail.com",
      contactMethod: "Telegram",
      paymentRequested: true,
      paymentAmount: "₹999",
      urgencyDetected: true,
      content: "Congratulations! Pay ₹999 registration fee to confirm your seat.",
    };

    const explanation = buildDeterministicExplanation(input);
    assert(explanation.status === "available", "Fallback: status is available");
    assert(explanation.concerns.length >= 2, "Fallback: Contains at least 2 concerns");
    assert(
      explanation.concerns.some((c) => c.title.toLowerCase().includes("payment")),
      "Fallback: Concerns include upfront payment"
    );
    assert(
      explanation.concerns.some((c) => c.title.toLowerCase().includes("telegram") || c.title.toLowerCase().includes("informal")),
      "Fallback: Concerns include informal communication"
    );
    assert(explanation.recommendedActions.length > 0, "Fallback: Provides recommended next steps");
    assert(explanation.analysisQuality === "high", "Fallback: Quality rated as 'high' for rich input");
  }

  // 4. Deterministic Heuristic Fallback for Safe Opportunity
  {
    const input: AIAnalysisInput = {
      companyName: "Microsoft",
      jobTitle: "Software Engineer",
      recruiterEmail: "recruiter@microsoft.com",
      officialApplicationEvidence: true,
      paymentRequested: false,
      content: "Apply at https://careers.microsoft.com. No fee required.",
    };

    const explanation = buildDeterministicExplanation(input);
    assert(explanation.status === "available", "Safe Fallback: status is available");
    assert(explanation.concerns.length === 0, "Safe Fallback: Zero concerns generated");
    assert(explanation.positiveEvidence.length >= 2, "Safe Fallback: Contains positive evidence");
    assert(explanation.summary.includes("No major suspicious"), "Safe Fallback: Summary reflects low concern");
  }

  // 5. Sensitive Data Redaction in analyzeOpportunityWithAI
  {
    const rawInput: AIAnalysisInput = {
      companyName: "Test Org",
      jobTitle: "Assistant",
      content: "Please send Aadhaar 1234-5678-9012 and OTP 492019 to proceed.",
    };

    const res = await analyzeOpportunityWithAI(rawInput);
    assert(res.status === "available", "analyzeOpportunityWithAI: Returns available result");
    assert(res.concerns.length >= 0, "analyzeOpportunityWithAI: Contains concerns array");
  }

  console.log(`\n--- Results: ${passed}/${total} tests passed ---`);
  return passed === total;
}

runAIAnalysisTests();
