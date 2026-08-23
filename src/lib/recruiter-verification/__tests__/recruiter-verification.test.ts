/**
 * Phase 10: Recruiter Verification Unit Tests
 * Run with: npx tsx src/lib/recruiter-verification/__tests__/recruiter-verification.test.ts
 */

import { verifyRecruiter } from "../analyzer";

export function runRecruiterVerificationTests(): boolean {
  console.log("--- Running Phase 10 Recruiter Verification Unit Tests ---");
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

  // 1. Recruiter email matches company domain
  {
    const res = verifyRecruiter({
      recruiterName: "John Doe",
      recruiterEmail: "recruiter@microsoft.com",
      companyWebsite: "https://www.microsoft.com",
      companyName: "Microsoft",
    });

    assert(res.status === "consistent", "Domain Match: status is 'consistent'");
    assert(res.domainMatch === true, "Domain Match: domainMatch is true");
    assert(res.publicProvider === false, "Domain Match: publicProvider is false");
    assert(res.signals.length === 0, "Domain Match: No negative risk signals generated");
    assert(res.reasons.some((r) => r.includes("matches company domain")), "Domain Match: Positive consistency reason included");
  }

  // 2. Subdomain of company root domain matches
  {
    const res = verifyRecruiter({
      recruiterEmail: "hr@careers.microsoft.com",
      companyWebsite: "https://microsoft.com",
    });

    assert(res.status === "consistent", "Subdomain Match: careers.microsoft.com is consistent with microsoft.com");
    assert(res.domainMatch === true, "Subdomain Match: domainMatch is true");
  }

  // 3. Public email provider claiming corporate entity
  {
    const res = verifyRecruiter({
      recruiterName: "Sarah Connor",
      recruiterEmail: "microsoft-careers@gmail.com",
      companyWebsite: "https://www.microsoft.com",
      companyName: "Microsoft",
    });

    assert(res.status === "needs_review", "Public Provider: status is 'needs_review'");
    assert(res.publicProvider === true, "Public Provider: publicProvider is true");
    assert(res.domainMatch === false, "Public Provider: domainMatch is false");
    assert(res.signals.some((s) => s.id === "public-recruiter-email"), "Public Provider: Generated public-recruiter-email signal");
  }

  // 4. Mismatched private domain
  {
    const res = verifyRecruiter({
      recruiterEmail: "recruiter@thirdpartyagency.com",
      companyWebsite: "https://www.microsoft.com",
      companyName: "Microsoft",
    });

    assert(res.status === "needs_review", "Domain Mismatch: status is 'needs_review'");
    assert(res.domainMatch === false, "Domain Mismatch: domainMatch is false");
    assert(res.signals.some((s) => s.id === "recruiter-domain-mismatch"), "Domain Mismatch: Generated recruiter-domain-mismatch signal");
  }

  // 5. LinkedIn / Job board platform URL does NOT trigger false domain mismatch
  {
    const res = verifyRecruiter({
      recruiterEmail: "recruiter@microsoft.com",
      opportunityUrl: "https://www.linkedin.com/jobs/view/123456",
      companyName: "Microsoft",
    });

    assert(res.status !== "needs_review", "Job Board: LinkedIn URL does NOT trigger domain mismatch against microsoft.com email");
  }

  // 6. No recruiter info at all
  {
    const res = verifyRecruiter({});
    assert(res.status === "not_available", "No Recruiter Info: status is 'not_available'");
    assert(res.signals.length === 0, "No Recruiter Info: No signals generated");
  }

  // 7. Recruiter name only without verified email
  {
    const res = verifyRecruiter({
      recruiterName: "Alice Smith",
    });

    assert(res.status === "limited", "Name Only: status is 'limited'");
    assert(res.reasons.some((r) => r.includes("not independently verified")), "Name Only: Includes unverified identity note");
  }

  // 8. Telegram / WhatsApp only contact
  {
    const res = verifyRecruiter({
      contactMethod: "Telegram",
    });

    assert(res.status === "needs_review", "Telegram Only: status is 'needs_review'");
    assert(res.reasons.some((r) => r.includes("Telegram")), "Telegram Only: Reason mentions Telegram");
  }

  console.log(`\n--- Results: ${passed}/${total} tests passed ---`);
  return passed === total;
}

runRecruiterVerificationTests();
