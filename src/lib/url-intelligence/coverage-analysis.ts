import { CoverageAssessment, DomainAnalysis, PageMetadata } from "./types";
import { VerificationCoverage } from "@/lib/risk-engine/types";

export function assessVerificationCoverage(
  pageMeta: PageMetadata,
  domainInfo: DomainAnalysis,
  fetchSuccess: boolean
): CoverageAssessment {
  if (!fetchSuccess) {
    return {
      level: "insufficient",
      label: "Insufficient",
      summary:
        "The page did not provide enough readable content to verify a specific job opportunity.",
      isSpecificJobListing: false,
      signals: {
        hasJobTitle: false,
        hasApplyAction: false,
        hasJobKeywords: false,
        hasCompanyInfo: false,
        hasRecruiterInfo: false,
        hasRoleDetails: false,
        hasRequirements: false,
      },
    };
  }

  const hasJobTitle = Boolean(
    pageMeta.title &&
      /intern|engineer|developer|analyst|associate|manager|specialist|designer|scientist/i.test(
        pageMeta.title
      )
  );
  const hasApplyAction = pageMeta.hasApplyButton;
  const hasJobKeywords = pageMeta.jobRelated;
  const hasCompanyInfo = Boolean(domainInfo.rootDomain || domainInfo.platformName);
  const hasRecruiterInfo = pageMeta.emails.length > 0;
  const hasRoleDetails = pageMeta.hasRoleDetails;
  const hasRequirements = pageMeta.hasRequirements;

  // Check if this is a company profile / showcase page / general platform hub
  if (pageMeta.isCompanyOrShowcasePage && !hasApplyAction && !hasRoleDetails) {
    return {
      level: "low",
      label: "Limited",
      summary:
        "This URL appears to be a company or showcase page rather than a specific job or internship listing.",
      isSpecificJobListing: false,
      signals: {
        hasJobTitle,
        hasApplyAction,
        hasJobKeywords,
        hasCompanyInfo,
        hasRecruiterInfo,
        hasRoleDetails,
        hasRequirements,
      },
    };
  }

  // Count positive coverage markers
  const positiveMarkers = [
    hasJobTitle,
    hasApplyAction,
    hasJobKeywords,
    hasRoleDetails,
    hasRequirements,
    hasCompanyInfo,
  ].filter(Boolean).length;

  let level: VerificationCoverage = "low";
  let label = "Limited";
  let summary =
    "Limited opportunity-specific information could be extracted from this page.";
  let isSpecificJobListing = false;

  if (positiveMarkers >= 4 && (hasApplyAction || hasRoleDetails || hasRequirements)) {
    level = "high";
    label = "Comprehensive";
    summary =
      "Comprehensive job listing details, role requirements, and application procedures were identified.";
    isSpecificJobListing = true;
  } else if (positiveMarkers >= 2 && hasJobKeywords) {
    level = "medium";
    label = "Moderate";
    summary =
      "Some opportunity details were identified, but full job specifications or recruiter contacts were not available.";
    isSpecificJobListing = true;
  }

  return {
    level,
    label,
    summary,
    isSpecificJobListing,
    signals: {
      hasJobTitle,
      hasApplyAction,
      hasJobKeywords,
      hasCompanyInfo,
      hasRecruiterInfo,
      hasRoleDetails,
      hasRequirements,
    },
  };
}
