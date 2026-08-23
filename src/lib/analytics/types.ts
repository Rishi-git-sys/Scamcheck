// ==============================================================================
// Phase 15: Dashboard Analytics & Intelligent History Types
// ==============================================================================

import { RiskLevel } from "@/lib/risk-engine/types";

export type DateRangeFilter = "all" | "7d" | "30d" | "90d";

export interface DashboardStats {
  totalChecks: number;
  highRiskCount: number;
  reviewCount: number;
  safeCount: number;
  highRiskPct: number;
  reviewPct: number;
  safePct: number;
}

export interface SourceBreakdownItem {
  type: "url" | "screenshot" | "text" | "manual" | "company";
  label: string;
  count: number;
  percentage: number;
}

export interface WarningPatternStat {
  id: string;
  title: string;
  count: number;
  severity: "high" | "medium" | "low";
}

export interface RecentCheckItem {
  id: string;
  title: string;
  subtitle?: string;
  sourceType: string;
  sourceLabel: string;
  riskScore: number;
  riskLevel: RiskLevel;
  createdAt: string;
}

export interface DashboardAnalytics {
  stats: DashboardStats;
  sourceBreakdown: SourceBreakdownItem[];
  warningPatterns: WarningPatternStat[];
  safetyInsight: string;
  recentChecks: RecentCheckItem[];
  hasData: boolean;
}

export interface HistoryFilterOptions {
  search?: string;
  riskLevel?: "ALL" | "high" | "review" | "safe" | string;
  sourceType?: "ALL" | "url" | "screenshot" | "text" | "manual" | "company" | string;
  dateRange?: DateRangeFilter;
  sortOrder?: "newest" | "oldest" | "highest_risk" | "lowest_risk";
  page?: number;
  pageSize?: number;
}

export interface PaginatedHistoryResult {
  records: RecentCheckItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
