"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  ArrowRight,
  Trash2,
  AlertCircle,
  Clock,
  Globe,
  ImageIcon,
  FileText,
  Building2,
  FileSearch,
  ChevronLeft,
  ChevronRight,
  Shield,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  DateRangeFilter,
  HistoryFilterOptions,
  RecentCheckItem,
  PaginatedHistoryResult,
} from "@/lib/analytics/types";
import { getHistoryRecords, deleteVerificationRecord } from "@/lib/analytics/history";

export default function HistoryManager() {
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "highest_risk" | "lowest_risk">("newest");
  const [page, setPage] = useState(1);

  const [result, setResult] = useState<PaginatedHistoryResult>({
    records: [],
    totalCount: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Deletion modal state
  const [itemToDelete, setItemToDelete] = useState<RecentCheckItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load history records on filter change
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        const res = await getHistoryRecords(supabase, user.id, {
          search,
          riskLevel: riskFilter,
          sourceType: sourceFilter,
          dateRange,
          sortOrder,
          page,
          pageSize: 20,
        });

        setResult(res);
      } catch (err: any) {
        setError("Failed to load verification history. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, search, riskFilter, sourceFilter, dateRange, sortOrder, page]);

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!user || !itemToDelete) return;
    setIsDeleting(true);

    try {
      const supabase = createClient();
      const res = await deleteVerificationRecord(supabase, user.id, itemToDelete.id);

      if (res.success) {
        // Remove locally from state
        setResult((prev) => ({
          ...prev,
          records: prev.records.filter((r) => r.id !== itemToDelete.id),
          totalCount: Math.max(0, prev.totalCount - 1),
        }));
        setItemToDelete(null);
      } else {
        alert(res.error || "Failed to delete verification record.");
      }
    } catch (err: any) {
      alert("An unexpected error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

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
        <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md bg-danger-light text-danger-color border border-danger-light">
          HIGH RISK • {score}
        </span>
      );
    }
    if (level === "review" || score >= 30) {
      return (
        <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md bg-warning-light text-warning-color border border-warning-light">
          REVIEW • {score}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md bg-accent-light text-accent-primary border border-accent-light">
        LOW RISK • {score}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header & New Check Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary-color">
            Verification history
          </h1>
          <p className="text-xs sm:text-sm text-secondary-color mt-1">
            Browse, search, and manage all your past opportunity verification reports.
          </p>
        </div>

        <Link
          href="/dashboard/check"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-background text-xs font-bold transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>New check</span>
        </Link>
      </div>

      {/* Search & Multi-Filter Controls */}
      <div className="bg-card border border-subtle rounded-2xl p-4 sm:p-5 shadow-soft space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-tertiary-color absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by company, role, recruiter email, or URL..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted-custom border border-subtle text-xs text-primary-color placeholder:text-tertiary-color focus:outline-none focus:border-accent-primary transition-all"
          />
        </div>

        {/* Filter Pills & Sort Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Filter Groups */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Risk Filter */}
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-lg bg-muted-custom border border-subtle text-secondary-color text-xs font-medium focus:outline-none focus:border-accent-primary"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="high">High Risk</option>
              <option value="review">Needs Review</option>
              <option value="safe">Low Risk</option>
            </select>

            {/* Evidence Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-lg bg-muted-custom border border-subtle text-secondary-color text-xs font-medium focus:outline-none focus:border-accent-primary"
            >
              <option value="ALL">All Evidence Types</option>
              <option value="url">URL</option>
              <option value="screenshot">Screenshot</option>
              <option value="text">Pasted Text</option>
              <option value="company">Company</option>
              <option value="manual">Manual Form</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value as DateRangeFilter);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-lg bg-muted-custom border border-subtle text-secondary-color text-xs font-medium focus:outline-none focus:border-accent-primary"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          {/* Sort Order Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-tertiary-color">Sort by:</span>
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-lg bg-muted-custom border border-subtle text-secondary-color text-xs font-medium focus:outline-none focus:border-accent-primary"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest_risk">Highest risk</option>
              <option value="lowest_risk">Lowest risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* History List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-card border border-subtle rounded-2xl p-4 sm:p-5 shadow-soft flex items-center justify-between gap-4 animate-pulse"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-muted-custom shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-40 bg-muted-custom rounded" />
                  <div className="h-2.5 w-24 bg-muted-custom rounded" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-16 bg-muted-custom rounded hidden sm:block" />
                <div className="h-5 w-20 bg-muted-custom rounded-md" />
                <div className="h-4 w-20 bg-muted-custom rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-card border border-subtle text-center text-xs text-danger-color">
          {error}
        </div>
      ) : result.records.length === 0 ? (
        <div className="bg-card border border-subtle rounded-2xl p-10 text-center space-y-4 shadow-soft">
          <Clock className="w-10 h-10 text-tertiary-color mx-auto" strokeWidth={1.5} />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-primary-color">
              No matching verifications
            </h3>
            <p className="text-xs text-secondary-color max-w-sm mx-auto">
              {search || riskFilter !== "ALL" || sourceFilter !== "ALL" || dateRange !== "all"
                ? "No verifications match your search and filter criteria. Try resetting the filters."
                : "You haven't checked any opportunities yet."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-tertiary-color px-1">
            <span>
              Showing {result.records.length} of {result.totalCount} verification{result.totalCount > 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-2.5">
            {result.records.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-subtle hover:border-subtle/80 rounded-2xl p-4 sm:p-5 shadow-soft transition-all duration-150 interactive-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                {/* Left: Source Icon & Title Info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-muted-custom border border-subtle shrink-0">
                    {getSourceIcon(item.sourceType)}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary-color truncate block">
                        {item.title}
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-muted-custom border border-subtle text-tertiary-color shrink-0">
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

                {/* Right: Risk Badge, Date, View Report & Delete */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-subtle/40">
                  <span className="text-[11px] text-tertiary-color font-mono">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>

                  {getRiskBadge(item.riskLevel, item.riskScore)}

                  <Link
                    href={`/dashboard/result/${item.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent-primary hover:text-accent-hover transition-colors pl-1"
                  >
                    <span>View report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => setItemToDelete(item)}
                    className="p-1.5 rounded-lg text-tertiary-color hover:text-danger-color hover:bg-danger-light/30 transition-colors"
                    title="Delete verification record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {result.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-subtle text-xs">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-subtle bg-background disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted-custom text-secondary-color"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="text-secondary-color font-medium">
                Page {result.page} of {result.totalPages}
              </span>

              <button
                disabled={page >= result.totalPages}
                onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-subtle bg-background disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted-custom text-secondary-color"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-card border border-subtle rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-danger-color">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-primary-color">
                Delete verification?
              </h3>
            </div>

            <p className="text-xs text-secondary-color leading-relaxed">
              Are you sure you want to delete the verification for{" "}
              <strong className="text-primary-color">{itemToDelete.title}</strong>? This action cannot be undone and removes its associated risk signals.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setItemToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg border border-subtle text-xs font-medium text-secondary-color hover:text-primary-color"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-3.5 py-1.5 rounded-lg bg-danger-color text-white text-xs font-bold hover:bg-danger-color/90 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete record"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
