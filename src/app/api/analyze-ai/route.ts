import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeOpportunityWithAI } from "@/lib/ai/analyze";
import { AIAnalysisInput } from "@/lib/ai/types";

// In-memory per-user rate limiter (10 AI requests per minute)
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
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    // 2. Rate limit
    if (isRateLimited(user.id)) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please wait a moment before requesting AI analysis again." },
        { status: 429 }
      );
    }

    // 3. Parse payload
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { verificationId, input } = body;

    const aiInput: AIAnalysisInput = input || {};

    // 4. Execute AI analysis (with built-in redaction and fallback)
    const aiResult = await analyzeOpportunityWithAI(aiInput);

    // 5. If verificationId is provided, persist aiAnalysis into Supabase metadata
    if (verificationId && typeof verificationId === "string") {
      const { data: existingRecord } = await supabase
        .from("verifications")
        .select("metadata")
        .eq("id", verificationId)
        .eq("user_id", user.id)
        .single();

      if (existingRecord) {
        const updatedMetadata = {
          ...(existingRecord.metadata || {}),
          aiAnalysis: aiResult,
        };

        await supabase
          .from("verifications")
          .update({ metadata: updatedMetadata })
          .eq("id", verificationId)
          .eq("user_id", user.id);
      }
    }

    return NextResponse.json({
      success: true,
      aiAnalysis: aiResult,
    });
  } catch (err: any) {
    console.error("[analyze-ai] Server error:", err?.message);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred during AI analysis.",
        fallback: {
          status: "unavailable",
          summary: "AI analysis is currently unavailable.",
        },
      },
      { status: 500 }
    );
  }
}
