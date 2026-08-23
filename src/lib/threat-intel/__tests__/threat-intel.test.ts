/**
 * Phase 13: Threat Intelligence Unit Tests
 * Run with: npx tsx src/lib/threat-intel/__tests__/threat-intel.test.ts
 */

import { checkDomainThreatIntelligence, setThreatIntelProvider } from "../index";
import { extractDomainParts } from "../domain";
import { ThreatIntelProvider } from "../types";

export async function runThreatIntelTests(): Promise<boolean> {
  console.log("--- Running Phase 13 Threat Intelligence Unit Tests ---");
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

  // 1. Domain Extraction
  {
    const p1 = extractDomainParts("https://careers.microsoft.com/us/en/job/12345");
    assert(p1.hostname === "careers.microsoft.com", "extractDomainParts: Hostname extracted");
    assert(p1.rootDomain === "microsoft.com", "extractDomainParts: Root domain extracted");
    assert(p1.isHttps === true, "extractDomainParts: HTTPS recognized");

    const p2 = extractDomainParts("http://insecure-site.org/apply");
    assert(p2.rootDomain === "insecure-site.org", "extractDomainParts: HTTP root domain extracted");
    assert(p2.isHttps === false, "extractDomainParts: HTTP recognized");
  }

  // 2. Unconfigured / Unavailable Provider Behavior
  {
    const res = await checkDomainThreatIntelligence("https://example.com");
    assert(res.hostname === "example.com", "Unconfigured: Hostname returned");
    assert(res.rootDomain === "example.com", "Unconfigured: Root domain returned");
    assert(res.signals.length === 0, "Unconfigured: No false risk signals created");
  }

  // 3. Mock Malicious Provider
  {
    const mockMaliciousProvider: ThreatIntelProvider = {
      name: "MockMaliciousProvider",
      isConfigured: () => true,
      checkDomain: async (domain: string) => ({
        status: "malicious",
        source: "Mock Threat DB",
        signals: [
          {
            id: "known-malicious-domain",
            title: "Known malicious domain",
            description: `The domain (${domain}) is listed in threat databases.`,
            severity: "high",
            points: 40,
          },
        ],
        reasons: ["Known malware distribution host."],
      }),
    };

    setThreatIntelProvider(mockMaliciousProvider);

    const res = await checkDomainThreatIntelligence("https://phishing-scam-domain.xyz");
    assert(res.status === "malicious", "Malicious Provider: Status is malicious");
    assert(res.signals.length === 1, "Malicious Provider: Signal count is 1");
    assert(res.signals[0].id === "known-malicious-domain", "Malicious Provider: Generated known-malicious-domain signal");
    assert(res.signals[0].points === 40, "Malicious Provider: Points equal 40");
  }

  // 4. Mock Clean / Unknown Provider
  {
    const mockCleanProvider: ThreatIntelProvider = {
      name: "MockCleanProvider",
      isConfigured: () => true,
      checkDomain: async () => ({
        status: "clean",
        source: "SafeBrowsing API",
        signals: [],
        reasons: ["No known threats detected."],
      }),
    };

    setThreatIntelProvider(mockCleanProvider);

    const res = await checkDomainThreatIntelligence("https://www.google.com");
    assert(res.status === "clean", "Clean Provider: Status is clean");
    assert(res.signals.length === 0, "Clean Provider: No penalty points added");
  }

  console.log(`\n--- Results: ${passed}/${total} tests passed ---`);
  return passed === total;
}

runThreatIntelTests();
