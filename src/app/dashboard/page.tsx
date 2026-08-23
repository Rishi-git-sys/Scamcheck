"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Briefcase,
  Building2,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { RiskLevel } from "@/lib/risk-engine/types";

interface RecentVerification {
  id: string;
  company_name: string | null;
  job_title: string | null;
  url: string | null;
  risk_score: number;
  risk_level: RiskLevel;
  created_at: string;
}

export default function DashboardPage() {
  const { fullName, user } = useAuth();
  const router = useRouter();
  const firstName = fullName ? fullName.split(" ")[0] : "there";

  const [verifyType, setVerifyType] = useState<"job" | "company" | "recruiter">("job");
  const [urlInput, setUrlInput] = useState("");

  const [recentChecks, setRecentChecks] = useState<RecentVerification[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    review: 0,
    safe: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      setLoading(true);

      try {
        const supabase = createClient();

        // 1. Fetch user verifications
        const { data, error } = await supabase
          .from("verifications")
          .select("id, company_name, job_title, url, risk_score, risk_level, created_at")
          .order("created_at", { ascending: false });

        if (!error && data) {
          const records = data as RecentVerification[];
          setRecentChecks(records.slice(0, 5));

          const highCount = records.filter((r) => r.risk_level === "high").length;
          const reviewCount = records.filter((r) => r.risk_level === "review").length;
          const safeCount = records.filter((r) => r.risk_level === "safe").length;

          setStats({
            total: records.length,
            high: highCount,
            review: reviewCount,
            safe: safeCount,
          });
        }
      } catch {
        // Fallback to 0 if network error
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  const handleQuickCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      router.push(`/dashboard/check?url=${encodeURIComponent(urlInput.trim())}`);
    } else {
      router.push("/dashboard/check");
    }
  };

  const getLevelLabel = (level: RiskLevel) => {
    switch (level) {
      case "high":
        return "High risk";
      case "review":
        return "Needs review";
      case "safe":
      default:
        return "Low risk";
    }
  };

  const getLevelStyle = (level: RiskLevel) => {
    switch (level) {
      case "high":
        return "bg-danger-light text-danger-color";
      case "review":
        return "bg-warning-light text-warning-color";
      case "safe":
      default:
        return "bg-accent-light text-accent-primary";
    }
  };

  const total = stats.total || 1;
  const safePct = stats.total > 0 ? Math.round((stats.safe / total) * 100) : 0;
  const reviewPct = stats.total > 0 ? Math.round((stats.review / total) * 100) : 0;
  const highPct = stats.total > 0 ? Math.round((stats.high / total) * 100) : 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs text-tertiary-color font-medium block">
            Workspace / Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-primary-color">
            Good morning, {firstName}.
          </h1>
          <p className="text-sm text-secondary-color">
            Let&apos;s make your next opportunity a little safer.
          </p>
        </div>

        <Link
          href="/dashboard/check"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent-primary bg-accent-hover text-white font-medium text-sm transition-all shadow-soft btn-interaction self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>Check opportunity</span>
        </Link>
      </div>

      {/* 2. Primary Verification Area */}
      <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
        
        <div>
          <h2 className="text-base font-medium text-primary-color">
            What would you like to verify?
          </h2>
        </div>

        {/* Three Choices */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setVerifyType("job")}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              verifyType === "job"
                ? "bg-accent-light border-accent-light-border text-primary-color"
                : "bg-muted-custom border-subtle hover:bg-card text-secondary-color"
            }`}
          >
            <Briefcase
              className={`w-4 h-4 mb-2 ${
                verifyType === "job" ? "text-accent-primary" : "text-tertiary-color"
              }`}
              strokeWidth={1.8}
            />
            <div className="text-xs font-medium text-primary-color">
              Job or internship
            </div>
            <div className="text-[11px] text-secondary-color mt-0.5">
              Check an opportunity
            </div>
          </button>

          <button
            type="button"
            onClick={() => setVerifyType("company")}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              verifyType === "company"
                ? "bg-accent-light border-accent-light-border text-primary-color"
                : "bg-muted-custom border-subtle hover:bg-card text-secondary-color"
            }`}
          >
            <Building2
              className={`w-4 h-4 mb-2 ${
                verifyType === "company" ? "text-accent-primary" : "text-tertiary-color"
              }`}
              strokeWidth={1.8}
            />
            <div className="text-xs font-medium text-primary-color">
              Company
            </div>
            <div className="text-[11px] text-secondary-color mt-0.5">
              Review a company
            </div>
          </button>

          <button
            type="button"
            onClick={() => setVerifyType("recruiter")}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              verifyType === "recruiter"
                ? "bg-accent-light border-accent-light-border text-primary-color"
                : "bg-muted-custom border-subtle hover:bg-card text-secondary-color"
            }`}
          >
            <UserCheck
              className={`w-4 h-4 mb-2 ${
                verifyType === "recruiter" ? "text-accent-primary" : "text-tertiary-color"
              }`}
              strokeWidth={1.8}
            />
            <div className="text-xs font-medium text-primary-color">
              Recruiter
            </div>
            <div className="text-[11px] text-secondary-color mt-0.5">
              Verify recruiter details
            </div>
          </button>
        </div>

        {/* Verification Input */}
        <form onSubmit={handleQuickCheck} className="space-y-3 pt-2">
          <label className="text-xs font-medium text-secondary-color block">
            Opportunity link
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste the job or internship URL here"
              className="flex-1 bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl px-4 py-3 text-sm text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all"
            />
            <button
              type="submit"
              className="bg-accent-primary bg-accent-hover text-white px-6 py-3 rounded-xl text-sm font-medium transition-all shadow-soft btn-interaction cursor-pointer shrink-0"
            >
              Check opportunity
            </button>
          </div>

          <div className="pt-1 flex flex-wrap items-center justify-between text-xs text-tertiary-color">
            <span>You can also enter the details manually.</span>
            <Link
              href="/dashboard/check"
              className="text-accent-primary hover:underline font-medium"
            >
              Enter details instead →
            </Link>
          </div>
        </form>

      </div>

      {/* 3. Quick Stats (Real Data From Supabase) */}
      <div className="bg-card border border-subtle rounded-2xl p-6 shadow-soft">
        <span className="text-xs uppercase tracking-wider text-tertiary-color font-medium block mb-4">
          Your activity
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <div className="text-2xl font-medium text-primary-color tabular-nums">
              {loading ? "..." : stats.total}
            </div>
            <div className="text-xs text-secondary-color mt-0.5">checks</div>
          </div>

          <div>
            <div className="text-2xl font-medium text-danger-color tabular-nums">
              {loading ? "..." : stats.high}
            </div>
            <div className="text-xs text-secondary-color mt-0.5">high risk</div>
          </div>

          <div>
            <div className="text-2xl font-medium text-warning-color tabular-nums">
              {loading ? "..." : stats.review}
            </div>
            <div className="text-xs text-secondary-color mt-0.5">needs review</div>
          </div>

          <div>
            <div className="text-2xl font-medium text-accent-primary tabular-nums">
              {loading ? "..." : stats.safe}
            </div>
            <div className="text-xs text-secondary-color mt-0.5">low risk</div>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Grid: Recent Checks & Verification Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Recent Checks (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-primary-color">
              Recent checks
            </h2>
            {recentChecks.length > 0 && (
              <Link
                href="/dashboard/history"
                className="text-xs text-accent-primary hover:underline font-medium"
              >
                View all →
              </Link>
            )}
          </div>

          {loading ? (
            <div className="bg-card border border-subtle rounded-2xl p-8 text-center text-xs text-secondary-color">
              Loading recent checks...
            </div>
          ) : recentChecks.length > 0 ? (
            <div className="bg-card border border-subtle rounded-2xl divide-y divide-subtle shadow-soft overflow-hidden">
              {recentChecks.map((item) => {
                const displayName =
                  item.company_name ||
                  item.job_title ||
                  (item.url ? new URL(item.url.startsWith("http") ? item.url : `https://${item.url}`).hostname : "Opportunity check");

                const formattedDate = new Date(item.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <Link
                    key={item.id}
                    href={`/dashboard/result/${item.id}`}
                    className="p-4 sm:p-5 flex items-center justify-between hover:bg-muted-custom transition-colors group block"
                  >
                    <div className="space-y-0.5 pr-3">
                      <div className="text-sm font-medium text-primary-color group-hover:text-accent-primary transition-colors">
                        {displayName}
                      </div>
                      <div className="text-xs text-secondary-color">
                        {item.job_title || item.url || "Opportunity details"}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right shrink-0">
                      <div>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-md inline-block ${getLevelStyle(
                            item.risk_level
                          )}`}
                        >
                          {getLevelLabel(item.risk_level)}
                        </span>
                        <div className="text-[11px] text-tertiary-color mt-1 tabular-nums">
                          {item.risk_score} / 100 • {formattedDate}
                        </div>
                      </div>

                      <ArrowRight
                        className="w-4 h-4 text-tertiary-color group-hover:text-primary-color group-hover:translate-x-0.5 transition-all"
                        strokeWidth={1.8}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-card border border-subtle rounded-2xl p-8 text-center space-y-3 shadow-soft">
              <Clock className="w-8 h-8 text-tertiary-color mx-auto" strokeWidth={1.5} />
              <h3 className="text-sm font-medium text-primary-color">
                Your verification history starts here.
              </h3>
              <p className="text-xs text-secondary-color max-w-xs mx-auto">
                Check your first opportunity and we&apos;ll keep the result here for you.
              </p>
              <div className="pt-1">
                <Link
                  href="/dashboard/check"
                  className="inline-block bg-accent-primary bg-accent-hover text-white px-4 py-2 rounded-xl text-xs font-medium transition-all shadow-soft btn-interaction"
                >
                  Check an opportunity
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Trust Summary & Personalized Insight (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Trust Summary */}
          <div className="bg-card border border-subtle rounded-2xl p-6 shadow-soft space-y-4">
            <h3 className="text-sm font-medium text-primary-color">
              Your verification summary
            </h3>

            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-secondary-color">
                  <span>Low risk</span>
                  <span className="font-medium text-primary-color tabular-nums">
                    {stats.safe}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted-custom overflow-hidden">
                  <div
                    className="h-full bg-accent-primary transition-all duration-300"
                    style={{ width: `${safePct}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-secondary-color">
                  <span>Needs review</span>
                  <span className="font-medium text-primary-color tabular-nums">
                    {stats.review}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted-custom overflow-hidden">
                  <div
                    className="h-full bg-warning-color transition-all duration-300"
                    style={{ width: `${reviewPct}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-secondary-color">
                  <span>High risk</span>
                  <span className="font-medium text-primary-color tabular-nums">
                    {stats.high}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted-custom overflow-hidden">
                  <div
                    className="h-full bg-danger-color transition-all duration-300"
                    style={{ width: `${highPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Personalized Insight Block (Soft Green) */}
          <div className="bg-accent-light border border-accent-light-border rounded-2xl p-6 space-y-3">
            <span className="text-xs uppercase tracking-wider text-accent-primary font-medium block">
              One thing to remember
            </span>
            <p className="text-xs sm:text-sm text-primary-color leading-relaxed">
              Legitimate employers should not require you to pay money to secure an internship or job.
            </p>
            <div className="pt-1">
              <Link
                href="/#trust-section"
                className="text-xs font-medium text-accent-primary hover:underline"
              >
                Read safety guide →
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
