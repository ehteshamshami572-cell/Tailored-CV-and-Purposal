import { describe, it, expect } from "vitest";
import { generateResumePdf } from "@/lib/documents/generate-pdf";
import { generateProposalPdf } from "@/lib/documents/generate-proposal-pdf";
import type { ParsedCV } from "@/types/resume";
import type { ProposalOutput } from "@/types/proposal";

const mockCV: ParsedCV = {
  contact: {
    fullName: "Elena Rostova",
    email: "elena.rostova@example.com",
    phone: "+1 (555) 432-8765",
    location: "Seattle, WA",
    linkedinUrl: "https://linkedin.com/in/elenarostova",
    githubUrl: "https://github.com/elenarostova",
  },
  professionalSummary:
    "Senior Cloud Architect and Principal Full Stack Developer with 8+ years designing scalable distributed systems with Next.js, TypeScript, and AWS.",
  skills: ["TypeScript", "Next.js", "React", "Node.js", "Docker", "AWS", "PostgreSQL", "System Architecture"],
  experience: [
    {
      id: "exp-1",
      jobTitle: "Principal Systems Architect",
      employer: "AeroTech Platforms",
      location: "Seattle, WA",
      startDate: "2021-01",
      endDate: "Present",
      bullets: [
        "Architected distributed event-driven microservices serving 10M+ daily events with 99.99% uptime.",
        "Led modern Next.js frontend rebuild, improving Core Web Vitals across all product surfaces by 48%.",
      ],
    },
    {
      id: "exp-2",
      jobTitle: "Senior Software Engineer",
      employer: "DataVanguard",
      location: "San Jose, CA",
      startDate: "2017-06",
      endDate: "2020-12",
      bullets: [
        "Engineered real-time analytics streaming pipelines using Node.js and Redis.",
        "Refactored legacy REST endpoints to typed GraphQL schemas, cutting round-trip requests by 40%.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "University of Washington",
      degree: "B.S. in Computer Engineering",
      graduationDate: "2017",
      gpa: "3.9/4.0",
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect - Professional",
      issuer: "Amazon Web Services",
      date: "2023",
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "Nexus Distributed Cache",
      description: "High-performance distributed caching daemon written in TypeScript and Node.js.",
      bullets: ["Zero-dependency in-memory cluster coordinator."],
      technologies: ["Node.js", "TypeScript"],
    },
  ],
  additionalSections: [],
};

const mockProposal: ProposalOutput = {
  title: "Cloud Infrastructure Modernization & Platform Engineering Proposal",
  clientName: "Global FinCorp",
  applicantName: "Apex Architecture Group",
  applicantType: "agency",
  date: "2026-10-20",
  executiveSummary:
    "Apex Architecture Group is pleased to propose an end-to-end cloud modernization architecture for Global FinCorp. Our multidisciplinary engineering squad delivers institutional-grade security, automated CI/CD governance, and scalable Next.js systems.",
  sections: [
    {
      id: "sec-1",
      title: "Understanding of Requirements & Strategic Objectives",
      content:
        "Global FinCorp requires a high-availability, compliant web platform to support expanding client volumes. We have designed an architecture focusing on zero-trust security and sub-second transaction times.",
    },
    {
      id: "sec-2",
      title: "Technical Architecture & Squad Governance",
      content:
        "Our team employs strict test-driven development, automated code review gates, and weekly staging milestone reviews to ensure total transparency.",
    },
  ],
  deliverables: [
    "Production-grade Next.js enterprise application",
    "Terraform AWS cloud infrastructure definitions",
    "Automated end-to-end test suite and security scanning pipeline",
  ],
  milestones: [
    {
      name: "Milestone 1: Architecture Blueprint & Prototype",
      description: "Finalize technical specifications and cloud sandbox.",
      estimatedDuration: "2 Weeks",
    },
    {
      name: "Milestone 2: Core Platform Engineering",
      description: "Build all primary user stories and automated tests.",
      estimatedDuration: "4 Weeks",
    },
  ],
  pricingSummary: "Structured milestone billing upon deliverable verification.",
  nextSteps: "Schedule initial technical alignment session to review repository permissions.",
};

describe("PDF Generation Engine Tests", () => {
  it("generates valid vector PDF for resume in ATS Classic template", async () => {
    const pdfBytes = await generateResumePdf(mockCV, "ats-classic");
    expect(pdfBytes).toBeDefined();
    expect(pdfBytes.byteLength).toBeGreaterThan(1000);

    // Verify PDF header magic bytes "%PDF-"
    const header = Buffer.from(pdfBytes.slice(0, 5)).toString("ascii");
    expect(header).toBe("%PDF-");
  });

  it("generates valid resume PDF in Modern Clean and Executive Serif templates", async () => {
    const modernBytes = await generateResumePdf(mockCV, "modern-clean");
    const serifBytes = await generateResumePdf(mockCV, "executive-serif");

    expect(Buffer.from(modernBytes.slice(0, 5)).toString("ascii")).toBe("%PDF-");
    expect(Buffer.from(serifBytes.slice(0, 5)).toString("ascii")).toBe("%PDF-");
  });

  it("generates valid proposal PDF for Agency applicant type", async () => {
    const pdfBytes = await generateProposalPdf(mockProposal, "modern-corp");
    expect(pdfBytes.byteLength).toBeGreaterThan(1000);
    expect(Buffer.from(pdfBytes.slice(0, 5)).toString("ascii")).toBe("%PDF-");
  });

  it("generates valid proposal PDF for Individual applicant type", async () => {
    const individualProposal: ProposalOutput = {
      ...mockProposal,
      applicantType: "individual",
      applicantName: "Jordan Vance, Principal Consultant",
      executiveSummary:
        "I am submitting this tailored proposal to build and deploy your target application. As an independent consultant, I offer direct 1-on-1 ownership and rapid execution.",
    };

    const pdfBytes = await generateProposalPdf(individualProposal, "creative-agency");
    expect(pdfBytes.byteLength).toBeGreaterThan(1000);
    expect(Buffer.from(pdfBytes.slice(0, 5)).toString("ascii")).toBe("%PDF-");
  });
});
