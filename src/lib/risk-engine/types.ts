export type RiskLevel = "safe" | "review" | "high";

export type SignalSeverity = "low" | "medium" | "high";

export type VerificationCoverage = "high" | "medium" | "low" | "insufficient";

export interface RiskSignal {
  id: string;
  title: string;
  description: string;
  severity: SignalSeverity;
  points: number;
  isInformational?: boolean;
}

export interface OpportunityInput {
  inputType: "url" | "manual";
  url?: string;
  companyName?: string;
  jobTitle?: string;
  recruiterEmail?: string;
  salaryText?: string;
  contactMethod?: string;
  paymentRequested?: boolean | null;
  jobDescription?: string;
}

export interface RiskAnalysis {
  score: number;
  level: RiskLevel;
  summary: string;
  signals: RiskSignal[];
  recommendations: string[];
  coverage?: VerificationCoverage;
  coverageLabel?: string;
  coverageSummary?: string;
}
