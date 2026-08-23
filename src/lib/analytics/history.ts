// ==============================================================================
// Phase 15: Intelligent History Query & Management Layer
// Handles multi-field search, filtering, sorting, pagination, and deletion
// ==============================================================================

import { SupabaseClient } from "@supabase/supabase-js";
import {
  HistoryFilterOptions,
  PaginatedHistoryResult,
  RecentCheckItem,
} from "./types";
import { getDateRangeTimestamp, formatRecentCheckItem } from "./dashboard";

/**
 * Fetch filtered, searched, sorted, and paginated verification history.
 */
export async function getHistoryRecords(
  supabase: SupabaseClient,
  userId: string,
  options: HistoryFilterOptions = {}
): Promise<PaginatedHistoryResult> {
  const {
    search,
    riskLevel = "ALL",
    sourceType = "ALL",
    dateRange = "all",
    sortOrder = "newest",
    page = 1,
    pageSize = 20,
  } = options;

  let query = supabase
    .from("verifications")
    .select("id, input_type, company_name, job_title, url, recruiter_email, risk_score, risk_level, metadata, created_at", { count: "exact" })
    .eq("user_id", userId);

  // 1. Date Range Filter
  const sinceTimestamp = getDateRangeTimestamp(dateRange);
  if (sinceTimestamp) {
    query = query.gte("created_at", sinceTimestamp);
  }

  // 2. Risk Level Filter
  if (riskLevel && riskLevel !== "ALL") {
    query = query.eq("risk_level", riskLevel.toLowerCase());
  }

  // 3. Source Type Filter
  if (sourceType && sourceType !== "ALL") {
    if (sourceType === "url" || sourceType === "company") {
      query = query.eq("input_type", sourceType);
    } else {
      // Evidence subtypes (screenshot, text, manual) are stored in metadata
      query = query.eq("metadata->>sourceType", sourceType);
    }
  }

  // 4. Search Filter (company name, job title, URL, recruiter email)
  if (search && search.trim().length > 0) {
    const term = search.trim();
    query = query.or(
      `company_name.ilike.%${term}%,job_title.ilike.%${term}%,url.ilike.%${term}%,recruiter_email.ilike.%${term}%`
    );
  }

  // 5. Sorting
  if (sortOrder === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (sortOrder === "highest_risk") {
    query = query.order("risk_score", { ascending: false });
  } else if (sortOrder === "lowest_risk") {
    query = query.order("risk_score", { ascending: true });
  } else {
    // Default: newest first
    query = query.order("created_at", { ascending: false });
  }

  // 6. Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error || !data) {
    return {
      records: [],
      totalCount: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  const totalCount = count ?? data.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const records: RecentCheckItem[] = data.map(formatRecentCheckItem);

  return {
    records,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Safely deletes a verification record and its associated risk signals.
 */
export async function deleteVerificationRecord(
  supabase: SupabaseClient,
  userId: string,
  verificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Delete associated risk signals first
    await supabase
      .from("risk_signals")
      .delete()
      .eq("verification_id", verificationId);

    // 2. Delete the verification record (RLS ensures user owns the record)
    const { error } = await supabase
      .from("verifications")
      .delete()
      .eq("id", verificationId)
      .eq("user_id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to delete verification." };
  }
}
