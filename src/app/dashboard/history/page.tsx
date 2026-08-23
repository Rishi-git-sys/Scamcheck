"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Clock,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { RiskLevel } from "@/lib/risk-engine/types";

interface VerificationItem {
  id: string;
  company_name: string | null;
  job_title: string | null;
  url: string | null;
  risk_score: number;
  risk_level: RiskLevel;
  created_at: string;
}

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [records, setRecords] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("verifications")
          .select("id, company_name, job_title, url, risk_score, risk_level, created_at")
          .order("created_at", { ascending: false });

        if (fetchError) {
          setError("Failed to load verification history.");
        } else if (data) {
          setRecords(data as VerificationItem[]);
        }
      } catch {
        setError("An unexpected error occurred. Please refresh.");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  const filtered = records.filter((item) => {
    const searchTarget = [
      item.company_name || "",
      item.job_title || "",
      item.url || "",
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchTarget.includes(search.toLowerCase());

    const matchesRisk =
      riskFilter === "ALL" ||
      (riskFilter === "HIGH" && item.risk_level === "high") ||
      (riskFilter === "REVIEW" && item.risk_level === "review") ||
      (riskFilter === "LOW" && item.risk_level === "safe");

    return matchesSearch && matchesRisk;
  });

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

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-tertiary-color font-medium block">
            Workspace / History
          </span>
          <h1 className="text-2xl font-medium tracking-tight text-primary-color">
            Verification history
          </h1>
          <p className="text-sm text-secondary-color">
            All your past opportunity checks in one place.
          </p>
        </div>

        <Link
          href="/dashboard/check"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent-primary bg-accent-hover text-white text-sm font-medium transition-all shadow-soft btn-interaction shrink-0"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>New check</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, role, or URL..."
            className="w-full bg-card border border-subtle focus:border-accent-primary rounded-xl px-4 py-2.5 text-sm text-primary-color placeholder:text-tertiary-color focus:outline-none focus:ring-2 focus:ring-accent-primary/10 transition-all shadow-soft"
          />
        </div>

        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="bg-card border border-subtle text-secondary-color px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-accent-primary cursor-pointer shadow-soft"
        >
          <option value="ALL">All risk levels</option>
          <option value="LOW">Low risk</option>
          <option value="REVIEW">Needs review</option>
          <option value="HIGH">High risk</option>
        </select>
      </div>

      {/* Content State */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 mx-auto rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
          <p className="text-xs text-secondary-color">Loading history records...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-danger-light border border-danger-light text-danger-color text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : filtered.length > 0 ? (
        <div className="bg-card border border-subtle rounded-2xl divide-y divide-subtle shadow-card overflow-hidden">
          {filtered.map((item) => {
            const displayName =
              item.company_name ||
              item.job_title ||
              (item.url ? new URL(item.url.startsWith("http") ? item.url : `https://${item.url}`).hostname : "Opportunity check");

            const formattedDate = new Date(item.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <Link
                key={item.id}
                href={`/dashboard/result/${item.id}`}
                className="p-5 flex items-center justify-between hover:bg-muted-custom transition-colors group block"
              >
                <div className="space-y-0.5 pr-4">
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
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-md inline-block ${getLevelStyle(
                        item.risk_level
                      )}`}
                    >
                      {getLevelLabel(item.risk_level)}
                    </span>
                    <div className="text-xs text-tertiary-color mt-1 tabular-nums">
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
        <div className="bg-card border border-subtle rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-card">
          <Clock className="w-10 h-10 text-tertiary-color mb-3" strokeWidth={1.5} />
          <h3 className="text-base font-medium text-primary-color mb-1">
            Your verification history starts here.
          </h3>
          <p className="text-xs sm:text-sm text-secondary-color mb-5">
            Check your first opportunity and we&apos;ll keep the result here for you.
          </p>
          <Link
            href="/dashboard/check"
            className="bg-accent-primary bg-accent-hover text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-soft btn-interaction"
          >
            Check an opportunity
          </Link>
        </div>
      )}
    </div>
  );
}
