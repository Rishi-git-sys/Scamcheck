import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractEvidenceFromText } from "@/lib/evidence/extract";
import { normalizeEvidenceToInput } from "@/lib/evidence/normalize";
import { analyzeOpportunity } from "@/lib/risk-engine/analyzer";
import { verifyRecruiter } from "@/lib/recruiter-verification/analyzer";
import { analyzeContentIntelligence } from "@/lib/content-intelligence/analyzer";
import { checkDomainThreatIntelligence } from "@/lib/threat-intel";
import { analyzeOpportunityWithAI } from "@/lib/ai/analyze";
import { performServerOcr, getErrorMessage, validateImageBuffer } from "@/lib/evidence/server-ocr";

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
  if (record.count >= MAX_REQUESTS_PER_WINDOW) return true;
  record.count += 1;
  return false;
}

export async function POST(request: NextRequest) {
  console.log("[OCR-DEBUG-01] analysis function entered");

  try {
    // 1. Authenticate
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[OCR-DEBUG] authentication required");
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    // 2. Rate limit
    if (isRateLimited(user.id)) {
      console.warn("[OCR-DEBUG] rate limit exceeded");
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please wait a minute before submitting again." },
        { status: 429 }
      );
    }

    let textToAnalyze = "";
    let resolvedSourceType: "text" | "screenshot" = "text";
    let numericOcrConfidence: number | undefined = undefined;

    const contentType = request.headers.get("content-type") || "";

    // 3. Handle Multipart Form Data or JSON Payload
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const additionalContext = (formData.get("additionalContext") as string) || "";
      resolvedSourceType = "screenshot";

      if (!file) {
        return NextResponse.json(
          { success: false, error: "Please select an image file to upload." },
          { status: 400 }
        );
      }

      console.log("[OCR-DEBUG-02] image received");

      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: "Image is too large. Please upload a smaller screenshot under 5 MB." },
          { status: 400 }
        );
      }

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const validation = validateImageBuffer(fileBuffer);
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, error: validation.error || "This image format isn't supported." },
          { status: 400 }
        );
      }

      console.log("[OCR-DEBUG-03] image validation complete");
      console.log("[OCR-DEBUG-04] before OCR call");

      const ocrResult = await performServerOcr(fileBuffer, file.type);

      console.log("[OCR-DEBUG-05] after OCR call");
      console.log("[OCR-DEBUG-06] before OCR response parsing");

      if (ocrResult.status === "timeout") {
        return NextResponse.json(
          {
            success: false,
            status: "timeout",
            error: "Screenshot analysis timed out. Please try again or paste the text manually.",
          },
          { status: 504 }
        );
      }

      if (ocrResult.status === "ocr_error") {
        return NextResponse.json(
          {
            success: false,
            status: "ocr_error",
            error: ocrResult.message || "Screenshot uploaded, but analysis failed. You can paste the text manually or try again.",
          },
          { status: 400 }
        );
      }

      if (ocrResult.status === "low_text") {
        return NextResponse.json(
          {
            success: false,
            status: "low_text",
            extractedText: ocrResult.extractedText,
            error: "We couldn't read enough text from this screenshot. Please paste or edit the text below.",
          },
          { status: 200 }
        );
      }

      console.log("[OCR-DEBUG-07] after OCR response parsing");

      textToAnalyze = ocrResult.extractedText;
      if (additionalContext.trim()) {
        textToAnalyze += `\n\n[Additional Context provided by applicant: ${additionalContext.trim()}]`;
      }
      numericOcrConfidence = ocrResult.confidence;
    } else {
      // 4. Handle JSON Payload
      let body: any;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid request payload." },
          { status: 400 }
        );
      }

      // Base64 screenshot payload
      if (body.imageBase64 && typeof body.imageBase64 === "string") {
        resolvedSourceType = "screenshot";
        console.log("[OCR-DEBUG-02] image received");

        const buffer = Buffer.from(body.imageBase64, "base64");

        if (buffer.length > 5 * 1024 * 1024) {
          return NextResponse.json(
            { success: false, error: "Image is too large. Please upload a smaller screenshot under 5 MB." },
            { status: 400 }
          );
        }

        const validation = validateImageBuffer(buffer);
        if (!validation.valid) {
          return NextResponse.json(
            { success: false, error: validation.error || "This image format isn't supported." },
            { status: 400 }
          );
        }

        console.log("[OCR-DEBUG-03] image validation complete");
        console.log("[OCR-DEBUG-04] before OCR call");

        const ocrResult = await performServerOcr(buffer, body.mimeType);

        console.log("[OCR-DEBUG-05] after OCR call");
        console.log("[OCR-DEBUG-06] before OCR response parsing");

        if (ocrResult.status === "timeout") {
          return NextResponse.json(
            {
              success: false,
              status: "timeout",
              error: "Screenshot analysis timed out. Please try again or paste the text manually.",
            },
            { status: 504 }
          );
        }

        if (ocrResult.status === "ocr_error") {
          return NextResponse.json(
            {
              success: false,
              status: "ocr_error",
              error: ocrResult.message || "Screenshot uploaded, but analysis failed. You can paste the text manually or try again.",
            },
            { status: 400 }
          );
        }

        if (ocrResult.status === "low_text") {
          return NextResponse.json(
            {
              success: false,
              status: "low_text",
              extractedText: ocrResult.extractedText,
              error: "We couldn't read enough text from this screenshot. Please paste or edit the text below.",
            },
            { status: 200 }
          );
        }

        console.log("[OCR-DEBUG-07] after OCR response parsing");

        textToAnalyze = ocrResult.extractedText;
        if (body.additionalContext && typeof body.additionalContext === "string" && body.additionalContext.trim()) {
          textToAnalyze += `\n\n[Additional Context provided by applicant: ${body.additionalContext.trim()}]`;
        }
        numericOcrConfidence = ocrResult.confidence;
      } else {
        // Raw text payload
        const { text, sourceType, ocrConfidence } = body;
        if (!text || typeof text !== "string" || !text.trim()) {
          return NextResponse.json(
            { success: false, error: "Please provide text content to analyze." },
            { status: 400 }
          );
        }

        textToAnalyze = text.trim();
        resolvedSourceType = sourceType === "screenshot" ? "screenshot" : "text";
        numericOcrConfidence = typeof ocrConfidence === "number" ? Math.round(ocrConfidence) : undefined;
      }
    }

    if (textToAnalyze.length > 100_000) {
      return NextResponse.json(
        { success: false, error: "Text payload exceeds the maximum allowed size (100 KB)." },
        { status: 400 }
      );
    }

    if (textToAnalyze.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Text is too short to analyze. Please provide more details." },
        { status: 400 }
      );
    }

    // 5. Extract evidence from text (with optional OCR confidence)
    console.log("[OCR-DEBUG-08] before entity extraction");
    const { evidence, notes } = extractEvidenceFromText(
      textToAnalyze.trim(),
      resolvedSourceType,
      numericOcrConfidence
    );
    console.log("[OCR-DEBUG-09] after entity extraction");

    // 6. Phase 10: Recruiter Verification Layer
    const recruiterResult = verifyRecruiter({
      recruiterName: evidence.recruiterName,
      recruiterEmail: evidence.recruiterEmail,
      phoneNumber: evidence.phoneNumber,
      contactMethod: evidence.contactMethod,
      companyName: evidence.companyName,
      opportunityUrl: evidence.detectedUrls?.[0],
    });

    // 7. Phase 11: Content Intelligence Layer
    const contentResult = analyzeContentIntelligence(textToAnalyze.trim());

    // 8. Phase 13: Threat Intelligence Layer (if detected URL present)
    let threatIntelResult: any = null;
    if (evidence.detectedUrls && evidence.detectedUrls.length > 0) {
      threatIntelResult = await checkDomainThreatIntelligence(evidence.detectedUrls[0]);
    }

    // 9. Combine extra signals into unified deterministic risk engine
    console.log("[OCR-DEBUG-10] before risk analysis");
    const combinedExtraSignals = [
      ...recruiterResult.signals,
      ...contentResult.signals,
      ...(threatIntelResult?.signals || []),
    ];

    const opportunityInput = normalizeEvidenceToInput({
      ...evidence,
      paymentRequested: contentResult.paymentRequested || evidence.paymentRequested,
      paymentAmount: contentResult.paymentAmount || evidence.paymentAmount,
    });

    const analysis = analyzeOpportunity(opportunityInput, combinedExtraSignals);
    console.log("[OCR-DEBUG-11] after risk analysis");

    // 10. Phase 12: AI Opportunity Analysis (server-side, redacted, non-blocking fallback)
    const aiResult = await analyzeOpportunityWithAI({
      companyName: evidence.companyName,
      jobTitle: evidence.jobTitle,
      recruiterEmail: evidence.recruiterEmail,
      recruiterName: evidence.recruiterName,
      contactMethod: evidence.contactMethod,
      paymentRequested: contentResult.paymentRequested || evidence.paymentRequested,
      paymentAmount: contentResult.paymentAmount || evidence.paymentAmount,
      urgencyDetected: contentResult.urgencyDetected,
      sensitiveInfoRequested: contentResult.sensitiveInfoRequested,
      financialInfoRequested: contentResult.financialInfoRequested,
      officialApplicationEvidence: contentResult.officialApplicationEvidence,
      detectedUrls: evidence.detectedUrls,
      deterministicLevel: analysis.level,
      deterministicSignals: analysis.signals.map((s) => s.title),
      content: textToAnalyze.trim(),
    });

    // 11. Determine coverage dynamically based on evidence consistency
    let coverage = evidence.evidenceQuality || "medium";
    if (recruiterResult.status === "consistent" || contentResult.officialApplicationEvidence) {
      coverage = "high";
    }

    // 12. Save to Supabase
    console.log("[OCR-DEBUG-12] before database save");
    const { data: verificationData, error: insertError } = await supabase
      .from("verifications")
      .insert({
        user_id: user.id,
        input_type: "evidence",
        url: evidence.detectedUrls?.[0] || null,
        company_name: evidence.companyName || null,
        job_title: evidence.jobTitle || null,
        recruiter_email: evidence.recruiterEmail || null,
        salary_text: evidence.salaryText || evidence.stipendText || null,
        contact_method: evidence.contactMethod || null,
        payment_requested: contentResult.paymentRequested || (evidence.paymentRequested ?? null),
        job_description: evidence.jobDescription ? evidence.jobDescription.slice(0, 500) : null,
        risk_score: analysis.score,
        risk_level: analysis.level,
        summary: analysis.summary,
        recommendations: analysis.recommendations || [],
        metadata: {
          verificationType: "evidence",
          sourceType: evidence.sourceType,
          evidenceType: evidence.evidenceType,
          evidenceQuality: coverage,
          ocrConfidence: evidence.ocrConfidence ?? null,
          companyName: evidence.companyName || null,
          jobTitle: evidence.jobTitle || null,
          recruiterEmail: evidence.recruiterEmail || null,
          recruiterName: evidence.recruiterName || null,
          phoneNumber: evidence.phoneNumber || null,
          telegramUsername: evidence.telegramUsername || null,
          salaryText: evidence.salaryText || null,
          stipendText: evidence.stipendText || null,
          paymentRequested: contentResult.paymentRequested || (evidence.paymentRequested ?? null),
          paymentAmount: contentResult.paymentAmount || evidence.paymentAmount || null,
          contactMethod: evidence.contactMethod || null,
          detectedUrls: evidence.detectedUrls || [],
          suspiciousPhrases: evidence.suspiciousPhrases || [],
          extractionConfidence: evidence.extractionConfidence || "low",
          extractionNotes: notes || [],
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
          threatIntelligence: threatIntelResult
            ? {
                status: threatIntelResult.status,
                source: threatIntelResult.source,
                hostname: threatIntelResult.hostname,
                rootDomain: threatIntelResult.rootDomain,
                domainAgeYears: threatIntelResult.domainAgeYears ?? null,
                creationDate: threatIntelResult.creationDate ?? null,
                isRecentlyRegistered: threatIntelResult.isRecentlyRegistered ?? false,
                checkedAt: threatIntelResult.checkedAt,
                reasons: threatIntelResult.reasons,
              }
            : null,
          coverage,
          coverageLabel: coverage === "high" ? "High Coverage" : "Evidence-based",
          coverageSummary: "Analysis combines deterministic verification, recruiter checks, content intelligence, and AI explanation.",
        },
      })
      .select("id")
      .single();

    if (insertError || !verificationData) {
      console.error("[OCR-DEBUG] Supabase insert error:", {
        message: insertError?.message,
        code: insertError?.code,
        details: insertError?.details,
        hint: insertError?.hint,
      });
      return NextResponse.json(
        { success: false, error: "Text was extracted, but we couldn't save the verification. Please try again." },
        { status: 500 }
      );
    }

    console.log("[OCR-DEBUG-13] after database save");
    const verificationId = verificationData.id;

    // 13. Save risk signals (non-informational only)
    const signalsToStore = analysis.signals.filter((s) => !s.isInformational);
    if (signalsToStore.length > 0) {
      const { error: signalError } = await supabase.from("risk_signals").insert(
        signalsToStore.map((sig) => ({
          verification_id: verificationId,
          title: sig.title,
          description: sig.description,
          severity: sig.severity,
          points: sig.points,
        }))
      );
      if (signalError) {
        console.error("[OCR-DEBUG] Signal insert non-fatal error:", signalError?.message);
      }
    }

    console.log("[OCR-DEBUG-14] returning response");
    return NextResponse.json({
      success: true,
      status: "processed",
      verificationId,
      evidence: {
        evidenceType: evidence.evidenceType,
        sourceType: evidence.sourceType,
        companyName: evidence.companyName,
        jobTitle: evidence.jobTitle,
        detectedUrls: evidence.detectedUrls,
        extractionConfidence: evidence.extractionConfidence,
      },
      analysis,
    });
  } catch (error: unknown) {
    const safeError = getErrorMessage(error);
    console.error("[OCR-DEBUG] error:", safeError);

    return NextResponse.json(
      {
        success: false,
        error: safeError.length < 150 ? safeError : "Unable to complete upload and analysis. Please try again.",
      },
      { status: 400 }
    );
  }
}
