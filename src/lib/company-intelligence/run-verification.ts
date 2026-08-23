import { CompanyInput, CompanyIntelligence, CompanyAnalysisResult } from "./types";
import { VerificationCoverage, RiskLevel, RiskSignal } from "@/lib/risk-engine/types";
import { validateAndNormalizeUrl } from "@/lib/url-intelligence/validate-url";
import { parseDomain } from "@/lib/url-intelligence/domain-analysis";
import { safelyFetchPage } from "@/lib/url-intelligence/fetch-page";
import {
  parseCompanyPageContent,
  checkDomainMatchesBrand,
  checkSuppliedEmailDomainMatch,
  isKnownJobPlatform,
} from "./analyze-company";

export async function runCompanyVerification(input: CompanyInput): Promise<CompanyAnalysisResult> {
  // 1. Validate company website
  const validation = validateAndNormalizeUrl(input.companyWebsite);
  if (!validation.isValid || !validation.normalizedUrl || !validation.parsedUrl) {
    throw new Error(validation.error || "Please enter a valid public company website URL.");
  }

  const domainInfo = parseDomain(validation.parsedUrl);

  // 2. Fetch company website
  const fetchResult = await safelyFetchPage(validation.normalizedUrl);
  const finalUrl = fetchResult.finalUrl || validation.normalizedUrl;
  const finalParsed = new URL(finalUrl);
  const finalDomainInfo = parseDomain(finalParsed);

  const rootDomain = finalDomainInfo.rootDomain;

  // 3. Parse company page if fetch succeeded
  let pageAnalysis: ReturnType<typeof parseCompanyPageContent> | null = null;
  if (fetchResult.success && fetchResult.html) {
    pageAnalysis = parseCompanyPageContent(fetchResult.html, input.companyName, rootDomain);
  }

  // 4. Domain brand match
  const domainMatchesBrand = checkDomainMatchesBrand(input.companyName, rootDomain);

  // 5. Supplied email check
  let suppliedEmailDomainMatches: boolean | undefined = undefined;
  if (input.companyEmail) {
    suppliedEmailDomainMatches = checkSuppliedEmailDomainMatch(input.companyEmail.trim(), rootDomain);
  }

  // 6. Opportunity URL domain consistency
  let opportunityDomainMatches: boolean | undefined = undefined;
  let opportunityPlatformName: string | undefined = undefined;
  let opportunityIsKnownPlatform: boolean | undefined = undefined;

  if (input.opportunityUrl) {
    const oppValidation = validateAndNormalizeUrl(input.opportunityUrl);
    if (oppValidation.isValid && oppValidation.parsedUrl) {
      const oppDomain = parseDomain(oppValidation.parsedUrl);
      const platformCheck = isKnownJobPlatform(oppDomain.rootDomain);
      opportunityIsKnownPlatform = platformCheck.known;
      opportunityPlatformName = platformCheck.name;
      opportunityDomainMatches = oppDomain.rootDomain === rootDomain;
    }
  }

  // 7. Compile Risk Signals
  const rawSignals: RiskSignal[] = [];
  const recommendations: string[] = [];

  // A. Website unreachable
  if (!fetchResult.success) {
    rawSignals.push({
      id: "website-unreachable",
      title: "Website could not be verified",
      description:
        "The provided company website could not be reached or analyzed at this time. This can be caused by a temporary outage, bot protection, or network restrictions.",
      severity: "medium",
      points: 10,
    });
    recommendations.push("Independently verify the company website using a different browser or network.");
  }

  // B. HTTP instead of HTTPS
  if (fetchResult.success && finalDomainInfo.protocol !== "https:") {
    rawSignals.push({
      id: "http-website",
      title: "Unencrypted company website",
      description:
        "The company website is being accessed over an unencrypted HTTP connection. Most legitimate professional websites use HTTPS.",
      severity: "medium",
      points: 10,
    });
    recommendations.push("Avoid submitting personal data on websites without HTTPS encryption.");
  }

  // C. Company name mismatch
  if (pageAnalysis && pageAnalysis.companyNameMatch === "false") {
    rawSignals.push({
      id: "company-name-mismatch",
      title: "Company identity mismatch",
      description:
        "The submitted company name could not be confidently matched to the information found on the provided website.",
      severity: "medium",
      points: 15,
    });
    recommendations.push("Verify the company name matches the official information on the website.");
  }

  // D. Supplied company email domain mismatch
  if (
    input.companyEmail &&
    suppliedEmailDomainMatches === false
  ) {
    rawSignals.push({
      id: "company-email-mismatch",
      title: "Company email domain mismatch",
      description:
        "The supplied company email does not appear to belong to the same domain as the company website. A mismatch warrants additional verification.",
      severity: "medium",
      points: 15,
    });
    recommendations.push("Verify that the recruiter's email domain matches the company's official website domain.");
  }

  // E. Unexpected brand/domain relationship
  if (fetchResult.success && !domainMatchesBrand) {
    rawSignals.push({
      id: "unexpected-domain",
      title: "Unexpected company domain",
      description:
        "The provided company name and website domain do not have an obvious relationship. Verify independently that this is the official company website.",
      severity: "medium",
      points: 10,
    });
    recommendations.push("Search for the company through independent sources to find its official domain.");
  }

  // F. Opportunity domain mismatch (only for non-known platforms)
  if (
    input.opportunityUrl &&
    opportunityDomainMatches === false &&
    !opportunityIsKnownPlatform
  ) {
    rawSignals.push({
      id: "opportunity-domain-mismatch",
      title: "Opportunity / company domain mismatch",
      description:
        "The opportunity URL uses a different domain from the provided company website. Verify that the external platform is authorized by the company.",
      severity: "medium",
      points: 10,
    });
    recommendations.push("Confirm that the job listing platform is officially affiliated with the hiring company.");
  }

  // Deduplicate
  const signalMap = new Map<string, RiskSignal>();
  for (const sig of rawSignals) {
    if (!signalMap.has(sig.id)) signalMap.set(sig.id, sig);
  }
  const uniqueSignals = Array.from(signalMap.values());

  const severityWeight = { high: 3, medium: 2, low: 1 };
  const sortedSignals = uniqueSignals.sort(
    (a, b) => severityWeight[b.severity] - severityWeight[a.severity]
  );

  const rawScore = sortedSignals.reduce((sum, s) => sum + s.points, 0);
  const score = Math.min(rawScore, 100);

  let level: RiskLevel = "safe";
  let summary = "No significant warning signals were detected from the information provided.";

  if (score >= 60) {
    level = "high";
    summary = "Multiple warning signals were detected. Independently verify this company before proceeding.";
  } else if (score >= 30) {
    level = "review";
    summary = "Some warning signals were detected. Verify the company through independent sources before continuing.";
  }

  // 8. Compute Verification Coverage
  let coverageScore = 0;
  if (fetchResult.success) coverageScore += 2;
  if (finalDomainInfo.protocol === "https:") coverageScore += 1;
  if (pageAnalysis?.companyNameMatch === "true") coverageScore += 2;
  if (pageAnalysis?.aboutPresent) coverageScore += 1;
  if (pageAnalysis?.careersPresent) coverageScore += 1;
  if (pageAnalysis?.contactPresent) coverageScore += 1;
  if (pageAnalysis?.emailDomainMatches) coverageScore += 1;
  if (suppliedEmailDomainMatches) coverageScore += 1;
  if (opportunityDomainMatches || opportunityIsKnownPlatform) coverageScore += 1;

  let coverage: VerificationCoverage;
  let coverageLabel: string;
  let coverageSummary: string;

  if (!fetchResult.success) {
    coverage = "insufficient";
    coverageLabel = "Insufficient";
    coverageSummary = "The company website could not be analyzed. Verification coverage is insufficient.";
  } else if (coverageScore >= 7) {
    coverage = "high";
    coverageLabel = "Comprehensive";
    coverageSummary = "Strong verification evidence was obtained. Company identity, website, and contact information appear consistent.";
  } else if (coverageScore >= 4) {
    coverage = "medium";
    coverageLabel = "Moderate";
    coverageSummary = "Some verification evidence is available. Additional independent research is recommended.";
  } else {
    coverage = "low";
    coverageLabel = "Limited";
    coverageSummary = "Limited verification evidence was obtained from the provided information.";
  }

  const baseRecommendations = [
    "Verify the company through independent sources such as government registries or professional directories.",
    "Use the company's official website for all contact information.",
    "Verify that the recruiter uses a company-controlled communication channel.",
    "Never pay money to obtain employment or an internship.",
  ];

  if (coverage === "low" || coverage === "insufficient") {
    recommendations.push("Gather additional independent information before relying on this assessment.");
  }

  const allRecommendations = Array.from(new Set([...baseRecommendations, ...recommendations]));

  const intelligence: CompanyIntelligence = {
    originalUrl: validation.normalizedUrl,
    finalUrl: fetchResult.finalUrl,
    hostname: finalDomainInfo.hostname,
    rootDomain,
    protocol: finalDomainInfo.protocol,
    redirectCount: fetchResult.redirectCount,
    https: finalDomainInfo.protocol === "https:",
    websiteReachable: fetchResult.success,
    pageTitle: pageAnalysis?.title,
    metaDescription: pageAnalysis?.description,
    companyNameMatch: pageAnalysis?.companyNameMatch ?? "unknown",
    aboutPresent: pageAnalysis?.aboutPresent ?? false,
    careersPresent: pageAnalysis?.careersPresent ?? false,
    contactPresent: pageAnalysis?.contactPresent ?? false,
    privacyPresent: pageAnalysis?.privacyPresent ?? false,
    socialLinksFound: pageAnalysis?.socialLinksFound ?? false,
    emails: pageAnalysis?.emails ?? [],
    emailDomainMatches: pageAnalysis?.emailDomainMatches,
    suppliedEmailDomainMatches,
    opportunityDomainMatches,
    opportunityPlatformName,
    opportunityIsKnownPlatform,
    domainMatchesBrand,
    coverage,
    coverageLabel,
    coverageSummary,
    analysisLimitation: fetchResult.error,
  };

  return {
    intelligence,
    signals: sortedSignals,
    analysis: {
      score,
      level,
      summary,
      signals: sortedSignals,
      recommendations: allRecommendations,
      coverage,
      coverageLabel,
      coverageSummary,
    },
  };
}
