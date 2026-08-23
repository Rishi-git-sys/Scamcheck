// ==============================================================================
// Phase 15: Dashboard Analytics Computation
// Computes real-time user-scoped statistics from Supabase
// ==============================================================================

import { SupabaseClient } from "@supabase/supabase-js";
import {
  DashboardAnalytics,
  DashboardStats,
  DateRangeFilter,
  SourceBreakdownItem,
  WarningPatternStat,
  RecentCheckItem,
} from "./types";
import { RiskLevel } from "@/lib/risk-engine/types";

/**
 * Calculates start timestamp based on selected date range.
 */
export function getDateRangeTimestamp(range: DateRangeFilter): string | null {
  const now = new Date();
  if (range === "7d") {
    now.setDate(now.getDate() - 7);
    return now.toISOString();
  }
  if (range === "30d") {
    now.setDate(now.getDate() - 30);
    return now.toISOString();
  }
  if (range === "90d") {
    now.setDate(now.getDate() - 90);
    return now.toISOString();
  }
  return null;
}

/**
 * Maps raw record into a human-readable recent check item.
 */
export function formatRecentCheckItem(raw: any): RecentCheckItem {
  const meta = raw.metadata || {};
  const inputType = raw.input_type || "evidence";
  const rawSource = meta.sourceType || inputType;

  let sourceType: "url" | "screenshot" | "text" | "manual" | "company" = "manual";
  let sourceLabel = "Manual";

  if (rawSource === "url" || inputType === "url") {
    sourceType = "url";
    sourceLabel = "URL";
  } else if (rawSource === "screenshot") {
    sourceType = "screenshot";
    sourceLabel = "Screenshot";
  } else if (rawSource === "text") {
    sourceType = "text";
    sourceLabel = "Text";
  } else if (rawSource === "company" || inputType === "company") {
    sourceType = "company";
    sourceLabel = "Company";
  }

  const title =
    raw.job_title ||
    meta.jobTitle ||
    raw.company_name ||
    meta.companyName ||
    (raw.url ? new URL(raw.url.startsWith("http") ? raw.url : `https://${raw.url}`).hostname : null) ||
    "Opportunity Check";

  const subtitle =
    raw.job_title && raw.company_name
      ? raw.company_name
      : raw.url || meta.recruiterEmail || undefined;

  const riskLevel: RiskLevel =
    raw.risk_level === "high" || raw.risk_level === "review" || raw.risk_level === "safe"
      ? raw.risk_level
      : raw.risk_score >= 60
      ? "high"
      : raw.risk_score >= 30
      ? "review"
      : "safe";

  return {
    id: raw.id,
    title,
    subtitle,
    sourceType,
    sourceLabel,
    riskScore: raw.risk_score ?? 0,
    riskLevel,
    createdAt: raw.created_at,
  };
}

/**
 * Fetch and aggregate user-scoped dashboard analytics.
 */
