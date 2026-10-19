export interface ContactInfo {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  employer: string;
  location?: string;
  startDate: string;
  endDate: string; // e.g. "Present" or "2024-01"
  bullets: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  graduationDate?: string;
  gpa?: string;
  achievements?: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  url?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  bullets?: string[];
  technologies?: string[];
  url?: string;
}

export interface AdditionalSection {
  id: string;
  heading: string;
  items: string[];
}

export interface ParsedCV {
  contact: ContactInfo;
  professionalSummary: string;
  skills: string[];
  experience: WorkExperience[];
  education: EducationItem[];
  certifications: CertificationItem[];
  projects: ProjectItem[];
  additionalSections: AdditionalSection[];
  rawText?: string;
}

export interface JobDescriptionAnalysis {
  targetJobTitle: string;
  companyName?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  experienceExpectations: string;
  industryKeywords: string[];
  identifiedGaps: string[];
}

export interface ResumeChangeSummary {
  summary: string[];
  skillsAddedOrEmphasized: string[];
  experienceRefinements: string[];
  identifiedGaps: string[];
}

export interface TailoredResumeResult {
  analysis: JobDescriptionAnalysis;
  tailoredCV: ParsedCV;
  changeSummary: ResumeChangeSummary;
}

export type ResumeTemplateId = "ats-classic" | "modern-clean" | "executive-serif";
