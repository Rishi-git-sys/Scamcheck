import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runCompanyVerification } from "@/lib/company-intelligence/run-verification";

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
  try {
    // 1. Authenticate
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to verify a company." },
        { status: 401 }
      );
    }

    // 2. Rate limit
    if (isRateLimited(user.id)) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please wait a minute before verifying another company." },
        { status: 429 }
      );
    }

    // 3. Parse request
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { companyName, companyWebsite, companyEmail, opportunityUrl } = body;

    if (!companyName || typeof companyName !== "string" || !companyName.trim()) {
      return NextResponse.json(
        { success: false, error: "Company name is required." },
        { status: 400 }
      );
    }

    if (!companyWebsite || typeof companyWebsite !== "string" || !companyWebsite.trim()) {
      return NextResponse.json(
        { success: false, error: "Company website is required." },
        { status: 400 }
      );
    }

    // 4. Run company verification (server-side only)
    const result = await runCompanyVerification({
      companyName: companyName.trim(),
      companyWebsite: companyWebsite.trim(),
      companyEmail: companyEmail?.trim() || undefined,
      opportunityUrl: opportunityUrl?.trim() || undefined,
    });

    // 5. Save to Supabase verifications table
    const { data: verificationData, error: insertError } = await supabase
      .from("verifications")
      .insert({
        user_id: user.id,
        input_type: "company",
        url: result.intelligence.originalUrl,
        company_name: companyName.trim(),
        job_title: null,
        recruiter_email: companyEmail?.trim() || null,
        salary_text: null,
        contact_method: null,
        payment_requested: null,
        job_description: null,
        risk_score: result.analysis.score,
        risk_level: result.analysis.level,
        summary: result.analysis.summary,
        recommendations: result.analysis.recommendations,
        metadata: {
          verificationType: "company",
          ...result.intelligence,
        },
      })
      .select("id")
      .single();

    if (insertError || !verificationData) {
      return NextResponse.json(
        { success: false, error: "Unable to save the verification result. Please try again." },
        { status: 500 }
      );
    }

    const verificationId = verificationData.id;

    // 6. Save risk signals
    if (result.signals.length > 0) {
      await supabase.from("risk_signals").insert(
        result.signals.map((sig) => ({
          verification_id: verificationId,
          title: sig.title,
          description: sig.description,
          severity: sig.severity,
          points: sig.points,
        }))
      );
    }

    return NextResponse.json({
      success: true,
      verificationId,
      intelligence: result.intelligence,
      analysis: result.analysis,
    });
  } catch (error: any) {
    const message =
      typeof error?.message === "string" && error.message.length < 200
        ? error.message
        : "Unable to verify the company at this time.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
