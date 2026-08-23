/**
 * Phase 14: Unified Verification Report Builder Unit Tests
 * Run with: npx tsx src/lib/report/__tests__/report-builder.test.ts
 */

import { buildScamCheckReport } from "../buildReport";

export function runReportBuilderTests(): boolean {
  console.log("--- Running Phase 14 Report Builder Unit Tests ---");
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

  // 1. Test Case: High Risk Scam Report
  {
    const rawRecord = {
      id: "ver-test-high-001",
      risk_score: 82,
      risk_level: "high",
      input_type: "evidence",
      company_name: "Global Data Works",
      job_title: "Data Entry Intern",
      recruiter_email: "recruiter@gmail.com",
      contact_method: "Telegram",
      payment_requested: true,
      job_description: "Pay ₹999 registration fee to confirm your seat on Telegram @examplejobs",
      risk_signals: [
        {
          signal_id: "payment-requested",
          title: "Employment-related payment request",
          description: "Applicant asked to pay ₹999 fee",
          severity: "high",
          points: 35,
        },
        {
          signal_id: "public-recruiter-email",
          title: "Public recruiter email",
          description: "Recruiter uses public email provider",
          severity: "medium",
          points: 10,
        },
        {
          signal_id: "telegram-recruitment",
          title: "Informal Telegram recruitment",
          description: "Interview conducted over Telegram",
          severity: "medium",
          points: 10,
        },
      ],
      metadata: {
        sourceType: "screenshot",
        evidenceQuality: "high",
        companyName: "Global Data Works",
        jobTitle: "Data Entry Intern",
        recruiterEmail: "recruiter@gmail.com",
        contactMethod: "Telegram",
        telegramUsername: "@examplejobs",
        paymentRequested: true,
        paymentAmount: "₹999",
        recruiterVerification: {
          status: "needs_review",
          publicProvider: true,
          domainMatch: false,
          reasons: ["Public email provider used."],
        },
        contentIntelligence: {
          paymentRequested: true,
          paymentAmount: "₹999",
          informalContact: "Telegram",
          findings: [
            {
              title: "Upfront Payment Request",
              description: "Fee of ₹999 requested",
              severity: "high",
              source: "screenshot",
            },
          ],
        },
      },
    };

    const report = buildScamCheckReport(rawRecord);

    assert(report.riskLevel === "high", "High Risk: Level is 'high'");
    assert(report.riskLevelLabel === "HIGH RISK", "High Risk: Label is 'HIGH RISK'");
    assert(report.riskScore === 82, "High Risk: Score matches 82");
    assert(report.signals.length === 3, "High Risk: 3 signals sorted and present");
    assert(report.signals[0].severity === "high", "High Risk: High severity signal is prioritized first");
    assert(report.signals[0].source === "screenshot", "High Risk: Signal has screenshot provenance");
    assert(report.evidence.fields.some((f) => f.label === "Payment Requested"), "High Risk: Payment field detected in evidence");
    assert(report.recruiter?.status === "needs_review", "High Risk: Recruiter status is needs_review");
    assert(report.content?.paymentRequested === true, "High Risk: Content indicates payment requested");
    assert(report.recommendations.some((r) => r.includes("Do not pay")), "High Risk: Recommendations include 'Do not pay'");
    assert(report.shareableSummaryText.includes("HIGH RISK (82/100)"), "High Risk: Shareable summary includes score");
  }

  // 2. Test Case: Consistent Opportunity Report
  {
    const rawRecord = {
      id: "ver-test-safe-002",
      risk_score: 5,
      risk_level: "safe",
      input_type: "url",
      url: "https://careers.microsoft.com",
      company_name: "Microsoft",
      job_title: "Software Engineer Intern",
      recruiter_email: "recruiter@microsoft.com",
      risk_signals: [],
      metadata: {
        sourceType: "url",
        evidenceQuality: "high",
        companyName: "Microsoft",
        jobTitle: "Software Engineer Intern",
        recruiterEmail: "recruiter@microsoft.com",
        https: true,
        companyVerification: {
          companyName: "Microsoft",
          website: "https://www.microsoft.com",
          status: "consistent",
          websiteReachable: true,
          hasHttps: true,
          careersPageDetected: true,
          companyNameMatchesDomain: true,
        },
        recruiterVerification: {
          status: "consistent",
          domainMatch: true,
          publicProvider: false,
          reasons: ["Email domain matches company website."],
        },
        contentIntelligence: {
          paymentRequested: false,
          officialApplicationEvidence: true,
          findings: [],
        },
      },
    };

    const report = buildScamCheckReport(rawRecord);

    assert(report.riskLevel === "safe", "Consistent: Level is 'safe'");
    assert(report.riskScore === 5, "Consistent: Score is 5");
    assert(report.signals.length === 0, "Consistent: Zero warning signals");
    assert(report.company?.status === "consistent", "Consistent: Company is consistent");
    assert(report.recruiter?.status === "consistent", "Consistent: Recruiter is consistent");
    assert(report.positiveEvidence.some((p) => p.includes("matches")), "Consistent: Positive evidence includes matching email domain");
  }

  // 3. Test Case: Insufficient Evidence Report
  {
    const rawRecord = {
      id: "ver-test-insuf-003",
      risk_score: 0,
      risk_level: "safe",
      input_type: "evidence",
      job_description: "Congratulations!",
      risk_signals: [],
      metadata: {
        sourceType: "screenshot",
        evidenceQuality: "insufficient",
      },
    };

    const report = buildScamCheckReport(rawRecord);

    assert(report.verificationCoverage === "insufficient", "Insufficient: Coverage is 'insufficient'");
    assert(report.coverageLabel === "INSUFFICIENT COVERAGE", "Insufficient: Label matches");
    assert(report.evidence.fields.length === 0, "Insufficient: No fake fields invented");
    assert(report.signals.length === 0, "Insufficient: No fabricated scam signals");
    assert(report.missingEvidence.length > 0, "Insufficient: Missing evidence notes captured");
  }

  // 4. Test Case: AI & Threat Intel Fallback Gracefulness
  {
    const rawRecord = {
      id: "ver-test-fallback-004",
      risk_score: 45,
      risk_level: "review",
      input_type: "evidence",
      metadata: {
        sourceType: "text",
        aiAnalysis: null,
        threatIntelligence: null,
      },
    };

    const report = buildScamCheckReport(rawRecord);

    assert(report.aiAnalysis === null, "Fallback: Handles null aiAnalysis");
    assert(report.threatIntelligence === null, "Fallback: Handles null threatIntelligence");
    assert(report.assessmentSummary.length > 0, "Fallback: Produces clean assessment summary");
    assert(report.recommendations.length > 0, "Fallback: Generates recommendations without error");
  }

  console.log(`\n--- Results: ${passed}/${total} tests passed ---`);
  return passed === total;
}

runReportBuilderTests();
