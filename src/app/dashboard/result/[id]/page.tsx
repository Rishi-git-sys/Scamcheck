"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  History,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { buildScamCheckReport } from "@/lib/report/buildReport";
import { ScamCheckReport } from "@/lib/report/types";

// Unified Report Components
import RiskHeader from "@/components/report/RiskHeader";
import RiskBreakdown from "@/components/report/RiskBreakdown";
import EntityConsistencySection from "@/components/report/EntityConsistencySection";
import WarningSignalsSection from "@/components/report/WarningSignalsSection";
import EvidenceAnalyzedSection from "@/components/report/EvidenceAnalyzedSection";
import CompanyReportSection from "@/components/report/CompanyReportSection";
import RecruiterReportSection from "@/components/report/RecruiterReportSection";
import ContentAnalysisSection from "@/components/report/ContentAnalysisSection";
import ThreatIntelSection from "@/components/report/ThreatIntelSection";
import AIExplanationSection from "@/components/report/AIExplanationSection";
import ActionRecommendations from "@/components/report/ActionRecommendations";

export default function ResultDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [report, setReport] = useState<ScamCheckReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVerification() {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        // 1. Fetch verification record
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

        // 2. Fetch associated risk signals
        const { data: sData } = await supabase
          .from("risk_signals")
          .select("*")
          .eq("verification_id", id)
          .order("points", { ascending: false });

        // 3. Build normalized ScamCheckReport
        const builtReport = buildScamCheckReport({
          ...vData,
          risk_signals: sData || [],
        });

        setReport(builtReport);
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
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <div className="w-9 h-9 mx-auto rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
        <p className="text-xs text-secondary-color font-medium">
          Loading unified verification report...
        </p>
      </div>
    );
  }

  if (error || !report) {
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

          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/dashboard/check"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-background text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Verify another opportunity</span>
            </Link>
            <Link
              href="/dashboard/history"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-subtle bg-background hover:bg-muted-custom text-xs font-medium text-secondary-color hover:text-primary-color transition-colors"
            >
              <History className="w-3.5 h-3.5" strokeWidth={2} />
              <span>View history</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-7 pb-16 animate-in fade-in">
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-secondary-color hover:text-primary-color transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.8} />
          <span>Back to dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/check"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-subtle bg-background hover:bg-muted-custom text-xs font-medium text-secondary-color hover:text-primary-color transition-colors"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.2} />
            <span>New Check</span>
          </Link>
          <Link
            href="/dashboard/history"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-subtle bg-background hover:bg-muted-custom text-xs font-medium text-secondary-color hover:text-primary-color transition-colors"
          >
            <History className="w-3.5 h-3.5" strokeWidth={2} />
            <span>History</span>
          </Link>
        </div>
      </div>

      {/* 1. SCAMCHECK ASSESSMENT (Risk Score, Level, Confidence, Summary, Share & Print) */}
      <RiskHeader report={report} />

      {/* 2. EXPLAINABLE RISK BREAKDOWN (Contributors, Points, Severity, Sources) */}
      <RiskBreakdown
        signals={report.signals}
        riskScore={report.riskScore}
        riskLevel={report.riskLevel}
      />

      {/* 3. KEY WARNING SIGNALS */}
      {report.signals.length > 0 && <WarningSignalsSection signals={report.signals} />}

      {/* 4. EVIDENCE ANALYZED (Collapsible structured fields) */}
      <EvidenceAnalyzedSection evidence={report.evidence} />

      {/* 5. CROSS-ENTITY CONSISTENCY GRAPH */}
      {report.entityConsistency && report.entityConsistency.length > 0 && (
        <EntityConsistencySection entities={report.entityConsistency} />
      )}

      {/* 6. COMPANY VERIFICATION LAYER (Phase 7) */}
      {report.company && <CompanyReportSection company={report.company} />}

      {/* 7. RECRUITER VERIFICATION LAYER (Phase 10) */}
      {report.recruiter && <RecruiterReportSection recruiter={report.recruiter} />}

      {/* 8. CONTENT INTELLIGENCE LAYER (Phase 11) */}
      {report.content && <ContentAnalysisSection content={report.content} />}

      {/* 9. THREAT INTELLIGENCE LAYER (Phase 13) */}
      {report.threatIntelligence && <ThreatIntelSection threatIntel={report.threatIntelligence} />}

      {/* 10. AI-ASSISTED CONTEXTUAL EXPLANATION (Phase 12) */}
      {report.aiAnalysis && (
        <AIExplanationSection
          aiReport={report.aiAnalysis}
          positiveEvidence={report.positiveEvidence}
          missingEvidence={report.missingEvidence}
        />
      )}

      {/* 11. WHAT YOU SHOULD DO (Action Recommendations) */}
      <ActionRecommendations recommendations={report.recommendations} />
    </div>
  );
}
