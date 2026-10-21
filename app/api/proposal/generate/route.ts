import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { sanitizeUntrustedInput } from "@/lib/security/sanitize";
import { callAIWithJsonOutput } from "@/lib/ai/provider";
import {
  PROPOSAL_AGENCY_SYSTEM_PROMPT,
  PROPOSAL_INDIVIDUAL_SYSTEM_PROMPT,
  PROPOSAL_OUTPUT_SCHEMA_PROMPT,
} from "@/lib/ai/prompts";
import { ProposalInputSchema, ProposalOutputSchema } from "@/lib/validation/proposal-schema";
import type { ProposalOutput } from "@/types/proposal";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local-client";
    const limit = checkRateLimit(ip, 20, 60000);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many proposal generation requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parseResult = ProposalInputSchema.safeParse(body.input || body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid proposal input.",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const input = parseResult.data;

    // Select system prompt strategy based on applicantType
    const systemPromptBase =
      input.applicantType === "agency"
        ? PROPOSAL_AGENCY_SYSTEM_PROMPT
        : PROPOSAL_INDIVIDUAL_SYSTEM_PROMPT;

    const fullSystemPrompt = `${systemPromptBase}\n\n${PROPOSAL_OUTPUT_SCHEMA_PROMPT}`;

    // Sanitize user inputs and compact whitespace for rapid token generation
    const compactedReq = input.projectRequirements.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
    const sanitizedRequirements = sanitizeUntrustedInput(compactedReq, 12000);
    const sanitizedAdditional = sanitizeUntrustedInput(input.additionalInstructions || "", 3000);

    const userPromptPayload = {
      projectRequirements: sanitizedRequirements,
      applicantType: input.applicantType,
      projectTitle: input.projectTitle || "",
      clientName: input.clientName || "",
      industry: input.industry || "",
      applicantName: input.applicantName || "",
      teamDetails: input.teamDetails || "",
      relevantExperience: input.relevantExperience || "",
      portfolioUrls: input.portfolioUrls || [],
      skillsOrServices: input.skillsOrServices || [],
      proposedSolutionSummary: input.proposedSolutionSummary || "",
      projectTimeline: input.projectTimeline || "",
      pricingOrBudget: input.pricingOrBudget || "",
      tone: input.tone || "professional",
      additionalInstructions: sanitizedAdditional,
    };

    const generatedProposal = await callAIWithJsonOutput<ProposalOutput>({
      systemPrompt: fullSystemPrompt,
      userPrompt: `Generate a proposal for the following parameters:\n\n${JSON.stringify(userPromptPayload)}`,
      temperature: 0.3,
      maxTokens: 3500,
    });

    // Validate structured output
    const validatedResult = ProposalOutputSchema.safeParse(generatedProposal);
    const safeProposal = validatedResult.success ? validatedResult.data : generatedProposal;

    // Ensure applicantType matches what was requested
    safeProposal.applicantType = input.applicantType;

    return NextResponse.json({
      success: true,
      data: {
        proposal: safeProposal,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to generate proposal.";
    console.error("[API Proposal Generate Error]:", err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
