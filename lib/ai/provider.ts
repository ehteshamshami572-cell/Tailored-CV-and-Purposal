import { sanitizeUntrustedInput } from "@/lib/security/sanitize";

export interface AICompletionOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  retries?: number;
}

export interface AIProviderConfig {
  provider: "openai" | "gemini" | "anthropic" | "groq" | "openrouter" | "mock";
  model: string;
  apiKey?: string;
  baseUrl?: string;
}

export function getAIConfig(): AIProviderConfig {
  const provider = (process.env.AI_PROVIDER?.toLowerCase() || "openai") as AIProviderConfig["provider"];
  const apiKey = process.env.AI_API_KEY || "";
  const baseUrl = process.env.AI_BASE_URL;

  let model = process.env.AI_MODEL;
  if (!model) {
    if (provider === "gemini") model = "gemini-2.0-flash";
    else if (provider === "anthropic") model = "claude-3-5-sonnet-latest";
    else model = "gpt-4o-mini";
  }

  // If no API key is supplied, default to the safe mock provider
  if (!apiKey || apiKey.startsWith("mock") || apiKey === "your-api-key-here") {
    return { provider: "mock", model: "mock-model", apiKey: "mock", baseUrl };
  }

  return { provider, model, apiKey, baseUrl };
}

/**
 * Executes an AI completion with timeout, retry backoff, and JSON parsing.
 */
export async function callAIWithJsonOutput<T>(options: AICompletionOptions): Promise<T> {
  const config = getAIConfig();
  const maxRetries = options.retries ?? 2;
  const timeoutMs = options.timeoutMs ?? 45000;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Exponential backoff: 1s, 2s...
        await new Promise((res) => setTimeout(res, 1000 * Math.pow(2, attempt - 1)));
      }

      if (config.provider === "mock") {
        return handleMockCompletion<T>(options);
      }

      const responseText = await executeProviderRequest(config, options, timeoutMs);
      const parsed = extractAndParseJson<T>(responseText);
      return parsed;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[AI Provider] Attempt ${attempt + 1} failed: ${lastError.message}`);
    }
  }

  throw new Error(`AI generation failed after ${maxRetries + 1} attempts: ${lastError?.message || "Unknown error"}`);
}

async function executeProviderRequest(
  config: AIProviderConfig,
  options: AICompletionOptions,
  timeoutMs: number
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    if (config.provider === "gemini") {
      return await callGemini(config, options, controller.signal);
    } else if (config.provider === "anthropic") {
      return await callAnthropic(config, options, controller.signal);
    } else {
      // Default to OpenAI / OpenAI-compatible (groq, openrouter, etc.)
      return await callOpenAICompatible(config, options, controller.signal);
    }
  } finally {
    clearTimeout(timer);
  }
}

async function callOpenAICompatible(
  config: AIProviderConfig,
  options: AICompletionOptions,
  signal: AbortSignal
): Promise<string> {
  let endpoint = config.baseUrl ? `${config.baseUrl.replace(/\/+$/, "")}/chat/completions` : "https://api.openai.com/v1/chat/completions";

  if (config.provider === "groq" && !config.baseUrl) {
    endpoint = "https://api.groq.com/openai/v1/chat/completions";
  } else if (config.provider === "openrouter" && !config.baseUrl) {
    endpoint = "https://openrouter.ai/api/v1/chat/completions";
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: options.systemPrompt },
        { role: "user", content: sanitizeUntrustedInput(options.userPrompt) },
      ],
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 3500,
      response_format: { type: "json_object" },
    }),
    signal,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI Provider HTTP ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response received from OpenAI provider");
  return content;
}

async function callGemini(
  config: AIProviderConfig,
  options: AICompletionOptions,
  signal: AbortSignal
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: options.systemPrompt }] },
      contents: [{ parts: [{ text: sanitizeUntrustedInput(options.userPrompt) }] }],
      generationConfig: {
        temperature: options.temperature ?? 0.3,
        maxOutputTokens: options.maxTokens ?? 3500,
        responseMimeType: "application/json",
      },
    }),
    signal,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini Provider HTTP ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response received from Gemini provider");
  return text;
}

async function callAnthropic(
  config: AIProviderConfig,
  options: AICompletionOptions,
  signal: AbortSignal
): Promise<string> {
  const url = "https://api.anthropic.com/v1/messages";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.model,
      system: options.systemPrompt + "\nIMPORTANT: You must return valid JSON only.",
      messages: [{ role: "user", content: sanitizeUntrustedInput(options.userPrompt) }],
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 3500,
    }),
    signal,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Anthropic Provider HTTP ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error("Empty response received from Anthropic provider");
  return text;
}

function extractAndParseJson<T>(rawText: string): T {
  let cleaned = rawText.trim();
  // Strip ```json markdown code fences if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Attempt to locate first { and last }
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const slice = cleaned.substring(firstBrace, lastBrace + 1);
      return JSON.parse(slice) as T;
    }
    throw new Error("Failed to parse JSON output from AI response");
  }
}

