export type ApplicantType = "agency" | "individual";

export type ProposalTone = "professional" | "persuasive" | "technical" | "collaborative" | "executive";

export interface ProposalInput {
  projectRequirements: string;
  applicantType: ApplicantType;
  projectTitle?: string;
  clientName?: string;
  industry?: string;
  applicantName?: string;
  teamDetails?: string;
  relevantExperience?: string;
  portfolioUrls?: string[];
  skillsOrServices?: string[];
  proposedSolutionSummary?: string;
  projectTimeline?: string;
  pricingOrBudget?: string;
  tone?: ProposalTone;
  additionalInstructions?: string;
}

export interface ProposalSection {
  id: string;
  title: string;
  content: string; // Markdown or plain text paragraphs
  subsections?: {
    id: string;
    title: string;
    content: string;
  }[];
}

export interface ProposalOutput {
  title: string;
  clientName?: string;
  applicantName?: string;
  applicantType: ApplicantType;
  date: string;
  executiveSummary: string;
  sections: ProposalSection[];
  deliverables: string[];
  milestones: {
    name: string;
    description: string;
    estimatedDuration?: string;
  }[];
  pricingSummary?: string;
  nextSteps: string;
}

export type ProposalTemplateId = "modern-corp" | "minimalist" | "creative-agency";
