import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { sanitizeUntrustedInput } from "@/lib/security/sanitize";
import { callAIWithJsonOutput } from "@/lib/ai/provider";
import { RESUME_TAILOR_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import {
  TailorResumePayloadSchema,
  JobDescriptionAnalysisSchema,
  ParsedCVSchema,
  ResumeChangeSummarySchema,
} from "@/lib/validation/resume-schema";
import type { TailoredResumeResult } from "@/types/resume";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limit
    const ip = req.headers.get("x-forwarded-for") || "local-client";
    const limit = checkRateLimit(ip, 20, 60000);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many tailoring requests. Please wait a moment." },
        { status: 429 }
      );
    }

    // 2. Parse and validate JSON payload
    const body = await req.json();
    const parseResult = TailorResumePayloadSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request payload.",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { parsedCV, jobDescription, targetJobTitle, companyName } = parseResult.data;

    // 3. Build sanitized prompt payload (strip rawText to minimize token latency and speed up completion)
    const { rawText: _, ...cleanCvForAI } = parsedCV;
    const sanitizedJD = sanitizeUntrustedInput(
      jobDescription.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim(),
      10000
    );
    const userPromptPayload = {
      targetJobTitle: targetJobTitle || "Not specified",
      companyName: companyName || "Not specified",
      jobDescription: sanitizedJD,
      candidateCV: cleanCvForAI,
    };

    // 4. Execute AI tailoring with optimized token limits
    const result = await callAIWithJsonOutput<TailoredResumeResult>({
      systemPrompt: RESUME_TAILOR_SYSTEM_PROMPT,
      userPrompt: `Target Job Context and Candidate Data:\n\n${JSON.stringify(userPromptPayload)}`,
      temperature: 0.2,
      maxTokens: 3500,
    });

    // 5. Schema validation of AI output
    const analysisValid = JobDescriptionAnalysisSchema.safeParse(result.analysis);
    const cvValid = ParsedCVSchema.safeParse(result.tailoredCV);
    const summaryValid = ResumeChangeSummarySchema.safeParse(result.changeSummary);

    const safeAnalysis = analysisValid.success ? analysisValid.data : result.analysis;
    const safeCV = cvValid.success ? cvValid.data : result.tailoredCV;
    const safeSummary = summaryValid.success ? summaryValid.data : result.changeSummary;

    return NextResponse.json({
      success: true,
      data: {
        analysis: safeAnalysis,
        tailoredCV: safeCV,
        changeSummary: safeSummary,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to tailor resume.";
    console.error("[API Tailor Error]:", err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
