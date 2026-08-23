// ==============================================================================
// Phase 12: AI Provider Abstraction
// Supports remote AI provider (OpenAI/Gemini/Claude) with graceful fallback
// ==============================================================================

import { AIAnalysisInput, AIAnalysisResult, AIProvider, AIAnalysisQuality } from "./types";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";

/**
 * Calculates analysis quality based on evidence completeness.
 */
function calculateAnalysisQuality(input: AIAnalysisInput): AIAnalysisQuality {
  let fieldsPresent = 0;
  if (input.companyName) fieldsPresent++;
  if (input.jobTitle) fieldsPresent++;
  if (input.recruiterEmail) fieldsPresent++;
  if (input.contactMethod) fieldsPresent++;
  if (input.content && input.content.length > 50) fieldsPresent++;

  if (fieldsPresent >= 4) return "high";
  if (fieldsPresent >= 2) return "medium";
  return "limited";
}

/**
 * Deterministic explanation builder when external AI is unconfigured or unavailable.
 * Ensures the system ALWAYS delivers insightful explanations without external dependencies.
 */
export function buildDeterministicExplanation(input: AIAnalysisInput): AIAnalysisResult {
  const quality = calculateAnalysisQuality(input);
  const concerns: { title: string; explanation: string; severity: "low" | "medium" | "high" }[] = [];
  const positiveEvidence: string[] = [];
  const missingEvidence: string[] = [];
  const recommendedActions: string[] = [];

  // 1. Payment Analysis
  if (input.paymentRequested) {
    concerns.push({
      title: "Upfront Payment Required",
      explanation: `Legitimate employers and reputable internship programs do not require candidates to pay registration, processing, or training fees (${input.paymentAmount || "upfront payment"}). This is one of the strongest indicators of recruitment fraud.`,
      severity: "high",
    });
    recommendedActions.push("Do not send money or pay any fee to secure this opportunity.");
  } else {
    positiveEvidence.push("No upfront registration or processing fee was detected.");
  }

  // 2. Sensitive Information
  if (input.sensitiveInfoRequested || input.financialInfoRequested) {
    concerns.push({
      title: "Premature Identity or Financial Request",
      explanation: "Requesting bank credentials, UPI PINs, Aadhaar, or PAN cards before an official interview and written contract is high-risk.",
      severity: "high",
    });
    recommendedActions.push("Refuse to share banking credentials, OTPs, or government IDs.");
  }

  // 3. Contact Method
  const method = (input.contactMethod || "").toLowerCase();
  if (method === "telegram" || method === "whatsapp") {
    concerns.push({
      title: "Informal Recruitment Communication",
      explanation: `Recruiting solely over ${input.contactMethod} without an official corporate email or interview portal provides no institutional accountability.`,
      severity: "medium",
    });
    recommendedActions.push("Request communication through the company's verified email domain.");
  }

  // 4. Urgency
  if (input.urgencyDetected) {
    concerns.push({
      title: "High-Pressure Urgency",
      explanation: "Artificial deadlines and rush tactics ('apply immediately', 'limited seats') are designed to bypass critical thinking and verification.",
      severity: "medium",
    });
    recommendedActions.push("Take time to independently verify the employer before responding.");
  }

  // 5. Official Application
  if (input.officialApplicationEvidence) {
    positiveEvidence.push("Official corporate careers portal or application domain referenced.");
  } else {
    missingEvidence.push("No link to an official company careers portal.");
  }

  if (!input.recruiterEmail) {
    missingEvidence.push("No official corporate recruiter email provided.");
  }

  if (recommendedActions.length === 0) {
    recommendedActions.push("Verify the job posting directly on the company's official careers website.");
    recommendedActions.push("Check the recruiter's credentials on professional platforms like LinkedIn.");
  }

  let summary = "";
  let contextAssessment = "";

  if (concerns.length >= 2) {
    summary = `ScamCheck's analysis indicates that this opportunity exhibits multiple significant warning signs, including ${concerns.map((c) => c.title.toLowerCase()).join(" and ")}. Independent verification is strongly recommended.`;
    contextAssessment = "The combination of informal recruitment channels, upfront fee requests, or high pressure is inconsistent with standard corporate hiring practices.";
  } else if (concerns.length === 1) {
    summary = `This opportunity has one notable point of concern: ${concerns[0].title.toLowerCase()}. Proceed carefully and cross-check with official sources.`;
    contextAssessment = "While not conclusive proof of fraud, the detected patterns warrant extra caution before sharing details or accepting offers.";
  } else {
    summary = "No major suspicious recruitment patterns were detected in the provided details. Continue standard due diligence.";
    contextAssessment = "The submitted information appears consistent with typical opportunity listings, though independent verification on the company's official website remains best practice.";
  }

  return {
    status: "available",
    summary,
    concerns,
    positiveEvidence,
    missingEvidence,
    recommendedActions,
    contextAssessment,
    analysisQuality: quality,
  };
}

/**
 * Standard AI Provider implementation supporting external API keys with robust timeout.
 */
export class StandardAIProvider implements AIProvider {
  name = "StandardAIProvider";

  isAvailable(): boolean {
    return !!process.env.AI_API_KEY && process.env.AI_API_KEY.trim().length > 0;
  }

  async analyzeOpportunity(input: AIAnalysisInput): Promise<AIAnalysisResult> {
    const apiKey = process.env.AI_API_KEY;

    // If no external key configured, use explainable deterministic heuristic builder
    if (!apiKey) {
      return buildDeterministicExplanation(input);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

      const endpoint = process.env.AI_API_ENDPOINT || "https://api.openai.com/v1/chat/completions";
      const model = process.env.AI_MODEL || "gpt-4o-mini";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: buildUserPrompt(input) },
          ],
          temperature: 0.1,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`[ai-provider] External AI API returned status ${res.status}. Falling back to deterministic explanation.`);
        return buildDeterministicExplanation(input);
      }

      const data = await res.json();
      const rawContent = data.choices?.[0]?.message?.content;
      if (!rawContent) {
        return buildDeterministicExplanation(input);
      }

      const parsed = JSON.parse(rawContent);
      return {
        status: "available",
        summary: parsed.summary || "Analysis completed.",
        concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
        positiveEvidence: Array.isArray(parsed.positiveEvidence) ? parsed.positiveEvidence : [],
        missingEvidence: Array.isArray(parsed.missingEvidence) ? parsed.missingEvidence : [],
        recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [],
        contextAssessment: parsed.contextAssessment || "",
        analysisQuality: calculateAnalysisQuality(input),
      };
    } catch (err: any) {
      console.warn(`[ai-provider] AI call failed or timed out: ${err?.message}. Using deterministic explanation.`);
      return buildDeterministicExplanation(input);
    }
  }
}
