"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  Layers,
  FileSearch,
  Globe,
  ImageIcon,
  FileText,
  Building2,
  BarChart3,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  DashboardAnalytics as AnalyticsData,
  DateRangeFilter,
  RecentCheckItem,
} from "@/lib/analytics/types";
import { getDashboardAnalytics } from "@/lib/analytics/dashboard";

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplayValue(value);
      return;
    }

    if (value === 0) {
      setDisplayValue(0);
      return;
    }

    let start = 0;
    const duration = 600; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (value - start) * easeOut);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const handle = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(handle);
  }, [value]);

  return <>{displayValue}</>;
}

export default function DashboardAnalyticsView() {
  const { user } = useAuth();

  const [dateRange, setDateRange] = useState<DateRangeFilter>("all");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      if (!user) return;
      setLoading(true);

      try {
        const supabase = createClient();
        const analytics = await getDashboardAnalytics(supabase, user.id, dateRange);
        setData(analytics);
      } catch (err) {
        console.error("Failed to load dashboard analytics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [user, dateRange]);

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case "url":
        return <Globe className="w-3.5 h-3.5 text-accent-primary" />;
      case "screenshot":
        return <ImageIcon className="w-3.5 h-3.5 text-accent-primary" />;
      case "text":
        return <FileText className="w-3.5 h-3.5 text-accent-primary" />;
      case "company":
        return <Building2 className="w-3.5 h-3.5 text-accent-primary" />;
      default:
        return <FileSearch className="w-3.5 h-3.5 text-secondary-color" />;
    }
  };

  const getRiskBadge = (level: string, score: number) => {
    if (level === "high" || score >= 60) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-danger-light text-danger-color border border-danger-light">
          HIGH RISK • {score}
        </span>
      );
    }
    if (level === "review" || score >= 30) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-warning-light text-warning-color border border-warning-light">
          REVIEW • {score}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-accent-light text-accent-primary border border-accent-light">
        LOW RISK • {score}
      </span>
    );
  };

  return (
    <div className="space-y-8 page-enter-animation">
      {/* Top Header & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary-color">
            Your ScamCheck overview
          </h1>
          <p className="text-xs sm:text-sm text-secondary-color mt-1">
            Track the opportunities you&apos;ve checked and the warning patterns we&apos;ve detected.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center p-1 rounded-xl bg-muted-custom border border-subtle text-xs font-medium self-start sm:self-auto">
          {(
            [
              { id: "all", label: "All time" },
              { id: "7d", label: "7 days" },
              { id: "30d", label: "30 days" },
              { id: "90d", label: "90 days" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setDateRange(t.id)}
              className={`px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-[0.98] ${
                dateRange === t.id
                  ? "bg-background text-primary-color shadow-sm font-semibold"
                  : "text-secondary-color hover:text-primary-color"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main CTA Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-primary/10 via-card to-card border border-accent-light p-6 sm:p-7 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-primary-color">
              Ready to verify a new opportunity?
            </h2>
            <p className="text-xs text-secondary-color max-w-xl">
              Paste a URL, upload a screenshot, or enter offer message text to run comprehensive risk intelligence.
            </p>
          </div>

          <Link
            href="/dashboard/check"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-background text-xs font-bold transition-all duration-150 interactive-btn shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Check an opportunity</span>
          </Link>
        </div>
      </div>

      {loading ? (
        /* Lightweight Skeleton Loading Placeholders */
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-card border border-subtle shadow-soft space-y-2 animate-pulse"
              >
                <div className="h-3 w-16 bg-muted-custom rounded" />
                <div className="h-8 w-12 bg-muted-custom rounded" />
                <div className="h-2 w-24 bg-muted-custom rounded" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-subtle shadow-soft space-y-4 animate-pulse">
              <div className="h-4 w-32 bg-muted-custom rounded" />
              <div className="h-24 bg-muted-custom rounded" />
            </div>
            <div className="p-6 rounded-2xl bg-card border border-subtle shadow-soft space-y-4 animate-pulse">
              <div className="h-4 w-32 bg-muted-custom rounded" />
              <div className="h-24 bg-muted-custom rounded" />
            </div>
          </div>
        </div>
      ) : !data || !data.hasData ? (
        /* Empty State */
        <div className="bg-card border border-subtle rounded-2xl p-10 text-center space-y-4 shadow-soft">
          <div className="w-12 h-12 rounded-2xl bg-muted-custom border border-subtle flex items-center justify-center mx-auto text-tertiary-color">
            <Shield className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-primary-color">No checks yet</h3>
            <p className="text-xs text-secondary-color max-w-md mx-auto">
              Start by checking a job, internship, offer letter, message, or screenshot. Your statistics and risk history will appear here.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard/check"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-background text-xs font-bold transition-all duration-150 interactive-btn"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>Check an opportunity</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* 1. Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-card border border-subtle shadow-soft space-y-1 interactive-card">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-tertiary-color block">
                Total checks
              </span>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-primary-color block">
                <AnimatedNumber value={data.stats.totalChecks} />
              </span>
              <span className="text-[10px] text-tertiary-color block">
                Verified opportunities
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-subtle shadow-soft space-y-1 interactive-card">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-danger-color block">
                  High risk
                </span>
                <AlertCircle className="w-3.5 h-3.5 text-danger-color" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-danger-color block">
                <AnimatedNumber value={data.stats.highRiskCount} />
              </span>
              <span className="text-[10px] text-tertiary-color block">
                {data.stats.highRiskPct}% of checks
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-subtle shadow-soft space-y-1 interactive-card">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-warning-color block">
                  Needs review
                </span>
                <AlertTriangle className="w-3.5 h-3.5 text-warning-color" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-warning-color block">
                <AnimatedNumber value={data.stats.reviewCount} />
              </span>
              <span className="text-[10px] text-tertiary-color block">
                {data.stats.reviewPct}% of checks
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-subtle shadow-soft space-y-1 interactive-card">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-accent-primary block">
                  Low risk
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-accent-primary block">
                <AnimatedNumber value={data.stats.safeCount} />
              </span>
              <span className="text-[10px] text-tertiary-color block">
                {data.stats.safePct}% of checks
              </span>
            </div>
          </div>

          {/* 2. Risk Distribution & Sources Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution Horizontal Bars */}
            <div className="bg-card border border-subtle rounded-2xl p-5 sm:p-6 shadow-soft space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-accent-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary-color">
                    Risk distribution
                  </h3>
                </div>
                <span className="text-[11px] text-tertiary-color font-medium">
                  {data.stats.totalChecks} checks
                </span>
              </div>

              <div className="space-y-3.5">
                {/* Low Risk Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-secondary-color flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-accent-primary" />
                      Low risk
                    </span>
                    <span className="text-primary-color font-mono">
                      {data.stats.safeCount} ({data.stats.safePct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-muted-custom rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-primary rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${data.stats.safePct}%` }}
                    />
                  </div>
                </div>

                {/* Needs Review Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-secondary-color flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-warning-color" />
                      Needs review
                    </span>
                    <span className="text-primary-color font-mono">
                      {data.stats.reviewCount} ({data.stats.reviewPct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-muted-custom rounded-full overflow-hidden">
                    <div
                      className="h-full bg-warning-color rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${data.stats.reviewPct}%` }}
                    />
                  </div>
                </div>

                {/* High Risk Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-secondary-color flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-danger-color" />
                      High risk
                    </span>
                    <span className="text-primary-color font-mono">
                      {data.stats.highRiskCount} ({data.stats.highRiskPct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-muted-custom rounded-full overflow-hidden">
                    <div
                      className="h-full bg-danger-color rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${data.stats.highRiskPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Sources Breakdown */}
            <div className="bg-card border border-subtle rounded-2xl p-5 sm:p-6 shadow-soft space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-accent-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary-color">
                    Verification sources
                  </h3>
                </div>
                <span className="text-[11px] text-tertiary-color font-medium">
                  {data.sourceBreakdown.length} active types
                </span>
              </div>

              {data.sourceBreakdown.length === 0 ? (
                <div className="py-8 text-center text-xs text-tertiary-color">
                  No source data available for this range.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {data.sourceBreakdown.map((src) => (
                    <div
                      key={src.type}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-muted-custom border border-subtle/70 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-background border border-subtle">
                          {getSourceIcon(src.type)}
                        </div>
                        <span className="font-semibold text-primary-color">{src.label}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-tertiary-color">
                        <span className="text-primary-color font-bold">{src.count}</span>
                        <span>({src.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. Top Warning Patterns & Safety Insight */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Warning Patterns */}
            <div className="bg-card border border-subtle rounded-2xl p-5 sm:p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary-color">
                    Top detected warning patterns
                  </h3>
                </div>
              </div>

              {data.warningPatterns.length === 0 ? (
                <div className="py-8 text-center text-xs text-tertiary-color space-y-1">
                  <CheckCircle2 className="w-5 h-5 text-accent-primary mx-auto" />
                  <p>No warning signals detected in this period.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.warningPatterns.map((pat, idx) => (
                    <div
                      key={pat.title}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted-custom border border-subtle text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[11px] font-mono font-bold text-tertiary-color shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="font-medium text-primary-color truncate">
                          {pat.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            pat.severity === "high"
                              ? "bg-danger-light text-danger-color"
                              : pat.severity === "medium"
                              ? "bg-warning-light text-warning-color"
                              : "bg-muted text-tertiary-color"
                          }`}
                        >
                          {pat.severity}
                        </span>
                        <span className="font-mono text-tertiary-color text-xs">
                          {pat.count}x
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contextual Safety Insight */}
            <div className="bg-card border border-subtle rounded-2xl p-5 sm:p-6 shadow-soft space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-warning-color" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary-color">
                    Safety pattern insight
                  </h3>
                </div>
                <div className="p-4 rounded-xl bg-accent-light/40 border border-accent-light space-y-1.5">
                  <p className="text-xs font-semibold text-primary-color">
                    Key takeaway from your checks
                  </p>
                  <p className="text-xs text-secondary-color leading-relaxed">
                    {data.safetyInsight}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-subtle flex items-center justify-between">
                <span className="text-[11px] text-tertiary-color">
                  Review complete security recommendations:
                </span>
                <Link
                  href="/dashboard/safety-guide"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent-primary hover:text-accent-hover transition-colors"
                >
                  <span>Safety guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* 4. Recent Activity Table */}
          <div className="bg-card border border-subtle rounded-2xl p-5 sm:p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary-color">
                  Recent checks
                </h3>
              </div>

              <Link
                href="/dashboard/history"
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent-primary hover:text-accent-hover transition-colors"
              >
                <span>View all history</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {data.recentChecks.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-muted-custom border border-subtle hover:border-subtle/80 transition-all duration-150 interactive-card gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-background border border-subtle shrink-0">
                      {getSourceIcon(item.sourceType)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary-color truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-background border border-subtle text-tertiary-color shrink-0">
                          {item.sourceLabel}
                        </span>
                      </div>
                      {item.subtitle && (
                        <span className="text-[11px] text-tertiary-color truncate block">
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-[11px] text-tertiary-color font-mono">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    {getRiskBadge(item.riskLevel, item.riskScore)}
                    <Link
                      href={`/dashboard/result/${item.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-accent-primary hover:text-accent-hover pl-1"
                    >
                      <span>View report</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
