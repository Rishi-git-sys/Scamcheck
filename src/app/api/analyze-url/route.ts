import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeUrl } from "@/lib/url-intelligence/analyze-url";

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

    return NextResponse.json({
      success: true,
      intelligence: result.intelligence,
      analysis: result.analysis,
    });
  } catch (error: any) {
    const message =
      typeof error?.message === "string" && error.message.length < 150
        ? error.message
        : "Unable to analyze the submitted URL.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}