/**
 * Intelligent deterministic mock generator for local testing or zero-config demos.
 */
function handleMockCompletion<T>(options: AICompletionOptions): T {
  const prompt = options.userPrompt.toLowerCase();

  // 1. Resume parsing mock
  if (options.systemPrompt.includes("CVs and resumes") || prompt.includes("extract structured data")) {
    return {
      contact: {
        fullName: "Alex Morgan",
        email: "alex.morgan@example.com",
        phone: "+1 (555) 019-2834",
        location: "San Francisco, CA",
        linkedinUrl: "https://linkedin.com/in/alexmorgan",
        githubUrl: "https://github.com/alexmorgan",
      },
      professionalSummary:
        "Results-oriented Senior Software Engineer with 6+ years of experience designing high-throughput web applications, microservices, and distributed cloud systems.",
      skills: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Docker", "AWS", "GraphQL", "Tailwind CSS"],
      experience: [
        {
          id: "exp-1",
          jobTitle: "Senior Full Stack Engineer",
          employer: "TechCorp Solutions",
          location: "San Francisco, CA",
          startDate: "2021-03",
          endDate: "Present",
          bullets: [
            "Architected modern frontend micro-frontends with Next.js, reducing initial page load times by 42%.",
            "Led a squad of 5 engineers delivering high-availability REST and GraphQL APIs serving 2M+ monthly active users.",
            "Implemented automated CI/CD deployment pipelines on AWS ECS, cutting release cycle time from 2 hours to 15 minutes.",
          ],
        },
        {
          id: "exp-2",
          jobTitle: "Software Engineer",
          employer: "Apex Digital Labs",
          location: "Austin, TX",
          startDate: "2018-06",
          endDate: "2021-02",
          bullets: [
            "Developed responsive user interfaces using React, Redux, and TypeScript for B2B financial analytics.",
            "Optimized SQL queries and database indexes in PostgreSQL, cutting query latency by 35%.",
          ],
        },
      ],
      education: [
        {
          id: "edu-1",
          institution: "University of California, Berkeley",
          degree: "B.S. in Computer Science",
          fieldOfStudy: "Computer Science",
          graduationDate: "2018",
          gpa: "3.8/4.0",
        },
      ],
      certifications: [
        {
          id: "cert-1",
          name: "AWS Certified Solutions Architect",
          issuer: "Amazon Web Services",
          date: "2022",
        },
      ],
      projects: [
        {
          id: "proj-1",
          name: "CloudFlow Orchestrator",
          description: "Open-source workflow engine built with Node.js and TypeScript for distributed task scheduling.",
          bullets: ["Supports DAG task execution with automated retries and dead-letter queues."],
          technologies: ["Node.js", "TypeScript", "Redis", "Docker"],
          url: "https://github.com/alexmorgan/cloudflow",
        },
      ],
      additionalSections: [],
    } as unknown as T;
  }

  // 2. Resume tailoring mock
  if (options.systemPrompt.includes("tailor an existing, parsed CV")) {
    return {
      analysis: {
        targetJobTitle: "Lead Full Stack Engineer",
        companyName: "Acme Innovations",
        requiredSkills: ["TypeScript", "Next.js", "React", "Node.js", "System Architecture", "Cloud Infrastructure"],
        preferredSkills: ["GraphQL", "Tailwind CSS", "Microservices", "Docker"],
        responsibilities: [
          "Architect scalable, maintainable web systems",
          "Collaborate with product and design teams",
          "Mentor mid-level and junior engineers",
        ],
        experienceExpectations: "5+ years of production full stack web engineering experience",
        industryKeywords: ["Next.js", "TypeScript", "Full Stack", "Distributed Systems", "Cloud Architecture"],
        identifiedGaps: [
          "No direct mention of Kubernetes cluster management (if strict requirement).",
        ],
      },
      tailoredCV: {
        contact: {
          fullName: "Alex Morgan",
          email: "alex.morgan@example.com",
          phone: "+1 (555) 019-2834",
          location: "San Francisco, CA",
          linkedinUrl: "https://linkedin.com/in/alexmorgan",
          githubUrl: "https://github.com/alexmorgan",
        },
        professionalSummary:
          "Lead Full Stack Engineer with 6+ years of proven expertise building high-performance web platforms with Next.js, TypeScript, and distributed cloud systems. Accomplished at translating complex product requirements into resilient architectures, driving performance optimizations, and mentoring collaborative engineering squads.",
        skills: ["Next.js", "TypeScript", "React", "Node.js", "AWS", "PostgreSQL", "Docker", "GraphQL", "Tailwind CSS", "System Architecture"],
        experience: [
          {
            id: "exp-1",
            jobTitle: "Senior Full Stack Engineer",
            employer: "TechCorp Solutions",
            location: "San Francisco, CA",
            startDate: "2021-03",
            endDate: "Present",
            bullets: [
              "Architected mission-critical web applications with Next.js and TypeScript, driving a 42% reduction in initial page load times.",
              "Spearheaded technical leadership for a squad of 5 engineers delivering high-throughput REST and GraphQL APIs serving 2M+ monthly users.",
              "Designed resilient AWS ECS cloud infrastructure and automated CI/CD pipelines, accelerating release cycles from 2 hours to 15 minutes.",
            ],
          },
          {
            id: "exp-2",
            jobTitle: "Software Engineer",
            employer: "Apex Digital Labs",
            location: "Austin, TX",
            startDate: "2018-06",
            endDate: "2021-02",
            bullets: [
              "Engineered high-concurrency client interfaces using React and TypeScript for complex financial analytics workflows.",
              "Tuned relational PostgreSQL database schema and complex query plans, lowering query latency by 35%.",
            ],
          },
        ],
        education: [
          {
            id: "edu-1",
            institution: "University of California, Berkeley",
            degree: "B.S. in Computer Science",
            fieldOfStudy: "Computer Science",
            graduationDate: "2018",
            gpa: "3.8/4.0",
          },
        ],
        certifications: [
          {
            id: "cert-1",
            name: "AWS Certified Solutions Architect",
            issuer: "Amazon Web Services",
            date: "2022",
          },
        ],
        projects: [
          {
            id: "proj-1",
            name: "CloudFlow Orchestrator",
            description: "Distributed task scheduling engine with automated retries and resilient DAG pipeline execution.",
            bullets: ["Engineered modular TypeScript architecture supporting asynchronous job concurrency."],
            technologies: ["Node.js", "TypeScript", "Redis", "Docker"],
            url: "https://github.com/alexmorgan/cloudflow",
          },
        ],
        additionalSections: [],
      },
      changeSummary: {
        summary: [
          "Refocused summary directly around target role requirements in Next.js, TypeScript, and scalable cloud systems.",
          "Elevated leadership and mentoring accomplishments to match expectations for a senior role.",
        ],
        skillsAddedOrEmphasized: [
          "Re-ordered existing technical skills to prioritize target job keywords (Next.js, TypeScript, System Architecture).",
        ],
        experienceRefinements: [
          "Strengthened action verbs in employment achievements for maximum impact.",
          "Emphasized architectural leadership and delivery outcomes.",
        ],
        identifiedGaps: [
          "Identified target requirement for Kubernetes as a potential gap (not added to CV to preserve strict factual accuracy).",
        ],
      },
    } as unknown as T;
  }

  // 3. Proposal generator mock
  const isAgency = options.systemPrompt.includes("AGENCY") || prompt.includes('"applicanttype": "agency"');
  if (isAgency) {
    return {
      title: "Comprehensive Engineering & Digital Transformation Proposal",
      clientName: "Enterprise Client",
      applicantName: "Apex Digital Agency",
      applicantType: "agency",
      date: new Date().toISOString().split("T")[0],
      executiveSummary:
        "Apex Digital Agency is pleased to submit this proposal to deliver an enterprise-grade digital solution. We combine disciplined project management, multi-disciplinary technical talent, and rigorous automated quality assurance to ensure predictable, on-time delivery with zero compromises on performance or security.",
      sections: [
        {
          id: "sec-1",
          title: "Executive Summary & Agency Capabilities",
          content:
            "Our agency provides end-to-end technical execution, combining dedicated solutions architects, full-stack developers, and QA specialists. We manage the complete product lifecycle from architectural discovery to production deployment.",
        },
        {
          id: "sec-2",
          title: "Understanding of Client Requirements",
          content:
            "Based on your requirements, the primary objective is to implement a resilient, scalable, and user-centric platform. Our team has carefully analyzed the technical constraints and user experience benchmarks to design an optimal technical solution.",
        },
        {
          id: "sec-3",
          title: "Technical Architecture & Delivery Methodology",
          content:
            "We employ modern agile sprints with bi-weekly client demonstrations, continuous integration pipelines, and strict automated code reviews. All work is documented in detail to guarantee seamless long-term maintenance and knowledge transfer.",
        },
        {
          id: "sec-4",
          title: "Quality Assurance, Risk Mitigation & Governance",
          content:
            "Our multi-tiered QA process includes automated end-to-end testing, security vulnerability audits, and cross-browser regression testing. A designated project manager serves as your single point of contact with weekly status reports and transparent risk registers.",
        },
      ],
      deliverables: [
        "Complete production codebase with automated test suites",
        "Cloud deployment infrastructure with CI/CD pipeline",
        "Comprehensive API documentation and system architecture blueprints",
        "Post-launch handover documentation and administrator training",
      ],
      milestones: [
        {
          name: "Milestone 1: Architectural Discovery & System Design",
          description: "Technical specification, UI design system approval, and initial repository scaffolding.",
          estimatedDuration: "2 Weeks",
        },
        {
          name: "Milestone 2: Core Platform Development & API Integration",
          description: "Full-stack feature implementation, database modeling, and unit testing.",
          estimatedDuration: "4 Weeks",
        },
        {
          name: "Milestone 3: QA Verification & Production Deployment",
          description: "End-to-end testing, security auditing, staging client review, and production launch.",
          estimatedDuration: "2 Weeks",
        },
      ],
      pricingSummary:
        "Structured milestone-based invoicing aligned with deliverable approvals. Terms and schedule will be finalized upon mutual agreement.",
      nextSteps:
        "To proceed, our leadership team will schedule an initial 30-minute discovery workshop to align on project kickoff dates and environment access.",
    } as unknown as T;
  } else {
    // Individual applicant
    return {
      title: "Tailored Technical Solution & Consulting Proposal",
      clientName: "Valued Client",
      applicantName: "Jordan Vance, Senior Consultant",
      applicantType: "individual",
      date: new Date().toISOString().split("T")[0],
      executiveSummary:
        "I am pleased to present this tailored proposal to build and deliver your target application. As an independent senior specialist, I offer direct accountability, deep technical focus, and agile delivery without the overhead or communication layers of a traditional agency.",
      sections: [
        {
          id: "sec-1",
          title: "My Understanding of Your Project",
          content:
            "Having reviewed your requirements in detail, I understand that you need a robust, clean, and well-architected solution delivered efficiently. I will personally architect, write, test, and deploy every component of this project.",
        },
        {
          id: "sec-2",
          title: "Proposed Technical Approach",
          content:
            "I design clean, modular code with strict typing and clear boundaries. My development workflow includes automated testing, clean documentation, and frequent working software demonstrations so you have total visibility into progress.",
        },
        {
          id: "sec-3",
          title: "Direct Collaboration & Quality Standards",
          content:
            "You will communicate directly with me throughout the project. I maintain high responsiveness via Slack or email, provide regular milestone updates, and ensure all deliverables meet strict performance and security standards.",
        },
      ],
      deliverables: [
        "Fully implemented, documented, and tested codebase",
        "Clean, responsive user interface matching specifications",
        "Deployment guide and automated build scripts",
        "Direct post-delivery support window",
      ],
      milestones: [
        {
          name: "Phase 1: Architecture & Prototype",
          description: "Scaffold core application, design schema, and validate initial workflows.",
          estimatedDuration: "1-2 Weeks",
        },
        {
          name: "Phase 2: Core Feature Implementation",
          description: "Build all primary user stories, business logic, and API integrations.",
          estimatedDuration: "2-3 Weeks",
        },
        {
          name: "Phase 3: Refinement & Launch",
          description: "Testing, bug fixing, deployment to hosting platform, and final verification.",
          estimatedDuration: "1 Week",
        },
      ],
      pricingSummary:
        "Fixed-price milestones tied directly to approved deliverables, ensuring complete alignment on value and outcomes.",
      nextSteps:
        "I am ready to begin immediately upon project agreement. Let's schedule a brief kickoff call to confirm technical specifics and start date.",
    } as unknown as T;
  }
}
