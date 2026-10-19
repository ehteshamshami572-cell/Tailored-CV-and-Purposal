import { z } from "zod";

export const ContactInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email required").or(z.string().min(1)),
  phone: z.string().optional().default(""),
  location: z.string().optional().default(""),
  linkedinUrl: z.string().optional().default(""),
  portfolioUrl: z.string().optional().default(""),
  githubUrl: z.string().optional().default(""),
});

export const WorkExperienceSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  jobTitle: z.string().min(1, "Job title is required"),
  employer: z.string().min(1, "Employer name is required"),
  location: z.string().optional().default(""),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  bullets: z.array(z.string()).default([]),
});

export const EducationItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  fieldOfStudy: z.string().optional().default(""),
  graduationDate: z.string().optional().default(""),
  gpa: z.string().optional().default(""),
  achievements: z.array(z.string()).optional().default([]),
});

export const CertificationItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  name: z.string().min(1, "Certification name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  date: z.string().optional().default(""),
  url: z.string().optional().default(""),
});

export const ProjectItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  name: z.string().min(1, "Project name is required"),
  description: z.string().default(""),
  bullets: z.array(z.string()).optional().default([]),
  technologies: z.array(z.string()).optional().default([]),
  url: z.string().optional().default(""),
});

export const AdditionalSectionSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  heading: z.string().min(1, "Section heading required"),
  items: z.array(z.string()).default([]),
});

export const ParsedCVSchema = z.object({
  contact: ContactInfoSchema,
  professionalSummary: z.string().default(""),
  skills: z.array(z.string()).default([]),
  experience: z.array(WorkExperienceSchema).default([]),
  education: z.array(EducationItemSchema).default([]),
  certifications: z.array(CertificationItemSchema).default([]),
  projects: z.array(ProjectItemSchema).default([]),
  additionalSections: z.array(AdditionalSectionSchema).default([]),
  rawText: z.string().optional(),
});

export const JobDescriptionAnalysisSchema = z.object({
  targetJobTitle: z.string().default("Target Role"),
  companyName: z.string().optional().default(""),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  experienceExpectations: z.string().default(""),
  industryKeywords: z.array(z.string()).default([]),
  identifiedGaps: z.array(z.string()).default([]),
});

export const ResumeChangeSummarySchema = z.object({
  summary: z.array(z.string()).default([]),
  skillsAddedOrEmphasized: z.array(z.string()).default([]),
  experienceRefinements: z.array(z.string()).default([]),
  identifiedGaps: z.array(z.string()).default([]),
});

export const TailorResumePayloadSchema = z.object({
  parsedCV: ParsedCVSchema,
  jobDescription: z.string().min(20, "Please provide a more detailed Job Description (at least 20 characters)."),
  targetJobTitle: z.string().optional(),
  companyName: z.string().optional(),
});

export const ExportResumePdfPayloadSchema = z.object({
  cv: ParsedCVSchema,
  templateId: z.enum(["ats-classic", "modern-clean", "executive-serif"]).default("ats-classic"),
});
