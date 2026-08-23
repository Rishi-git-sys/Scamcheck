import { validateAndNormalizeUrl, isPrivateOrLocalIp } from "../validate-url";
import { parseDomain } from "../domain-analysis";
import { parsePageMetadata, extractTextFromHtml } from "../parse-page";
import { assessVerificationCoverage } from "../coverage-analysis";

export function runUrlIntelligenceTests(): boolean {
  console.log("--- Running URL Intelligence Unit Tests ---");
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

  // 1. URL Validation Tests
  const validHttps = validateAndNormalizeUrl("https://careers.google.com/jobs/results/12345");
  assert(Boolean(validHttps.isValid && validHttps.normalizedUrl?.startsWith("https://")), "Valid HTTPS URL passes");

  const validNoProtocol = validateAndNormalizeUrl("microsoft.com/careers");
  assert(Boolean(validNoProtocol.isValid && validNoProtocol.normalizedUrl?.startsWith("https://")), "Auto-prepend HTTPS for normal domains");

  const invalidEmpty = validateAndNormalizeUrl("   ");
  assert(!invalidEmpty.isValid, "Empty URL rejected");

  const invalidScheme = validateAndNormalizeUrl("javascript:alert(1)");
  assert(!invalidScheme.isValid, "javascript: scheme rejected");

  const invalidData = validateAndNormalizeUrl("data:text/html,<h1>Test</h1>");
  assert(!invalidData.isValid, "data: scheme rejected");

  const invalidFile = validateAndNormalizeUrl("file:///etc/passwd");
  assert(!invalidFile.isValid, "file: scheme rejected");

  // 2. SSRF Protection Tests
  assert(isPrivateOrLocalIp("127.0.0.1"), "127.0.0.1 identified as local loopback");
  assert(isPrivateOrLocalIp("10.0.0.5"), "10.0.0.5 identified as private IPv4");
  assert(isPrivateOrLocalIp("192.168.1.1"), "192.168.1.1 identified as private IPv4");
  assert(isPrivateOrLocalIp("172.20.0.1"), "172.20.0.1 identified as private IPv4");
  assert(isPrivateOrLocalIp("169.254.169.254"), "169.254.169.254 cloud metadata endpoint identified as link-local");
  assert(isPrivateOrLocalIp("::1"), "::1 identified as IPv6 loopback");
  assert(!isPrivateOrLocalIp("8.8.8.8"), "8.8.8.8 identified as public IP");

  const localhostRejection = validateAndNormalizeUrl("http://localhost:3000/api");
  assert(!localhostRejection.isValid, "localhost URL rejected by validator");

  const metadataRejection = validateAndNormalizeUrl("http://169.254.169.254/latest/meta-data/");
  assert(!metadataRejection.isValid, "Cloud metadata IP URL rejected by validator");

  // 3. Domain Analysis Tests
  const googleDomain = parseDomain(new URL("https://careers.google.com/jobs"));
  assert(googleDomain.rootDomain === "google.com" && googleDomain.protocol === "https:", "Domain parser identifies root domain & HTTPS");

  const shortenerDomain = parseDomain(new URL("https://bit.ly/3xJobApply"));
  assert(shortenerDomain.isShortener, "bit.ly identified as URL shortener");

  const ipDomain = parseDomain(new URL("http://185.199.108.153/careers"));
  assert(ipDomain.isIpAddress && ipDomain.protocol === "http:", "IP address host identified with HTTP");

  const linkedinDomain = parseDomain(new URL("https://www.linkedin.com/company/acme-corp/"));
  assert(linkedinDomain.isKnownPlatform && linkedinDomain.platformName === "LinkedIn", "LinkedIn identified as recognized platform");

  // 4. HTML Parsing & Text Extraction Tests
  const sampleJobHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Software Intern at TechCorp</title>
        <meta name="description" content="Join our engineering team for a summer internship." />
      </head>
      <body>
        <h1>Frontend Developer Internship</h1>
        <p>Key responsibilities: Build UI components, write tests.</p>
        <p>Requirements: JavaScript, React, Git.</p>
        <button>Apply Now</button>
        <p>Contact recruiter: hiring@techcorp.com</p>
      </body>
    </html>
  `;

  const parsedJobMeta = parsePageMetadata(sampleJobHtml, "techcorp.com", "/jobs/123");
  assert(parsedJobMeta.title === "Software Intern at TechCorp", "HTML title parsed correctly");
  assert(parsedJobMeta.jobRelated, "Job-related page content detected");
  assert(parsedJobMeta.hasApplyButton, "Apply button detected");
  assert(parsedJobMeta.hasRoleDetails, "Role details detected");
  assert(parsedJobMeta.hasRequirements, "Requirements detected");

  const jobCoverage = assessVerificationCoverage(parsedJobMeta, googleDomain, true);
  assert(jobCoverage.level === "high" && jobCoverage.isSpecificJobListing, "Specific job listing receives high verification coverage");

  // 5. Company / Showcase Page Coverage Tests
  const sampleShowcaseHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Acme Corp: Overview | LinkedIn</title>
      </head>
      <body>
        <h1>Acme Corp</h1>
        <p>Technology & Cloud Services. 10,000+ employees.</p>
        <p>Showcase page for product updates and news.</p>
      </body>
    </html>
  `;

  const parsedShowcaseMeta = parsePageMetadata(sampleShowcaseHtml, "linkedin.com", "/company/acme-corp/");
  assert(parsedShowcaseMeta.isCompanyOrShowcasePage, "Company profile / showcase URL identified");

  const showcaseCoverage = assessVerificationCoverage(parsedShowcaseMeta, linkedinDomain, true);
  assert(
    showcaseCoverage.level === "low" && !showcaseCoverage.isSpecificJobListing && showcaseCoverage.label === "Limited",
    "Showcase / company profile receives Limited verification coverage without raising scam risk"
  );

  console.log(`--- Unit Tests Finished: ${passed}/${total} assertions passed ---`);
  return passed === total;
}
