"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Globe,
  Mail,
  Link2,
  ArrowRight,
  AlertCircle,
  Clock,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { RiskLevel } from "@/lib/risk-engine/types";
import AnalysisProgress from "@/components/verification/AnalysisProgress";

interface CompanyRecord {
  id: string;
  company_name: string | null;
  url: string | null;
  risk_score: number;
  risk_level: RiskLevel;
  created_at: string;
  metadata?: { coverage?: string; coverageLabel?: string; hostname?: string };
}

function CompanyForm({ onSubmit }: { onSubmit: (id: string) => void }) {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [opportunityUrl, setOpportunityUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!companyName.trim()) {
      setError("Please enter the company name.");
      return;
    }
    if (!companyWebsite.trim()) {
      setError("Please enter the company website URL.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/verify-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          companyWebsite: companyWebsite.trim(),
          companyEmail: companyEmail.trim() || undefined,
          opportunityUrl: opportunityUrl.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Unable to verify the company. Please try again.");
        setIsLoading(false);
        return;
      }

      onSubmit(data.verificationId);
      router.push(`/dashboard/companies/${data.verificationId}`);
    } catch {
      setError("A network error occurred. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-8 shadow-card">
        <AnalysisProgress />
      </div>
    );
  }

  return (
    <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
      {error && (
        <div className="p-3.5 rounded-xl bg-danger-light border border-danger-light text-danger-color text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.8} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Required Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-secondary-color block">
              Company name <span className="text-danger-color">*</span>
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Microsoft"
              className="w-full bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl px-3.5 py-2.5 text-sm text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-secondary-color block">
              Company website <span className="text-danger-color">*</span>
            </label>
            <input
              type="text"
              required
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              placeholder="https://www.microsoft.com"
              className="w-full bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl px-3.5 py-2.5 text-sm text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all"
            />
          </div>
        </div>

        {/* Optional Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-secondary-color block">
              Company email{" "}
              <span className="text-tertiary-color font-normal">(optional)</span>
            </label>
            <input
              type="email"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              placeholder="careers@company.com"
              className="w-full bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl px-3.5 py-2.5 text-sm text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-secondary-color block">
              Job / internship URL{" "}
              <span className="text-tertiary-color font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={opportunityUrl}
              onChange={(e) => setOpportunityUrl(e.target.value)}
              placeholder="https://company.com/careers/software-intern"
              className="w-full bg-muted-custom border border-subtle focus:border-accent-primary rounded-xl px-3.5 py-2.5 text-sm text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all"
            />
          </div>
        </div>

        <p className="text-[11px] text-tertiary-color">
          Only public internet addresses can be analyzed. Private networks and internal addresses are not permitted.
        </p>

        <div className="pt-1">
          <button
            type="submit"
            className="w-full sm:w-auto bg-accent-primary bg-accent-hover text-white px-7 py-3 rounded-xl text-sm font-medium transition-all shadow-soft btn-interaction cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Verify company</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CompaniesPage() {
  const [recentChecks, setRecentChecks] = useState<CompanyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecentCompanyChecks() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("verifications")
          .select("id, company_name, url, risk_score, risk_level, created_at, metadata")
          .eq("input_type", "company")
          .order("created_at", { ascending: false })
          .limit(10);

        if (data) setRecentChecks(data as CompanyRecord[]);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    loadRecentCompanyChecks();
  }, []);

  const handleFormSubmit = (id: string) => {
    // Will be routed by the form
  };

  const getLevelStyle = (level: RiskLevel) => {
    switch (level) {
      case "high": return "bg-danger-light text-danger-color";
      case "review": return "bg-warning-light text-warning-color";
      default: return "bg-accent-light text-accent-primary";
    }
  };

  const getLevelLabel = (level: RiskLevel) => {
    switch (level) {
      case "high": return "High risk";
      case "review": return "Needs review";
      default: return "Low risk";
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <span className="text-xs text-tertiary-color font-medium block">
          Workspace / Company verification
        </span>
        <h1 className="text-2xl font-medium tracking-tight text-primary-color">
          Company verification
        </h1>
        <p className="text-sm text-secondary-color">
          Review the company behind an opportunity before you continue.
        </p>
      </div>

      {/* Verification Form */}
      <CompanyForm onSubmit={handleFormSubmit} />

      {/* Recent Company Checks */}
      <div className="space-y-4">
        <h2 className="text-base font-medium text-primary-color">
          Recent company checks
        </h2>

        {loading ? (
          <div className="bg-card border border-subtle rounded-2xl p-8 text-center text-xs text-secondary-color">
            Loading recent company verifications...
          </div>
        ) : recentChecks.length > 0 ? (
          <div className="bg-card border border-subtle rounded-2xl divide-y divide-subtle shadow-soft overflow-hidden">
            {recentChecks.map((item) => {
              const hostname =
                item.metadata?.hostname ||
                (item.url
                  ? (() => {
                      try {
                        return new URL(item.url).hostname;
                      } catch {
                        return item.url;
                      }
                    })()
                  : "Unknown");

              const coverageLabel = item.metadata?.coverageLabel || "—";

              const formattedDate = new Date(item.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <Link
                  key={item.id}
                  href={`/dashboard/companies/${item.id}`}
                  className="p-5 flex items-center justify-between hover:bg-muted-custom transition-colors group block"
                >
                  <div className="space-y-0.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-accent-light text-accent-primary flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                      </div>
                      <div className="text-sm font-medium text-primary-color group-hover:text-accent-primary transition-colors">
                        {item.company_name || "Unknown company"}
                      </div>
                    </div>
                    <div className="text-xs text-tertiary-color font-mono pl-8">
                      {hostname}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right shrink-0">
                    <div className="space-y-1">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-md inline-block ${getLevelStyle(item.risk_level)}`}>
                        {getLevelLabel(item.risk_level)}
                      </span>
                      <div className="text-xs text-tertiary-color tabular-nums">
                        {coverageLabel} coverage • {formattedDate}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-tertiary-color group-hover:text-primary-color group-hover:translate-x-0.5 transition-all" strokeWidth={1.8} />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-card border border-subtle rounded-2xl p-10 text-center space-y-3 shadow-soft">
            <Building2 className="w-9 h-9 text-tertiary-color mx-auto" strokeWidth={1.5} />
            <h3 className="text-sm font-medium text-primary-color">No company checks yet.</h3>
            <p className="text-xs text-secondary-color max-w-xs mx-auto">
              Use the form above to verify a company before applying or sharing documents.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
