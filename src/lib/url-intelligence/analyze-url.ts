import {
  DomainAgeResult,
  UrlAnalysisResult,
  UrlIntelligence,
} from "./types";
import { validateAndNormalizeUrl } from "./validate-url";
import { parseDomain } from "./domain-analysis";
import { safelyFetchPage } from "./fetch-page";
import { parsePageMetadata } from "./parse-page";
import { assessVerificationCoverage } from "./coverage-analysis";
import { RiskLevel, RiskSignal } from "@/lib/risk-engine/types";

export async function analyzeUrl(rawUrl: string): Promise<UrlAnalysisResult> {
  const validation = validateAndNormalizeUrl(rawUrl);
  if (!validation.isValid || !validation.normalizedUrl || !validation.parsedUrl) {
    throw new Error(validation.error || "Please enter a valid public URL.");
  }

  const initialParsed = validation.parsedUrl;
  const initialDomainInfo = parseDomain(initialParsed);

  // 1. Fetch webpage securely
  const fetchResult = await safelyFetchPage(validation.normalizedUrl);

  const finalUrl = fetchResult.finalUrl || validation.normalizedUrl;
  const finalParsed = new URL(finalUrl);
  const finalDomainInfo = parseDomain(finalParsed);

  // 2. Parse HTML metadata if fetch succeeded
  const pageMeta = fetchResult.html
    ? parsePageMetadata(fetchResult.html, finalDomainInfo.rootDomain, finalParsed.pathname)
    : {
        emails: [],
        jobRelated: false,
        hasSensitiveFormFields: false,
        sensitiveFieldNames: [],
        externalLinksCount: 0,
        hasApplyButton: false,
        hasRoleDetails: false,
        hasRequirements: false,
        hasSalaryInfo: false,
        isCompanyOrShowcasePage: false,
      };

  // 3. Assess Verification Coverage
  const coverageAssessment = assessVerificationCoverage(
    pageMeta,
    finalDomainInfo,
    fetchResult.success
  );

  const domainAge: DomainAgeResult = {
    available: false,
  };

  const emailDomainMatchesSite = pageMeta.emails.some((email) => {
    const domain = email.split("@")[1]?.toLowerCase();
    return domain && (domain === finalDomainInfo.rootDomain || domain.endsWith(`.${finalDomainInfo.rootDomain}`));
  });

  const intelligence: UrlIntelligence = {
    originalUrl: validation.normalizedUrl,
    finalUrl: fetchResult.finalUrl,
    hostname: finalDomainInfo.hostname,
    rootDomain: finalDomainInfo.rootDomain,
    protocol: finalDomainInfo.protocol,
    redirectCount: fetchResult.redirectCount,
    redirectHosts: fetchResult.redirectHosts,
    https: finalDomainInfo.protocol === "https:",
    pageTitle: pageMeta.title,
    metaDescription: pageMeta.description,
    jobRelated: pageMeta.jobRelated,
    isSpecificJobListing: coverageAssessment.isSpecificJobListing,
    coverage: coverageAssessment.level,
    coverageLabel: coverageAssessment.label,
    coverageSummary: coverageAssessment.summary,
    emails: pageMeta.emails,
    emailDomainMatchesSite,
    domainAge,
    hasSensitiveFormFields: pageMeta.hasSensitiveFormFields,
    analysisLimitation: fetchResult.error,
  };

  // 4. Evaluate Rule Risk Signals
  const rawSignals: RiskSignal[] = [];
  const specificRecommendations: string[] = [];

  // A. Protocol Check (HTTP vs HTTPS)
  if (finalDomainInfo.protocol !== "https:") {
    rawSignals.push({
      id: "unencrypted-connection",
      title: "Unencrypted connection",
      description: "The opportunity page is being accessed over HTTP rather than HTTPS.",
      severity: "medium",
      points: 10,
    });
    specificRecommendations.push("Avoid entering personal or contact details on non-HTTPS websites.");
  }

  // B. URL Shortener Detection
  if (initialDomainInfo.isShortener || finalDomainInfo.isShortener) {
    rawSignals.push({
      id: "shortened-url",
      title: "Shortened URL",
      description: "The submitted link uses a URL-shortening service, which hides the final destination.",
      severity: "medium",
      points: 10,
    });
    specificRecommendations.push("Navigate directly to the employer's official website rather than using short links.");
  }

  // C. IP-Address Hostname
  if (initialDomainInfo.isIpAddress || finalDomainInfo.isIpAddress) {
    rawSignals.push({
      id: "ip-based-destination",
      title: "IP-based destination",
      description: "The opportunity uses an IP address instead of a recognizable company domain.",
      severity: "high",
      points: 20,
    });
    specificRecommendations.push("Legitimate corporate employers use registered domain names for career portals.");
  }

  // D. Suspicious Domain Structure
  if (initialDomainInfo.hasSuspiciousStructure || finalDomainInfo.hasSuspiciousStructure) {
    rawSignals.push({
      id: "suspicious-domain-structure",
      title: "Suspicious domain structure",
      description: "The domain contains structural characteristics that deserve additional verification.",
      severity: "medium",
      points: 10,
    });
    specificRecommendations.push("Independently confirm the official website domain of the hiring organization.");
  }

  // E. Redirect Chain
  if (fetchResult.redirectCount >= 2 || new Set(fetchResult.redirectHosts).size > 2) {
    rawSignals.push({
      id: "redirect-chain",
      title: "Redirect chain detected",
      description: "The submitted URL redirected through multiple hosts before reaching the final page.",
      severity: "medium",
      points: 10,
    });
    specificRecommendations.push("Verify that the final destination URL belongs to the stated company.");
  }

  // F. Missing Page Title
  if (fetchResult.success && fetchResult.html && !pageMeta.title) {
    rawSignals.push({
      id: "missing-page-title",
      title: "Missing page title",
      description: "The webpage does not provide a standard page title.",
      severity: "low",
      points: 3,
    });
  }

  // G. Page Text Heuristic Checks
  const extractedText = (fetchResult.extractedText || "").toLowerCase();

  if (extractedText) {
    // Payment Language
    const paymentKeywords = [
      "registration fee",
      "application fee",
      "processing fee",
      "security deposit",
      "training fee",
      "pay to apply",
      "pay before joining",
      "payment required",
      "refundable deposit",
      "deposit required",
      "wire transfer",
    ];

    if (paymentKeywords.some((k) => extractedText.includes(k))) {
      rawSignals.push({
        id: "payment-language",
        title: "Payment language detected",
        description: "The webpage contains language indicating that payment may be required as part of the opportunity.",
        severity: "high",
        points: 30,
      });
      specificRecommendations.push("Do not pay registration, training, processing, or security fees for any job offer.");
    }

    // Urgency Language (requires at least 2 distinct patterns)
    const urgencyKeywords = [
      "act now",
      "limited seats",
      "apply immediately",
      "urgent hiring",
      "last chance",
      "offer expires",
      "only today",
      "hurry up",
      "fast cash",
    ];

    const matchedUrgency = urgencyKeywords.filter((k) => extractedText.includes(k));
    if (matchedUrgency.length >= 2) {
      rawSignals.push({
        id: "high-pressure-language",
        title: "High-pressure language",
        description: "The opportunity uses language that creates urgency or pressure to act quickly.",
        severity: "medium",
        points: 10,
      });
      specificRecommendations.push("Take time to review the offer details; legitimate hiring processes allow reasonable response time.");
    }

    // Guaranteed Employment / Income Claims
    const guaranteedKeywords = [
      "guaranteed income",
      "guaranteed job",
      "guaranteed placement",
      "earn money instantly",
      "guaranteed salary",
      "no experience high salary",
      "100% placement guaranteed",
    ];

    if (guaranteedKeywords.some((k) => extractedText.includes(k))) {
      rawSignals.push({
        id: "unusually-strong-employment-claims",
        title: "Unusually strong employment claims",
        description: "The page makes unusually strong claims about guaranteed employment or income.",
        severity: "medium",
        points: 15,
      });
      specificRecommendations.push("Be cautious of claims guaranteeing employment or unusually high pay without vetting.");
    }

    // Unrealistic Compensation Claims
    const unrealisticEarningsKeywords = [
      "₹1 lakh per day",
      "1 lakh per day",
      "₹5 lakh per month internship",
      "5 lakh per month internship",
      "guaranteed ₹10 lakh",
      "earn ₹1 crore",
      "$10,000 per week",
      "$5,000 per day",
    ];

    if (unrealisticEarningsKeywords.some((k) => extractedText.includes(k))) {
      rawSignals.push({
        id: "unusual-compensation-claim",
        title: "Unusual compensation claim",
        description: "The opportunity makes an unusually large compensation claim that should be independently verified.",
        severity: "medium",
        points: 15,
      });
      specificRecommendations.push("Compare stated compensation with standard industry benchmarks for similar roles.");
    }

    // Public Recruiter Email Provider on recruitment page
    const publicEmailProviders = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
      "proton.me",
      "protonmail.com",
    ];

    const hasPublicEmail = pageMeta.emails.some((email) => {
      const domain = email.split("@")[1]?.toLowerCase();
      return publicEmailProviders.includes(domain);
    });

    const hasCorporateEmail = pageMeta.emails.some((email) => {
      const domain = email.split("@")[1]?.toLowerCase();
      return !publicEmailProviders.includes(domain);
    });

    if (hasPublicEmail && !hasCorporateEmail && coverageAssessment.isSpecificJobListing) {
      rawSignals.push({
        id: "public-recruiter-email",
        title: "Public recruiter email",
        description: "Recruitment contact information appears to use a public email provider rather than the company's domain.",
        severity: "medium",
        points: 10,
      });
      specificRecommendations.push("Confirm recruiter identity on professional platforms like LinkedIn.");
    }
  }

  // H. Sensitive Form Field Detection
  if (pageMeta.hasSensitiveFormFields) {
    rawSignals.push({
      id: "sensitive-info-request",
      title: "Sensitive information request",
      description: "The page appears to request sensitive personal, financial, or banking information.",
      severity: "high",
      points: 25,
    });
    specificRecommendations.push("Never provide CVV, banking passwords, OTP, or advance financial details on an application form.");
  }

  // I. Informational Contextual Signals for Company/Showcase pages
  if (coverageAssessment.level === "low" || !coverageAssessment.isSpecificJobListing) {
    rawSignals.push({
      id: "no-job-listing-detected",
      title: "No specific job listing detected",
      description: "This page appears to be a company or showcase page rather than a specific job opening.",
      severity: "low",
      points: 0,
      isInformational: true,
    });

    if (pageMeta.emails.length === 0) {
      rawSignals.push({
        id: "no-recruiter-info-detected",
        title: "No recruiter information detected",
        description: "No direct hiring manager or recruiter contact was found on this general page.",
        severity: "low",
        points: 0,
        isInformational: true,
      });
    }

    rawSignals.push({
      id: "limited-opportunity-info",
      title: "Limited opportunity-specific information",
      description: "Opportunity verification coverage is limited because no specific position was identified.",
      severity: "low",
      points: 0,
      isInformational: true,
    });

    specificRecommendations.push("Find the specific job/internship posting.");
    specificRecommendations.push("Verify the opportunity through the company's official careers page.");
    specificRecommendations.push("Independently verify the recruiter before sharing documents.");
  }

  // Deduplicate signals by ID
  const signalMap = new Map<string, RiskSignal>();
  for (const s of rawSignals) {
    if (!signalMap.has(s.id)) {
      signalMap.set(s.id, s);
    }
  }
  const uniqueSignals = Array.from(signalMap.values());

  const severityWeight = {
    high: 3,
    medium: 2,
    low: 1,
  };

  const sortedSignals = uniqueSignals.sort((a, b) => {
    // Risk signals first, informational last
    if (a.isInformational && !b.isInformational) return 1;
    if (!a.isInformational && b.isInformational) return -1;
    return severityWeight[b.severity] - severityWeight[a.severity];
  });

  // Calculate score capped at 100 (informational signals contribute 0 points)
  const rawScore = sortedSignals.reduce((sum, s) => sum + s.points, 0);
  const score = Math.min(rawScore, 100);

  // Determine Level and Unified Non-Repetitive Summary
  let level: RiskLevel = "safe";
  let summary = "No scam indicators were detected from the available information.";

  if (score >= 60) {
    level = "high";
    summary = "Multiple warning signals were detected. Proceed carefully and independently verify the opportunity.";
  } else if (score >= 30) {
    level = "review";
    summary = "Some warning signs were detected. Verify the opportunity before continuing.";
  } else {
    // Low risk branch
    if (coverageAssessment.level === "low" || !coverageAssessment.isSpecificJobListing) {
      summary =
        "No scam indicators were detected from the available information. However, this page does not appear to be a specific job or internship listing, so opportunity verification is limited.";
    } else {
      summary = "No scam indicators were detected from the available information.";
    }
  }

  // Base general recommendations
  const baseRecommendations = [
    "Verify the company through its official website.",
    "Independently verify the recruiter.",
    "Never pay money to obtain a job or internship.",
    "Do not share sensitive banking or identity information until the employer is verified.",
  ];

  const allRecommendations = Array.from(
    new Set([...baseRecommendations, ...specificRecommendations])
  );

  return {
    intelligence,
    signals: sortedSignals,
    analysis: {
      score,
      level,
      summary,
      signals: sortedSignals,
      recommendations: allRecommendations,
      coverage: coverageAssessment.level,
      coverageLabel: coverageAssessment.label,
      coverageSummary: coverageAssessment.summary,
    },
  };
}
