import { VerificationCoverage, RiskLevel, RiskSignal, RiskAnalysis } from "@/lib/risk-engine/types";

export interface CompanyInput {
  companyName: string;
  companyWebsite: string;
  companyEmail?: string;
  opportunityUrl?: string;
}

export type CompanyNameMatch = "true" | "false" | "unknown";

export interface CompanyPageAnalysis {
  title?: string;
  description?: string;
  emails: string[];
  aboutPresent: boolean;
  careersPresent: boolean;
  contactPresent: boolean;
  privacyPresent: boolean;
  termsPresent: boolean;
  socialLinksFound: boolean;
  companyNameMatch: CompanyNameMatch;
  emailDomainMatches?: boolean;
}

export interface CompanyIntelligence {
  // Website info
  originalUrl: string;
  finalUrl?: string;
  hostname?: string;
  rootDomain?: string;
  protocol?: string;
  redirectCount: number;
  https: boolean;
  websiteReachable: boolean;
  pageTitle?: string;
  metaDescription?: string;

  // Company analysis
  companyNameMatch: CompanyNameMatch;
  aboutPresent: boolean;
  careersPresent: boolean;
  contactPresent: boolean;
  privacyPresent: boolean;
  socialLinksFound: boolean;
  emails: string[];
  emailDomainMatches?: boolean;

  // User-supplied email check
  suppliedEmailDomainMatches?: boolean;

  // Opportunity URL consistency
  opportunityDomainMatches?: boolean;
  opportunityPlatformName?: string;
  opportunityIsKnownPlatform?: boolean;

  // Domain brand check
  domainMatchesBrand?: boolean;

  // Coverage
  coverage: VerificationCoverage;
  coverageLabel: string;
  coverageSummary: string;

  analysisLimitation?: string;
}

export interface CompanyAnalysisResult {
  intelligence: CompanyIntelligence;
  signals: RiskSignal[];
  analysis: RiskAnalysis;
}
