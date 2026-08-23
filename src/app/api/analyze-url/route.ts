import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeUrl } from "@/lib/url-intelligence/analyze-url";
import { verifyRecruiter } from "@/lib/recruiter-verification/analyzer";
import { analyzeContentIntelligence } from "@/lib/content-intelligence/analyzer";
import { checkDomainThreatIntelligence } from "@/lib/threat-intel";
import { analyzeOpportunityWithAI } from "@/lib/ai/analyze";
import { analyzeOpportunity } from "@/lib/risk-engine/analyzer";

// In-memory per-user rate limiter (10 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(userId);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count += 1;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user with Supabase Server Client
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to analyze opportunity URLs." },
        { status: 401 }
      );
    }

    // 2. Enforce per-user rate limit
    if (isRateLimited(user.id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please wait a minute before analyzing another URL.",
        },
        { status: 429 }
      );
    }

    // 3. Parse and validate JSON payload
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const { url } = body;
    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid URL." },
        { status: 400 }
      );
    }

    // 4. Perform Server-Side URL Intelligence Analysis
    const result = await analyzeUrl(url.trim());
    const { intelligence, analysis: baseAnalysis } = result;

    // Phase 10: Recruiter Verification for discovered URL email
    const recruiterResult = verifyRecruiter({
      recruiterEmail: intelligence.emails[0],
      companyWebsite: intelligence.originalUrl,
      opportunityUrl: intelligence.originalUrl,
    });

    // Phase 11: Content Intelligence for fetched page text
    const pageText = [intelligence.pageTitle, intelligence.metaDescription].filter(Boolean).join(" ");
    const contentResult = analyzeContentIntelligence(pageText);

    // Phase 13: Threat Intelligence for URL domain
    const threatIntelResult = await checkDomainThreatIntelligence(intelligence.originalUrl);

    // Merge signals through unified risk engine
    const combinedExtraSignals = [
      ...recruiterResult.signals,
      ...contentResult.signals,
      ...(threatIntelResult.signals || []),
    ];
    const analysis = analyzeOpportunity(
      {
        inputType: "url",
        url: intelligence.originalUrl,
        companyName: intelligence.pageTitle || intelligence.rootDomain || undefined,
        jobTitle: intelligence.jobRelated ? "Web opportunity listing" : undefined,
        recruiterEmail: intelligence.emails[0] || undefined,
        jobDescription: intelligence.metaDescription || undefined,
      },
      combinedExtraSignals
    );

    // Phase 12: AI Analysis for URL opportunity
    const aiResult = await analyzeOpportunityWithAI({
      companyName: intelligence.pageTitle || intelligence.rootDomain || undefined,
      jobTitle: intelligence.jobRelated ? "Web opportunity listing" : undefined,
      recruiterEmail: intelligence.emails[0] || undefined,
      paymentRequested: contentResult.paymentRequested,
      paymentAmount: contentResult.paymentAmount,
      urgencyDetected: contentResult.urgencyDetected,
      sensitiveInfoRequested: contentResult.sensitiveInfoRequested,
      financialInfoRequested: contentResult.financialInfoRequested,
      officialApplicationEvidence: contentResult.officialApplicationEvidence,
      detectedUrls: [intelligence.originalUrl],
      deterministicLevel: analysis.level,
      deterministicSignals: analysis.signals.map((s) => s.title),
      content: pageText,
    });

    // 5. Persist to Supabase (server-side — authenticated user, correct credentials)
    const { data: verificationData, error: insertError } = await supabase
      .from("verifications")
      .insert({
        user_id: user.id,
        input_type: "url",
        url: intelligence.originalUrl,
        company_name: intelligence.pageTitle || intelligence.rootDomain || null,
        job_title: intelligence.jobRelated ? "Web opportunity listing" : null,
        recruiter_email: intelligence.emails[0] || null,
        salary_text: null,
        contact_method: null,
        payment_requested: contentResult.paymentRequested ? true : null,
        job_description: intelligence.metaDescription || null,
        risk_score: analysis.score,
        risk_level: analysis.level,
        summary: analysis.summary,
        recommendations: analysis.recommendations,
        metadata: {
          originalUrl: intelligence.originalUrl,
          finalUrl: intelligence.finalUrl,
          hostname: intelligence.hostname,
          rootDomain: intelligence.rootDomain,
          protocol: intelligence.protocol,
          redirectCount: intelligence.redirectCount,
          redirectHosts: intelligence.redirectHosts,
          https: intelligence.https,
          pageTitle: intelligence.pageTitle,
          metaDescription: intelligence.metaDescription,
          jobRelated: intelligence.jobRelated,
          isSpecificJobListing: intelligence.isSpecificJobListing,
          coverage: intelligence.coverage,
          coverageLabel: intelligence.coverageLabel,
          coverageSummary: intelligence.coverageSummary,
          emails: intelligence.emails,
          emailDomainMatchesSite: intelligence.emailDomainMatchesSite,
          hasSensitiveFormFields: intelligence.hasSensitiveFormFields,
          analysisLimitation: intelligence.analysisLimitation,
          recruiterVerification: {
            status: recruiterResult.status,
            recruiterName: recruiterResult.recruiterName || null,
            recruiterEmail: recruiterResult.recruiterEmail || null,
            emailDomain: recruiterResult.emailDomain || null,
            domainMatch: recruiterResult.domainMatch ?? null,
            publicProvider: recruiterResult.publicProvider ?? null,
            reasons: recruiterResult.reasons || [],
          },
          contentIntelligence: {
            paymentRequested: contentResult.paymentRequested,
            paymentAmount: contentResult.paymentAmount || null,
            sensitiveInfoRequested: contentResult.sensitiveInfoRequested,
            financialInfoRequested: contentResult.financialInfoRequested,
            urgencyDetected: contentResult.urgencyDetected,
            unrealisticCompensation: contentResult.unrealisticCompensation,
            guaranteedEmployment: contentResult.guaranteedEmployment,
            informalContact: contentResult.informalContact || null,
            officialApplicationEvidence: contentResult.officialApplicationEvidence,
            categories: contentResult.categories,
            detectedPhrases: contentResult.detectedPhrases,
          },
          aiAnalysis: aiResult,
          threatIntelligence: {
            status: threatIntelResult.status,
            source: threatIntelResult.source,
            hostname: threatIntelResult.hostname,
            rootDomain: threatIntelResult.rootDomain,
            domainAgeYears: threatIntelResult.domainAgeYears ?? null,
            creationDate: threatIntelResult.creationDate ?? null,
            isRecentlyRegistered: threatIntelResult.isRecentlyRegistered ?? false,
            checkedAt: threatIntelResult.checkedAt,
            reasons: threatIntelResult.reasons,
          },
        },
      })
      .select("id")
      .single();

    if (insertError || !verificationData) {
      // Log full error server-side for debugging
      console.error("[analyze-url] Supabase insert error:", {
        message: insertError?.message,
        code: insertError?.code,
        details: insertError?.details,
        hint: insertError?.hint,
      });
      return NextResponse.json(
        { success: false, error: "Unable to save the verification result. Please try again." },
        { status: 500 }
      );
    }

    const verificationId = verificationData.id;

    // 6. Persist risk signals (only non-informational signals with points > 0 stored)
    const signalsToStore = analysis.signals.filter((s) => !s.isInformational);
    if (signalsToStore.length > 0) {
      const signalRows = signalsToStore.map((sig) => ({
        verification_id: verificationId,
        title: sig.title,
        description: sig.description,
        severity: sig.severity,
        points: sig.points,
      }));

      const { error: signalError } = await supabase.from("risk_signals").insert(signalRows);
      if (signalError) {
        console.error("[analyze-url] Supabase signal insert error:", {
          message: signalError?.message,
          code: signalError?.code,
          details: signalError?.details,
          hint: signalError?.hint,
        });
        // Non-fatal: verification was saved, signals failed — still redirect
      }
    }

    return NextResponse.json({
      success: true,
      verificationId,
      intelligence,
      analysis,
    });
  } catch (error: any) {
    const message =
      typeof error?.message === "string" && error.message.length < 150
        ? error.message
        : "Unable to analyze the submitted URL.";

    console.error("[analyze-url] Unexpected error:", error?.message);

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}
