export type RiskLevel = "SAFE" | "REVIEW" | "HIGH RISK";

export interface VerificationRecord {
  id: string;
  company: string;
  opportunity: string;
  riskLevel: string;
  riskScore: number; // 0 - 100
  status: RiskLevel;
  date: string;
  domain?: string;
  flagCount?: number;
}

export interface StatItem {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral" | "warning";
  riskType?: "total" | "high" | "medium" | "low";
}

export interface QuickMethod {
  id: string;
  title: string;
  description: string;
  iconName: "Link" | "FileText" | "Building2" | "UserCheck";
  href: string;
}
