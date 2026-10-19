import { z } from "zod";

export const ApplicantTypeSchema = z.enum(["agency", "individual"]);

export const ProposalToneSchema = z.enum([
  "professional",
  "persuasive",
  "technical",
  "collaborative",
  "executive",
]);

export const ProposalInputSchema = z.object({
  projectRequirements: z
    .string()
    .min(15, "Please provide detailed project requirements (minimum 15 characters)"),
  applicantType: ApplicantTypeSchema,
  projectTitle: z.string().optional().default(""),
  clientName: z.string().optional().default(""),
  industry: z.string().optional().default(""),
  applicantName: z.string().optional().default(""),
  teamDetails: z.string().optional().default(""),
  relevantExperience: z.string().optional().default(""),
  portfolioUrls: z.array(z.string()).optional().default([]),
  skillsOrServices: z.array(z.string()).optional().default([]),
  proposedSolutionSummary: z.string().optional().default(""),
  projectTimeline: z.string().optional().default(""),
  pricingOrBudget: z.string().optional().default(""),
  tone: ProposalToneSchema.optional().default("professional"),
  additionalInstructions: z.string().optional().default(""),
});

export const ProposalSectionSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  title: z.string().min(1, "Section title required"),
  content: z.string().default(""),
  subsections: z
    .array(
      z.object({
        id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
        title: z.string(),
        content: z.string(),
      })
    )
    .optional(),
});

export const ProposalMilestoneSchema = z.object({
  name: z.string(),
  description: z.string(),
  estimatedDuration: z.string().optional(),
});

export const ProposalOutputSchema = z.object({
  title: z.string().min(1, "Proposal title is required"),
  clientName: z.string().optional().default(""),
  applicantName: z.string().optional().default(""),
  applicantType: ApplicantTypeSchema,
  date: z.string().default(() => new Date().toISOString().split("T")[0]),
  executiveSummary: z.string().min(1, "Executive summary is required"),
  sections: z.array(ProposalSectionSchema).min(1, "At least one proposal section is required"),
  deliverables: z.array(z.string()).default([]),
  milestones: z.array(ProposalMilestoneSchema).default([]),
  pricingSummary: z.string().optional().default(""),
  nextSteps: z.string().min(1, "Next steps section is required"),
});

export const ExportProposalPdfPayloadSchema = z.object({
  proposal: ProposalOutputSchema,
  templateId: z.enum(["modern-corp", "minimalist", "creative-agency"]).default("modern-corp"),
});
