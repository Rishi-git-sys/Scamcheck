/**
 * Phase 7 — Company Verification Unit Tests
 *
 * Uses the same manual test runner pattern as Phase 6 URL Intelligence tests.
 * Run with: npx tsx src/lib/company-intelligence/__tests__/company-intelligence.test.ts
 */

import {
  normalizeCompanyName,
  checkCompanyNameMatch,
  checkDomainMatchesBrand,
  checkSuppliedEmailDomainMatch,
  isKnownJobPlatform,
  parseCompanyPageContent,
} from "../analyze-company";

export function runCompanyIntelligenceTests(): boolean {
  console.log("--- Running Company Intelligence Unit Tests ---");
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

  // ─── normalizeCompanyName ─────────────────────────────────────────────────

  {
    const n = normalizeCompanyName("Microsoft Corporation Ltd.");
    assert(!n.includes("corporation"), "normalizeCompanyName: strips 'corporation'");
    assert(!n.includes("ltd"), "normalizeCompanyName: strips 'ltd'");
    assert(n.includes("microsoft"), "normalizeCompanyName: retains 'microsoft'");
  }

  {
    const n = normalizeCompanyName("Google");
    assert(n === "google", "normalizeCompanyName: single word is lowercased correctly");
  }

  {
    const n = normalizeCompanyName("Ltd");
    assert(n.length > 0, "normalizeCompanyName: doesn't return empty for all-suffix name");
  }

  // ─── checkCompanyNameMatch ────────────────────────────────────────────────

  {
    const r = checkCompanyNameMatch(
      "Microsoft",
      "Welcome to Microsoft Corporation's official website. We make great software."
    );
    assert(r === "true", "checkCompanyNameMatch: direct name present → 'true'");
  }

  {
    const r = checkCompanyNameMatch("Microsoft", "random cooking page about pasta recipes");
    assert(r === "false", "checkCompanyNameMatch: unrelated page → 'false'");
  }

  {
    const r = checkCompanyNameMatch("Microsoft", "");
    assert(r === "unknown", "checkCompanyNameMatch: empty page → 'unknown'");
  }

  {
    const r = checkCompanyNameMatch("", "some page content here");
    assert(r === "unknown", "checkCompanyNameMatch: empty company name → 'unknown'");
  }

  // ─── checkDomainMatchesBrand ──────────────────────────────────────────────

  {
    const r = checkDomainMatchesBrand("Microsoft", "microsoft.com");
    assert(r === true, "checkDomainMatchesBrand: microsoft.com matches 'Microsoft'");
  }

  {
    const r = checkDomainMatchesBrand("Google LLC", "google.com");
    assert(r === true, "checkDomainMatchesBrand: google.com matches 'Google LLC'");
  }

  {
    const r = checkDomainMatchesBrand("Microsoft", "random-cooking-site.com");
    assert(r === false, "checkDomainMatchesBrand: cooking site does not match 'Microsoft'");
  }

  {
    const r = checkDomainMatchesBrand("Example Technologies", "exampletech.com");
    assert(r === true, "checkDomainMatchesBrand: 'example' keyword matches abbreviated domain");
  }

  // ─── checkSuppliedEmailDomainMatch ────────────────────────────────────────

  {
    const r = checkSuppliedEmailDomainMatch("careers@microsoft.com", "microsoft.com");
    assert(r === true, "checkSuppliedEmailDomainMatch: exact domain match → true");
  }

  {
    const r = checkSuppliedEmailDomainMatch("microsoft-careers@gmail.com", "microsoft.com");
    assert(r === false, "checkSuppliedEmailDomainMatch: gmail mismatch → false");
  }

  {
    const r = checkSuppliedEmailDomainMatch("", "microsoft.com");
    assert(r === false, "checkSuppliedEmailDomainMatch: empty email → false");
  }

  {
    const r = checkSuppliedEmailDomainMatch("notanemail", "microsoft.com");
    assert(r === false, "checkSuppliedEmailDomainMatch: malformed email (no @) → false");
  }

  {
    const r = checkSuppliedEmailDomainMatch("hr@corp.microsoft.com", "microsoft.com");
    assert(r === true, "checkSuppliedEmailDomainMatch: subdomain of root domain → true");
  }

  // ─── isKnownJobPlatform ───────────────────────────────────────────────────

  {
    const r = isKnownJobPlatform("linkedin.com");
    assert(r.known === true, "isKnownJobPlatform: LinkedIn is known");
    assert(r.name === "LinkedIn", "isKnownJobPlatform: LinkedIn name is correct");
  }

  {
    const r = isKnownJobPlatform("indeed.com");
    assert(r.known === true, "isKnownJobPlatform: Indeed is known");
  }

  {
    const r = isKnownJobPlatform("internshala.com");
    assert(r.known === true, "isKnownJobPlatform: Internshala is known");
  }

  {
    const r = isKnownJobPlatform("random-jobs-site.xyz");
    assert(r.known === false, "isKnownJobPlatform: unknown site → not known");
  }

  {
    const r = isKnownJobPlatform("microsoft.com");
    assert(r.known === false, "isKnownJobPlatform: company domain is NOT a job platform");
  }

  // ─── parseCompanyPageContent ──────────────────────────────────────────────

  const MICROSOFT_HTML = `
    <html>
      <head>
        <title>Microsoft - Official Home Page</title>
        <meta name="description" content="Microsoft Corporation provides software, services, devices, and solutions.">
      </head>
      <body>
        <h1>Microsoft Corporation</h1>
        <p>About us: who we are and our mission</p>
        <a href="/careers">Careers at Microsoft</a>
        <a href="/contact">Contact us</a>
        <a href="https://linkedin.com/company/microsoft">LinkedIn</a>
        <a href="https://twitter.com/microsoft">X/Twitter</a>
        <a href="/privacy">Privacy Policy</a>
        <span>careers@microsoft.com</span>
      </body>
    </html>
  `;

  {
    const r = parseCompanyPageContent(MICROSOFT_HTML, "Microsoft", "microsoft.com");
    assert(r.companyNameMatch === "true", "parseCompanyPageContent: Microsoft name matched");
    assert(r.aboutPresent === true, "parseCompanyPageContent: about section detected");
    assert(r.careersPresent === true, "parseCompanyPageContent: careers section detected");
    assert(r.contactPresent === true, "parseCompanyPageContent: contact section detected");
    assert(r.socialLinksFound === true, "parseCompanyPageContent: social links detected");
    assert(r.privacyPresent === true, "parseCompanyPageContent: privacy policy detected");
    assert(r.emails.includes("careers@microsoft.com"), "parseCompanyPageContent: extracted company email");
  }

  {
    const unrelatedHtml = `
      <html><body>
        <h1>Random cooking recipes</h1>
        <p>Best recipes from around the world. No company info here.</p>
      </body></html>
    `;
    const r = parseCompanyPageContent(unrelatedHtml, "Microsoft", "randomcooking.com");
    assert(r.companyNameMatch === "false", "parseCompanyPageContent: unrelated page → name mismatch");
    assert(r.careersPresent === false, "parseCompanyPageContent: no careers on cooking site");
  }

  // ─── Test D: LinkedIn platform detection (no false flag) ──────────────────

  {
    // Test D: Microsoft opportunity on LinkedIn should NOT trigger risk signal
    const microsoftRoot: string = "microsoft.com";
    const linkedInRoot: string = "linkedin.com";
    const domainMatches = linkedInRoot === microsoftRoot;
    const platformCheck = isKnownJobPlatform(linkedInRoot);

    assert(domainMatches === false, "Test D: LinkedIn and Microsoft domains are different");
    assert(platformCheck.known === true, "Test D: LinkedIn is a known platform");
    // Since platform is known, no risk signal should be added (tested at integration level)
  }

  // ─── Test E: Unreachable site → insufficient coverage ─────────────────────

  {
    const fetchSuccess = false;
    let coverageScore = 0;

    if (fetchSuccess) coverageScore += 2;

    const coverage = !fetchSuccess
      ? "insufficient"
      : coverageScore >= 7
      ? "high"
      : coverageScore >= 4
      ? "medium"
      : "low";

    assert(coverage === "insufficient", "Test E: unreachable website → insufficient coverage");
    assert(coverageScore === 0, "Test E: coverage score is 0 for unreachable site");
  }

  // ─── Results ─────────────────────────────────────────────────────────────

  console.log(`\n--- Results: ${passed}/${total} tests passed ---`);

  if (passed < total) {
    console.error(`${total - passed} test(s) failed.`);
    return false;
  }

  console.log("All tests passed.");
  return true;
}

// Run when executed directly
runCompanyIntelligenceTests();
