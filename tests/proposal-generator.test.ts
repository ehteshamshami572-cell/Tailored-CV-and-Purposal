import { describe, it, expect } from "vitest";
import { ProposalInputSchema, ProposalOutputSchema } from "@/lib/validation/proposal-schema";
import { callAIWithJsonOutput } from "@/lib/ai/provider";
import {
  PROPOSAL_AGENCY_SYSTEM_PROMPT,
  PROPOSAL_INDIVIDUAL_SYSTEM_PROMPT,
  PROPOSAL_OUTPUT_SCHEMA_PROMPT,
} from "@/lib/ai/prompts";
import type { ProposalOutput } from "@/types/proposal";

describe("Proposal Generator Workflow & Strategy Tests", () => {
  it("validates valid proposal input with only required fields", () => {
    const input = {
      applicantType: "agency",
      projectRequirements: "We need an end-to-end B2B SaaS dashboard built with Next.js and PostgreSQL.",
    };
    const result = ProposalInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects invalid applicantType", () => {
    const input = {
      applicantType: "invalid-type",
      projectRequirements: "Build our application.",
    };
    const result = ProposalInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("generates Agency-positioned proposal with team deliverables and governance", async () => {
    const result = await callAIWithJsonOutput<ProposalOutput>({
      systemPrompt: `${PROPOSAL_AGENCY_SYSTEM_PROMPT}\n\n${PROPOSAL_OUTPUT_SCHEMA_PROMPT}`,
      userPrompt: JSON.stringify({
        applicantType: "agency",
        projectRequirements: "Build a high-traffic web application with React and Node.js.",
      }),
    });

    expect(result.applicantType).toBe("agency");
    expect(result.executiveSummary).toMatch(/agency|team|squad|solutions/i);
    expect(result.sections.length).toBeGreaterThanOrEqual(1);
    expect(result.deliverables.length).toBeGreaterThan(0);
    expect(result.milestones.length).toBeGreaterThan(0);

    const schemaTest = ProposalOutputSchema.safeParse(result);
    expect(schemaTest.success).toBe(true);
  });

  it("generates Individual-positioned proposal with 1st-person ownership", async () => {
    const result = await callAIWithJsonOutput<ProposalOutput>({
      systemPrompt: `${PROPOSAL_INDIVIDUAL_SYSTEM_PROMPT}\n\n${PROPOSAL_OUTPUT_SCHEMA_PROMPT}`,
      userPrompt: JSON.stringify({
        applicantType: "individual",
        projectRequirements: "Build a specialized API integration with Next.js.",
      }),
    });

    expect(result.applicantType).toBe("individual");
    expect(result.executiveSummary).toMatch(/I |my |independent|consultant/i);
    expect(result.sections.length).toBeGreaterThanOrEqual(1);

    const schemaTest = ProposalOutputSchema.safeParse(result);
    expect(schemaTest.success).toBe(true);
  });
});