export async function getDashboardAnalytics(
  supabase: SupabaseClient,
  userId: string,
  dateRange: DateRangeFilter = "all"
): Promise<DashboardAnalytics> {
  const sinceTimestamp = getDateRangeTimestamp(dateRange);

  // 1. Fetch user's verification records within date range
  let query = supabase
    .from("verifications")
    .select("id, input_type, company_name, job_title, url, risk_score, risk_level, metadata, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (sinceTimestamp) {
    query = query.gte("created_at", sinceTimestamp);
  }

  const { data: verifications, error: vError } = await query;

  if (vError || !verifications || verifications.length === 0) {
    return {
      stats: {
        totalChecks: 0,
        highRiskCount: 0,
        reviewCount: 0,
        safeCount: 0,
        highRiskPct: 0,
        reviewPct: 0,
        safePct: 0,
      },
      sourceBreakdown: [],
      warningPatterns: [],
      safetyInsight: "No checks recorded yet. Start by checking a job, internship, offer letter, or screenshot.",
      recentChecks: [],
      hasData: false,
    };
  }

  const totalChecks = verifications.length;
  let highRiskCount = 0;
  let reviewCount = 0;
  let safeCount = 0;

  const sourceCounts: Record<string, number> = {
    url: 0,
    screenshot: 0,
    text: 0,
    manual: 0,
    company: 0,
  };

  const verificationIds: string[] = [];

  for (const v of verifications) {
    verificationIds.push(v.id);

    // Count risk level
    const level = (v.risk_level || "").toLowerCase();
    if (level === "high" || v.risk_score >= 60) {
      highRiskCount++;
    } else if (level === "review" || level === "warning" || v.risk_score >= 30) {
      reviewCount++;
    } else {
      safeCount++;
    }

    // Count source type
    const meta = v.metadata || {};
    const src = meta.sourceType || v.input_type || "manual";
    if (src === "url" || v.input_type === "url") {
      sourceCounts.url++;
    } else if (src === "screenshot") {
      sourceCounts.screenshot++;
    } else if (src === "text") {
      sourceCounts.text++;
    } else if (src === "company" || v.input_type === "company") {
      sourceCounts.company++;
    } else {
      sourceCounts.manual++;
    }
  }

  // Calculate percentages
  const stats: DashboardStats = {
    totalChecks,
    highRiskCount,
    reviewCount,
    safeCount,
    highRiskPct: Math.round((highRiskCount / totalChecks) * 100) || 0,
    reviewPct: Math.round((reviewCount / totalChecks) * 100) || 0,
    safePct: Math.round((safeCount / totalChecks) * 100) || 0,
  };

  // Build Source Breakdown List
  const rawSources: SourceBreakdownItem[] = [
    { type: "url", label: "URL", count: sourceCounts.url, percentage: Math.round((sourceCounts.url / totalChecks) * 100) || 0 },
    { type: "screenshot", label: "Screenshot", count: sourceCounts.screenshot, percentage: Math.round((sourceCounts.screenshot / totalChecks) * 100) || 0 },
    { type: "text", label: "Pasted Text", count: sourceCounts.text, percentage: Math.round((sourceCounts.text / totalChecks) * 100) || 0 },
    { type: "company", label: "Company", count: sourceCounts.company, percentage: Math.round((sourceCounts.company / totalChecks) * 100) || 0 },
    { type: "manual", label: "Manual Form", count: sourceCounts.manual, percentage: Math.round((sourceCounts.manual / totalChecks) * 100) || 0 },
  ];
  const sourceBreakdown: SourceBreakdownItem[] = rawSources.filter((item) => item.count > 0);

  // 2. Query associated risk signals for Top Warning Patterns
  const patternCounts = new Map<string, { title: string; count: number; severity: "high" | "medium" | "low" }>();

  if (verificationIds.length > 0) {
    const { data: signals } = await supabase
      .from("risk_signals")
      .select("id, title, severity, verification_id")
      .in("verification_id", verificationIds.slice(0, 100)); // Limit to most recent 100 verifications

    if (signals) {
      for (const sig of signals) {
        const title = sig.title.trim();
        const existing = patternCounts.get(title);
        const sev = (sig.severity || "medium").toLowerCase() as "high" | "medium" | "low";

        if (existing) {
          existing.count++;
        } else {
          patternCounts.set(title, {
            title,
            count: 1,
            severity: sev,
          });
        }
      }
    }
  }

  const warningPatterns: WarningPatternStat[] = Array.from(patternCounts.entries())
    .map(([id, val]) => ({
      id,
      title: val.title,
      count: val.count,
      severity: val.severity,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 3. Formulate Safety Insight
  let safetyInsight = "";
  if (warningPatterns.length > 0) {
    const top = warningPatterns[0];
    safetyInsight = `"${top.title}" is the most frequently detected warning signal in your checks (${top.count} occurrence${top.count > 1 ? "s" : ""}).`;
  } else if (totalChecks > 0) {
    safetyInsight = "No high-risk warning patterns were detected in your submitted checks.";
  } else {
    safetyInsight = "No warning patterns detected yet.";
  }

  // 4. Format Recent Checks (latest 8)
  const recentChecks: RecentCheckItem[] = verifications
    .slice(0, 8)
    .map(formatRecentCheckItem);

  return {
    stats,
    sourceBreakdown,
    warningPatterns,
    safetyInsight,
    recentChecks,
    hasData: true,
  };
}
