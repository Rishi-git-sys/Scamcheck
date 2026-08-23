import { RiskAnalysis, RiskSignal, VerificationCoverage } from "@/lib/risk-engine/types";

export interface DomainAgeResult {
  available: boolean;
  ageDays?: number;
  createdAt?: string;
  source?: string;
}

export interface DomainAnalysis {
  hostname: string;
  rootDomain: string;
  subdomain?: string;
  tld: string;
  protocol: "http:" | "https:";
  isIpAddress: boolean;
  isShortener: boolean;
  hasSuspiciousStructure: boolean;
  isKnownPlatform: boolean;
  platformName?: string;
}

export interface PageMetadata {
  title?: string;
  description?: string;
  emails: string[];
  jobRelated: boolean;
  hasSensitiveFormFields: boolean;
  sensitiveFieldNames: string[];
  externalLinksCount: number;
  hasApplyButton: boolean;
  hasRoleDetails: boolean;
  hasRequirements: boolean;
  hasSalaryInfo: boolean;
  isCompanyOrShowcasePage: boolean;
}

export interface FetchPageResult {
  success: boolean;
  originalUrl: string;
  finalUrl?: string;
  finalHostname?: string;
  redirectCount: number;
  redirectHosts: string[];
  https: boolean;
  statusCode?: number;
  contentType?: string;
  html?: string;
  extractedText?: string;
  error?: string;
}

export interface CoverageAssessment {
  level: VerificationCoverage;
  label: string;
  summary: string;
  isSpecificJobListing: boolean;
  signals: {
    hasJobTitle: boolean;
    hasApplyAction: boolean;
    hasJobKeywords: boolean;
    hasCompanyInfo: boolean;
    hasRecruiterInfo: boolean;
    hasRoleDetails: boolean;
    hasRequirements: boolean;
  };
}

export interface UrlIntelligence {
  originalUrl: string;
  finalUrl?: string;
  hostname?: string;
  rootDomain?: string;
  protocol?: string;
  redirectCount: number;
  redirectHosts: string[];
  https: boolean;
  pageTitle?: string;
  metaDescription?: string;
  jobRelated: boolean;
  isSpecificJobListing?: boolean;
  coverage?: VerificationCoverage;
  coverageLabel?: string;
  coverageSummary?: string;
  emails: string[];
  emailDomainMatchesSite?: boolean;
  domainAge?: DomainAgeResult;
  hasSensitiveFormFields?: boolean;
  analysisLimitation?: string;
}

export interface UrlAnalysisResult {
  intelligence: UrlIntelligence;
  signals: RiskSignal[];
  analysis: RiskAnalysis;
}
