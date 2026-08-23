/**
 * Phase 15: Dashboard Analytics & Intelligent History Unit Tests
 * Run with: npx tsx src/lib/analytics/__tests__/analytics.test.ts
 */

import { getDateRangeTimestamp, formatRecentCheckItem } from "../dashboard";

export function runAnalyticsTests(): boolean {
  console.log("--- Running Phase 15 Dashboard Analytics Unit Tests ---");
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

  // 1. Date Range Timestamps
  {
    const all = getDateRangeTimestamp("all");
    assert(all === null, "DateRange: 'all' returns null");

    const t7d = getDateRangeTimestamp("7d");
    assert(t7d !== null && typeof t7d === "string", "DateRange: '7d' returns ISO timestamp");
    const diff7d = Date.now() - new Date(t7d!).getTime();
    assert(diff7d >= 6 * 24 * 60 * 60 * 1000, "DateRange: '7d' is at least 6 days ago");

    const t30d = getDateRangeTimestamp("30d");
    assert(t30d !== null, "DateRange: '30d' returns ISO timestamp");

    const t90d = getDateRangeTimestamp("90d");
    assert(t90d !== null, "DateRange: '90d' returns ISO timestamp");
  }

  // 2. formatRecentCheckItem - Screenshot Evidence
  {
    const raw = {
      id: "ver-101",
      company_name: "Tech Solutions",
      job_title: "Data Entry Intern",
      input_type: "evidence",
      risk_score: 82,
      risk_level: "high",
      metadata: {
        sourceType: "screenshot",
        companyName: "Tech Solutions",
      },
      created_at: "2026-08-23T10:00:00Z",
    };

    const formatted = formatRecentCheckItem(raw);
    assert(formatted.id === "ver-101", "Format: ID matches");
    assert(formatted.title === "Data Entry Intern", "Format: Title is job_title");
    assert(formatted.subtitle === "Tech Solutions", "Format: Subtitle is company_name");
    assert(formatted.sourceType === "screenshot", "Format: Source type is screenshot");
    assert(formatted.sourceLabel === "Screenshot", "Format: Source label is Screenshot");
    assert(formatted.riskLevel === "high", "Format: Risk level is high");
    assert(formatted.riskScore === 82, "Format: Risk score is 82");
  }

  // 3. formatRecentCheckItem - URL Intelligence
  {
    const raw = {
      id: "ver-102",
      url: "https://careers.microsoft.com",
      input_type: "url",
      risk_score: 15,
      risk_level: "safe",
      metadata: {
        sourceType: "url",
      },
      created_at: "2026-08-23T09:00:00Z",
    };

    const formatted = formatRecentCheckItem(raw);
    assert(formatted.sourceType === "url", "Format URL: Source type is url");
    assert(formatted.sourceLabel === "URL", "Format URL: Source label is URL");
    assert(formatted.title === "careers.microsoft.com", "Format URL: Fallback title from hostname");
    assert(formatted.riskLevel === "safe", "Format URL: Risk level is safe");
  }

  // 4. formatRecentCheckItem - Company Verification
  {
    const raw = {
      id: "ver-103",
      company_name: "Google LLC",
      input_type: "company",
      risk_score: 5,
      risk_level: "safe",
      metadata: {
        sourceType: "company",
      },
      created_at: "2026-08-23T08:00:00Z",
    };

    const formatted = formatRecentCheckItem(raw);
    assert(formatted.sourceType === "company", "Format Company: Source type is company");
    assert(formatted.sourceLabel === "Company", "Format Company: Source label is Company");
    assert(formatted.title === "Google LLC", "Format Company: Title is company_name");
  }

  // 5. formatRecentCheckItem - Text Evidence
  {
    const raw = {
      id: "ver-104",
      job_title: "Remote Customer Support",
      input_type: "evidence",
      risk_score: 45,
      risk_level: "review",
      metadata: {
        sourceType: "text",
      },
      created_at: "2026-08-23T07:00:00Z",
    };

    const formatted = formatRecentCheckItem(raw);
    assert(formatted.sourceType === "text", "Format Text: Source type is text");
    assert(formatted.sourceLabel === "Text", "Format Text: Source label is Text");
    assert(formatted.riskLevel === "review", "Format Text: Risk level is review");
  }

  console.log(`\n--- Results: ${passed}/${total} tests passed ---`);
  return passed === total;
}

runAnalyticsTests();
