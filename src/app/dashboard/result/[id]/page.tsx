"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Globe,
  Calendar,
  AlertCircle,
  Plus,
  Check,
  AlertTriangle,
  FileSearch,
  Info,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { RiskLevel, RiskSignal, VerificationCoverage } from "@/lib/risk-engine/types";
import { UrlIntelligence } from "@/lib/url-intelligence/types";
import RiskScore from "@/components/verification/RiskScore";
import RiskSignalCard from "@/components/verification/RiskSignalCard";
import RiskSummary from "@/components/verification/RiskSummary";
import Recommendations from "@/components/verification/Recommendations";

interface VerificationRecord {
  id: string;
  user_id: string;
  input_type: "url" | "manual";
  url: string | null;
  company_name: string | null;
  job_title: string | null;
  recruiter_email: string | null;
  salary_text: string | null;
  contact_method: string | null;
  payment_requested: boolean | null;
  job_description: string | null;
  risk_score: number;
  risk_level: RiskLevel;
  summary: string;
  recommendations: string[];
  metadata?: UrlIntelligence | null;
  created_at: string;
}

export default function ResultDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [verification, setVerification] = useState<VerificationRecord | null>(null);
  const [signals, setSignals] = useState<RiskSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVerification() {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        // 1. Fetch verification
        const { data: vData, error: vError } = await supabase
          .from("verifications")
          .select("*")
          .eq("id", id)
          .single();

        if (vError || !vData) {
          setError("Verification result not found or access denied.");
          setLoading(false);
          return;
        }

        setVerification(vData as VerificationRecord);

        // 2. Fetch associated risk signals
        const { data: sData } = await supabase
          .from("risk_signals")
          .select("*")
          .eq("verification_id", id)
          .order("points", { ascending: false });

        if (sData) {
          setSignals(sData as RiskSignal[]);
        }
      } catch {
        setError("Unable to load the verification result. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadVerification();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-3">
        <div className="w-8 h-8 mx-auto rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
        <p className="text-xs text-secondary-color">Loading assessment result...</p>
      </div>
    );
  }

  if (error || !verification) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-5">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-secondary-color hover:text-primary-color transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.8} />
          <span>Back to overview</span>
        </Link>

        <div className="p-8 rounded-2xl bg-card border border-subtle text-center space-y-4 shadow-card">
          <AlertCircle className="w-10 h-10 text-warning-color mx-auto" strokeWidth={1.5} />
          <div className="space-y-1">
            <h2 className="text-base font-medium text-primary-color">
              Assessment not found
            </h2>
            <p className="text-xs text-secondary-color max-w-sm mx-auto">
              {error || "The requested verification result is unavailable or was removed."}
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard/check"
              className="inline-flex items-center gap-2 bg-accent-primary bg-accent-hover text-white px-5 py-2.5 rounded-xl text-xs font-medium transition-all shadow-soft btn-interaction"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Check an opportunity</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(verification.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const metadata = verification.metadata;
  const coverageLevel: VerificationCoverage = metadata?.coverage || "medium";
  const coverageLabel = metadata?.coverageLabel || (coverageLevel === "low" ? "Limited" : coverageLevel === "high" ? "Comprehensive" : "Moderate");
  const coverageSummary = metadata?.coverageSummary || (coverageLevel === "low" ? "This URL appears to be a company or showcase page rather than a specific job or internship listing." : "Opportunity parameters and specifications were evaluated.");

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16 animate-in fade-in duration-200">
      
      {/* 1. Header with Metadata */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-secondary-color hover:text-primary-color transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.8} />
          <span>Back to overview</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wider text-tertiary-color block">
              Verification result
            </span>
            <h1 className="text-2xl font-medium text-primary-color tracking-tight">
              {verification.company_name || verification.job_title || "Opportunity assessment"}
            </h1>

            {verification.job_title && verification.company_name && (
              <p className="text-xs sm:text-sm text-secondary-color">
                {verification.job_title}
              </p>
            )}

            {verification.url && (
              <div className="flex items-center gap-1.5 text-xs text-tertiary-color font-mono pt-1">
                <Globe className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
                <span className="truncate max-w-md">{verification.url}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-tertiary-color bg-muted-custom border border-subtle px-3 py-1.5 rounded-xl shrink-0">
            <Calendar className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* 2. Risk Score & Unified Summary Hero Card */}
      <div className="bg-card border border-subtle rounded-2xl p-8 sm:p-10 shadow-card text-center space-y-6">
        <RiskScore score={verification.risk_score} level={verification.risk_level} />
        <RiskSummary summary={verification.summary} />
      </div>

      {/* 3. Verification Coverage Card */}
      <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-7 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-accent-primary" strokeWidth={2} />
            <span className="text-xs uppercase tracking-wider font-medium text-secondary-color">
              Verification Coverage
            </span>
          </div>

          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-md ${
              coverageLevel === "low" || coverageLevel === "insufficient"
                ? "bg-warning-light text-warning-color border border-warning-light"
                : coverageLevel === "high"
                ? "bg-accent-light text-accent-primary border border-accent-light"
                : "bg-muted-custom text-primary-color border border-subtle"
            }`}
          >
            {coverageLabel}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-secondary-color leading-relaxed font-normal">
          {coverageSummary}
        </p>
      </div>

      {/* 4. Website Analysis Summary (When URL Intelligence is present) */}
      {metadata && (
        <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-7 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-primary-color">
              Website analysis
            </h2>
            <span className="text-[11px] text-tertiary-color font-mono">
              {metadata.hostname || "Direct URL"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted-custom border border-subtle">
              {metadata.https ? (
                <>
                  <Check className="w-3.5 h-3.5 text-accent-primary shrink-0" strokeWidth={2.5} />
                  <span className="text-primary-color">HTTPS connection</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-warning-color shrink-0" strokeWidth={2} />
                  <span className="text-warning-color">Unencrypted HTTP connection</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted-custom border border-subtle">
              {metadata.jobRelated ? (
                <>
                  <Check className="w-3.5 h-3.5 text-accent-primary shrink-0" strokeWidth={2.5} />
                  <span className="text-primary-color">Job-related platform content</span>
                </>
              ) : (
                <>
                  <Info className="w-3.5 h-3.5 text-tertiary-color shrink-0" strokeWidth={2} />
                  <span className="text-secondary-color">General organization profile</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted-custom border border-subtle">
              {metadata.redirectCount > 0 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-warning-color shrink-0" strokeWidth={2} />
                  <span className="text-primary-color">
                    {metadata.redirectCount} redirect{metadata.redirectCount > 1 ? "s" : ""} detected
                  </span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-accent-primary shrink-0" strokeWidth={2.5} />
                  <span className="text-primary-color">Direct navigation (0 redirects)</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted-custom border border-subtle">
              <span className="text-secondary-color">
                Domain age: <span className="text-tertiary-color">Could not be verified</span>
              </span>
            </div>
          </div>

          {metadata.analysisLimitation && (
            <p className="text-[11px] text-tertiary-color pt-1">
              Note: {metadata.analysisLimitation}
            </p>
          )}
        </div>
      )}

      {/* 5. Detected Signals & Observations Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-medium text-primary-color">
            What we found
          </h2>
          <p className="text-xs text-secondary-color mt-0.5">
            {signals.length > 0
              ? `${signals.length} evaluated signal${signals.length > 1 ? "s" : ""} and observations`
              : "Evaluated opportunity indicators and observations"}
          </p>
        </div>

        <div className="bg-card border border-subtle rounded-2xl shadow-soft divide-y divide-subtle overflow-hidden">
          {signals.length > 0 ? (
            signals.map((sig) => (
              <RiskSignalCard key={sig.id || sig.title} signal={sig} />
            ))
          ) : (
            <div className="p-6 text-center text-xs text-secondary-color">
              <Info className="w-5 h-5 text-accent-primary mx-auto mb-2" strokeWidth={2} />
              <span>No critical warning signals were detected. Standard career diligence recommended.</span>
            </div>
          )}
        </div>
      </div>

      {/* 6. Recommendations Section */}
      <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
        <div>
          <h2 className="text-base font-medium text-primary-color">
            What you should do
          </h2>
          <p className="text-xs text-secondary-color mt-0.5">
            Actionable verification steps before responding or sharing documents
          </p>
        </div>

        <Recommendations recommendations={verification.recommendations} />

        {/* Action CTAs */}
        <div className="pt-4 border-t border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/dashboard/check"
            className="w-full sm:w-auto bg-accent-primary bg-accent-hover text-white px-6 py-3 rounded-xl text-sm font-medium transition-all text-center shadow-soft btn-interaction flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>Check another opportunity</span>
          </Link>

          <Link
            href="/dashboard/history"
            className="w-full sm:w-auto border border-subtle bg-card hover:bg-muted-custom text-primary-color px-5 py-3 rounded-xl text-sm font-medium transition-colors text-center"
          >
            View all history
          </Link>
        </div>
      </div>

      {/* 7. Legal Disclaimer */}
      <div className="p-4 rounded-xl bg-muted-custom border border-subtle text-center">
        <p className="text-[11px] text-tertiary-color leading-relaxed font-normal">
          ScamCheck provides an automated risk assessment based on the information provided. A low-risk result does not guarantee that an opportunity is legitimate. Always verify independently.
        </p>
      </div>

    </div>
  );
}
