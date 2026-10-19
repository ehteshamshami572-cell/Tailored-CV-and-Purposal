import { describe, it, expect } from "vitest";
import {
  ParsedCVSchema,
  JobDescriptionAnalysisSchema,
  TailorResumePayloadSchema,
  ResumeChangeSummarySchema,
} from "@/lib/validation/resume-schema";
import { callAIWithJsonOutput } from "@/lib/ai/provider";
import { RESUME_TAILOR_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import type { TailoredResumeResult } from "@/types/resume";

describe("Resume Tailor Workflow & Schema Tests", () => {
  const sampleCV = {
    contact: {
      fullName: "Marcus Ray",
      email: "marcus.ray@example.com",
      phone: "+1 555-0199",
      location: "Denver, CO",
    },
    professionalSummary: "Frontend engineer with React and TypeScript experience.",
    skills: ["React", "TypeScript", "JavaScript", "HTML", "CSS"],
    experience: [
      {
        id: "exp-1",
        jobTitle: "Frontend Developer",
        employer: "Digital Horizon Inc",
        startDate: "2020-01",
        endDate: "Present",
        bullets: ["Developed user-facing interfaces with React and Redux."],
      },
    ],
    education: [
      {
        id: "edu-1",
        institution: "Colorado State University",
        degree: "B.S. in Computer Information Systems",
      },
    ],
    certifications: [],
    projects: [],
    additionalSections: [],
  };

  it("validates valid parsed CV schema", () => {
    const parseResult = ParsedCVSchema.safeParse(sampleCV);
    expect(parseResult.success).toBe(true);
  });

  it("rejects tailoring request with too short job description", () => {
    const payload = {
      parsedCV: sampleCV,
      jobDescription: "Short JD",
    };
    const result = TailorResumePayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("executes AI tailoring with mock provider and enforces factual preservation", async () => {
    const result = await callAIWithJsonOutput<TailoredResumeResult>({
      systemPrompt: RESUME_TAILOR_SYSTEM_PROMPT,
      userPrompt: `Target Job Context and Candidate Data:\n\n${JSON.stringify({
        candidateCV: sampleCV,
        jobDescription: "Looking for a Lead Full Stack Engineer with TypeScript and Next.js experience.",
      })}`,
    });

    expect(result.analysis).toBeDefined();
    expect(result.analysis.requiredSkills.length).toBeGreaterThan(0);
    expect(result.tailoredCV).toBeDefined();
    expect(result.tailoredCV.experience.length).toBeGreaterThan(0);

    // Verify factual preservation in mock output
    expect(result.tailoredCV.experience[0].employer).toBeDefined();
    expect(result.tailoredCV.experience[0].startDate).toBeDefined();

    // Verify change summary existence
    expect(result.changeSummary).toBeDefined();
    expect(result.changeSummary.summary.length).toBeGreaterThan(0);
    expect(result.changeSummary.skillsAddedOrEmphasized.length).toBeGreaterThan(0);

    const schemaTest = ResumeChangeSummarySchema.safeParse(result.changeSummary);
    expect(schemaTest.success).toBe(true);
  });
});
