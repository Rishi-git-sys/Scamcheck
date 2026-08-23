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
  Building2,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { RiskLevel, RiskSignal, VerificationCoverage } from "@/lib/risk-engine/types";
import { CompanyIntelligence } from "@/lib/company-intelligence/types";
import RiskScore from "@/components/verification/RiskScore";
import RiskSignalCard from "@/components/verification/RiskSignalCard";
import RiskSummary from "@/components/verification/RiskSummary";
import Recommendations from "@/components/verification/Recommendations";

interface CompanyVerificationRecord {
  id: string;
  user_id: string;
  input_type: string;
  url: string | null;
  company_name: string | null;
  job_title: string | null;
  recruiter_email: string | null;
  risk_score: number;
  risk_level: RiskLevel;
  summary: string;
  recommendations: string[];
  metadata?: (CompanyIntelligence & { verificationType?: string }) | null;
  created_at: string;
}

function CoverageChip({ level }: { level: VerificationCoverage }) {
  const styles = {
    high: "bg-accent-light text-accent-primary border border-accent-light",
    medium: "bg-muted-custom text-primary-color border border-subtle",
    low: "bg-warning-light text-warning-color border border-warning-light",
    insufficient: "bg-danger-light text-danger-color border border-danger-light",
  };
  const labels = {
    high: "Comprehensive",
    medium: "Moderate",
    low: "Limited",
    insufficient: "Insufficient",
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-md ${styles[level]}`}>
      {labels[level]}
    </span>
  );
}

function EvidenceItem({
  present,
  trueLabel,
  falseLabel,
  unknownLabel,
  state,
}: {
  present?: boolean;
  trueLabel: string;
  falseLabel?: string;
  unknownLabel?: string;
  state?: "positive" | "warning" | "neutral" | "unknown";
}) {
  const resolvedState =
    state ||
    (present === true ? "positive" : present === false ? "neutral" : "unknown");

  const iconMap = {
    positive: <Check className="w-3.5 h-3.5 text-accent-primary shrink-0" strokeWidth={2.5} />,
    warning: <AlertTriangle className="w-3.5 h-3.5 text-warning-color shrink-0" strokeWidth={2} />,
    neutral: <Info className="w-3.5 h-3.5 text-tertiary-color shrink-0" strokeWidth={2} />,
    unknown: <Info className="w-3.5 h-3.5 text-tertiary-color shrink-0" strokeWidth={2} />,
  };

  const textMap = {
    positive: "text-primary-color",
    warning: "text-warning-color",
    neutral: "text-secondary-color",
    unknown: "text-tertiary-color",
  };

  const label =
    resolvedState === "positive"
      ? trueLabel
      : resolvedState === "warning"
      ? falseLabel || trueLabel
      : unknownLabel || falseLabel || trueLabel;

  return (
    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted-custom border border-subtle text-xs">
      {iconMap[resolvedState]}
      <span className={textMap[resolvedState]}>{label}</span>
    </div>
  );
}

export default function CompanyResultPage() {
  const params = useParams();
  const id = params.id as string;

  const [verification, setVerification] = useState<CompanyVerificationRecord | null>(null);
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

        setVerification(vData as CompanyVerificationRecord);

        const { data: sData } = await supabase
          .from("risk_signals")
          .select("*")
          .eq("verification_id", id)
          .order("points", { ascending: false });

        if (sData) setSignals(sData as RiskSignal[]);
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
        <p className="text-xs text-secondary-color">Loading company assessment...</p>
      </div>
    );
  }

  if (error || !verification) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-5">
        <Link
          href="/dashboard/companies"
          className="inline-flex items-center gap-1.5 text-xs text-secondary-color hover:text-primary-color transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.8} />
          <span>Back to company verification</span>
        </Link>

        <div className="p-8 rounded-2xl bg-card border border-subtle text-center space-y-4 shadow-card">
          <AlertCircle className="w-10 h-10 text-warning-color mx-auto" strokeWidth={1.5} />
          <div className="space-y-1">
            <h2 className="text-base font-medium text-primary-color">Assessment not found</h2>
            <p className="text-xs text-secondary-color max-w-sm mx-auto">
              {error || "The requested company verification is unavailable or was removed."}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard/companies"
              className="inline-flex items-center gap-2 bg-accent-primary bg-accent-hover text-white px-5 py-2.5 rounded-xl text-xs font-medium transition-all shadow-soft btn-interaction"
            >
              <Building2 className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Verify a company</span>
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

  const meta = verification.metadata;
  const coverageLevel: VerificationCoverage = meta?.coverage || "low";
  const coverageSummary =
    meta?.coverageSummary ||
    "Verification evidence is limited. Independently verify this company before proceeding.";

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16 animate-in fade-in duration-200">
      {/* 1. Header */}
      <div>
        <Link
          href="/dashboard/companies"
          className="inline-flex items-center gap-1.5 text-xs text-secondary-color hover:text-primary-color transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.8} />
          <span>Back to company verification</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wider text-tertiary-color block">
              Company verification
            </span>
            <h1 className="text-2xl font-medium text-primary-color tracking-tight">
              {verification.company_name || "Company assessment"}
            </h1>
            {meta?.hostname && (
              <div className="flex items-center gap-1.5 text-xs text-tertiary-color font-mono pt-1">
                <Globe className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
                <span className="truncate max-w-sm">{meta.hostname}</span>
              </div>
            )}
            {verification.url && (
              <div className="flex items-center gap-1.5 text-xs text-tertiary-color font-mono">
                <Globe className="w-3 h-3 shrink-0 opacity-0" strokeWidth={1.8} />
                <span className="truncate max-w-sm opacity-70">{verification.url}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-tertiary-color bg-muted-custom border border-subtle px-3 py-1.5 rounded-xl shrink-0">
            <Calendar className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* 2. Risk Score */}
      <div className="bg-card border border-subtle rounded-2xl p-8 sm:p-10 shadow-card text-center space-y-6">
        <RiskScore score={verification.risk_score} level={verification.risk_level} />
        <RiskSummary summary={verification.summary} />
      </div>

      {/* 3. Verification Coverage */}
      <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-7 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-accent-primary" strokeWidth={2} />
            <span className="text-xs uppercase tracking-wider font-medium text-secondary-color">
              Verification coverage
            </span>
          </div>
          <CoverageChip level={coverageLevel} />
        </div>
        <p className="text-xs sm:text-sm text-secondary-color leading-relaxed font-normal">
          {coverageSummary}
        </p>
      </div>

      {/* 4. Company Website Analysis */}
      {meta && (
        <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-7 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-primary-color">What we found</h2>
            {meta.rootDomain && (
              <span className="text-[11px] text-tertiary-color font-mono">{meta.rootDomain}</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <EvidenceItem
              present={meta.websiteReachable}
              trueLabel="Website reachable"
              falseLabel="Website could not be reached"
              state={meta.websiteReachable ? "positive" : "warning"}
            />

            <EvidenceItem
              present={meta.https}
              trueLabel="HTTPS enabled"
              falseLabel="Unencrypted HTTP connection"
              state={meta.https ? "positive" : "warning"}
            />

            {meta.companyNameMatch === "true" && (
              <EvidenceItem
                state="positive"
                trueLabel="Company identity appears consistent"
                present={true}
              />
            )}
            {meta.companyNameMatch === "false" && (
              <EvidenceItem
                state="warning"
                trueLabel="Company name mismatch detected"
                present={false}
              />
            )}
            {meta.companyNameMatch === "unknown" && (
              <EvidenceItem
                state="neutral"
                trueLabel="Company identity could not be confirmed"
                present={undefined}
              />
            )}

            <EvidenceItem
              present={meta.aboutPresent}
              trueLabel="Company information detected"
              unknownLabel="No company/about section found"
              state={meta.aboutPresent ? "positive" : "neutral"}
            />

            <EvidenceItem
              present={meta.careersPresent}
              trueLabel="Careers / jobs information detected"
              unknownLabel="No careers section found"
              state={meta.careersPresent ? "positive" : "neutral"}
            />

            <EvidenceItem
              present={meta.contactPresent}
              trueLabel="Contact information present"
              unknownLabel="No contact section found"
              state={meta.contactPresent ? "positive" : "neutral"}
            />

            <EvidenceItem
              present={meta.socialLinksFound}
              trueLabel="Social / professional links found"
              unknownLabel="No social profile links detected"
              state={meta.socialLinksFound ? "positive" : "neutral"}
            />

            {meta.suppliedEmailDomainMatches === true && (
              <EvidenceItem
                state="positive"
                trueLabel="Company email domain matches website"
                present={true}
              />
            )}
            {meta.suppliedEmailDomainMatches === false && (
              <EvidenceItem
                state="warning"
                trueLabel="Company email domain mismatch"
                present={false}
              />
            )}

            {meta.opportunityDomainMatches === true && (
              <EvidenceItem
                state="positive"
                trueLabel="Opportunity domain consistent with company"
                present={true}
              />
            )}
            {meta.opportunityDomainMatches === false && meta.opportunityIsKnownPlatform && (
              <EvidenceItem
                state="positive"
                trueLabel={`Opportunity posted on ${meta.opportunityPlatformName || "known job platform"}`}
                present={true}
              />
            )}
            {meta.opportunityDomainMatches === false && !meta.opportunityIsKnownPlatform && (
              <EvidenceItem
                state="warning"
                trueLabel="Opportunity domain differs from company domain"
                present={false}
              />
            )}
          </div>

          {meta.analysisLimitation && (
            <p className="text-[11px] text-tertiary-color border-t border-subtle pt-3">
              Note: {meta.analysisLimitation}
            </p>
          )}
        </div>
      )}

      {/* 5. Warning Signals */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-medium text-primary-color">
            {signals.length > 0 ? "Potential concerns" : "Evaluated signals"}
          </h2>
          <p className="text-xs text-secondary-color mt-0.5">
            {signals.length > 0
              ? `${signals.length} warning signal${signals.length > 1 ? "s" : ""} detected`
              : "No warning signals were detected from the available information"}
          </p>
        </div>

        <div className="bg-card border border-subtle rounded-2xl shadow-soft divide-y divide-subtle overflow-hidden">
          {signals.length > 0 ? (
            signals.map((sig) => (
              <RiskSignalCard key={sig.id || sig.title} signal={sig} />
            ))
          ) : (
            <div className="p-6 text-center text-xs text-secondary-color">
              <Shield className="w-5 h-5 text-accent-primary mx-auto mb-2" strokeWidth={1.8} />
              <span>No significant warning signals were detected from the information provided.</span>
            </div>
          )}
        </div>
      </div>

      {/* 6. Recommendations */}
      <div className="bg-card border border-subtle rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
        <div>
          <h2 className="text-base font-medium text-primary-color">What you should do next</h2>
          <p className="text-xs text-secondary-color mt-0.5">
            Recommended verification steps before proceeding
          </p>
        </div>

        <Recommendations recommendations={verification.recommendations} />

        <div className="pt-4 border-t border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/dashboard/companies"
            className="w-full sm:w-auto bg-accent-primary bg-accent-hover text-white px-6 py-3 rounded-xl text-sm font-medium transition-all text-center shadow-soft btn-interaction flex items-center justify-center gap-2"
          >
            <Building2 className="w-4 h-4" strokeWidth={2} />
            <span>Verify another company</span>
          </Link>

          <Link
            href="/dashboard/history"
            className="w-full sm:w-auto border border-subtle bg-card hover:bg-muted-custom text-primary-color px-5 py-3 rounded-xl text-sm font-medium transition-colors text-center"
          >
            View all history
          </Link>
        </div>
      </div>

      {/* 7. Legal disclaimer */}
      <div className="p-4 rounded-xl bg-muted-custom border border-subtle text-center">
        <p className="text-[11px] text-tertiary-color leading-relaxed font-normal">
          ScamCheck provides an automated assessment based on publicly available signals. High verification coverage does not guarantee that a company is legitimate, and low coverage does not confirm fraudulent intent. Always verify independently before sharing personal information or accepting an offer.
        </p>
      </div>
    </div>
  );
}
