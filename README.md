# CraftForge AI: AI Resume Tailor & Proposal Generator

A production-ready, full-stack Next.js web platform that delivers two AI-powered tools:

1. **AI Resume Tailor** — Analyzes an uploaded CV (PDF, DOCX, TXT) and target Job Description (JD), evaluates competency alignment and gaps, and truthfully tailors the resume with ATS-friendly vector PDF downloads.
2. **AI Proposal Generator** — Accepts client project requirements and dynamically generates persuasive, tailored proposals with distinct conditional positioning strategies for **Agency** vs. **Individual** applicants.

Built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, **pdf-lib**, **mammoth**, **pdf-parse**, and **Zod**.

---

## 🌟 Key Capabilities

### 1. AI Resume Tailor
- **Document Text Extraction**: Multi-format parsing for `.pdf`, `.docx`, and `.txt` up to 10 MB. Includes automated detection for scanned image PDFs.
- **Structured Data Extraction**: Normalizes CVs into typed contact info, professional summary, skills, experience bullets, education, certifications, and projects.
- **JD Intelligence Engine**: Identifies required skills, preferred qualifications, key responsibilities, and gaps between the candidate's CV and the job posting.
- **Strict Factual Guardrails**: The tailoring engine prohibits hallucinations and will **never** invent unsupported metrics, degrees, employers, or skills. Missing qualifications are explicitly highlighted as gaps.
- **Interactive Multi-Section Editor**: Allows granular edits of all sections, adding/removing skills and bullets, and one-click "Restore Original" to revert any section to the source CV.
- **ATS-Compliant Vector PDF Generation**: Generates downloadable PDFs with selectable vector text and standard font encodings in 3 templates: *ATS Classic*, *Modern Clean*, and *Executive Serif*.

### 2. AI Proposal Generator
- **Conditional Strategy Branching**:
  - **Agency Mode**: Positions applicant as an established team offering multi-disciplinary service coverage, project management, QA standards, and milestone delivery.
  - **Individual Mode**: Positions applicant as an agile independent consultant with direct 1-on-1 ownership, tailored technical craftsmanship, and first-person narrative (`"I will deliver..."`).
- **Structured Proposal Architecture**: Generates executive summaries, client understanding, scope of work, technical approach, key deliverables, milestone timelines, pricing terms, and next steps.
- **Live Document Editor**: Reorder, add, or remove sections, edit milestone durations, and regenerate individual sections on-demand without losing other edits.
- **Client-Ready PDF Export**: Generates branded vector PDFs with pagination and cover headers.

### 3. Architecture, Security & Privacy
- **Zero Document Retention**: All uploaded CVs and generated documents process exclusively in server memory and are discarded immediately. No public object storage or database retention.
- **Prompt Injection Defense**: Sanitizes untrusted user inputs, strips instruction overrides (`<|im_start|>`, `[SYS]`, `<system>`), and isolates data as literal JSON values.
- **Sliding-Window Rate Limiting**: Built-in in-memory rate limiting across all API endpoints.
- **Multi-Provider AI Abstraction**: Supports OpenAI, Google Gemini, Anthropic Claude, Groq, OpenRouter, and a built-in deterministic offline mock mode for zero-config testing.

---

## 🏗️ Architecture & Directory Layout

```
├── app/
│   ├── api/
│   │   ├── resume/
│   │   │   ├── parse/route.ts      # CV file upload, text extraction & structuring
│   │   │   ├── tailor/route.ts     # JD analysis, gap detection & factual tailoring
│   │   │   └── export/route.ts     # ATS-friendly vector PDF export
│   │   └── proposal/
│   │       ├── generate/route.ts   # Conditional Agency/Individual generation
│   │       └── export/route.ts     # Branded proposal vector PDF export
│   ├── resume-tailor/
│   │   └── page.tsx                # Resume tailoring multi-step workflow
│   ├── proposal-generator/
│   │   └── page.tsx                # Proposal generator form, preview & editor
│   ├── layout.tsx                  # Root layout with Header and Footer
│   ├── page.tsx                    # Landing dashboard with tool cards
│   └── globals.css                 # Design tokens and theme styling
├── components/
│   ├── layout/                     # Global navigation header & footer
│   ├── ui/                         # Accessible UI primitives (Button, Card, Input, etc.)
│   ├── resume/                     # Upload, review, JD input, editor & preview
│   ├── proposal/                   # Type toggle, input form, editor & preview
│   └── shared/                     # Spinners, empty states & badges
├── lib/
│   ├── ai/
│   │   ├── provider.ts             # Provider abstraction (OpenAI, Gemini, Claude, Mock)
│   │   └── prompts.ts              # Truthfulness system prompts & JSON schemas
│   ├── documents/
│   │   ├── parse-pdf.ts            # PDF parsing & scanned PDF detection
│   │   ├── parse-docx.ts           # Word DOCX text extraction
│   │   ├── parse-text.ts           # UTF-8 plain text extraction
│   │   ├── generate-pdf.ts         # ATS-compliant resume vector PDF generator
│   │   └── generate-proposal-pdf.ts# Proposal vector PDF generator
│   ├── security/
│   │   ├── sanitize.ts             # Prompt injection defense & format validation
│   │   └── rate-limit.ts           # Sliding window in-memory rate limiter
│   ├── validation/
│   │   ├── resume-schema.ts        # Zod schemas for CVs & tailoring
│   │   └── proposal-schema.ts      # Zod schemas for proposals
│   └── utils/
│       ├── cn.ts                   # Tailwind class merge helper
│       └── formatters.ts           # File size, date, and text formatters
├── tests/                          # Vitest automated test suites
└── types/                          # TypeScript interfaces for CVs, proposals, and APIs
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node `v24.12.0`)
- npm `v9+` or `v11+`

### Installation

1. Clone or open the workspace repository:
   ```bash
   cd "d:/Cv and Purposal Tool"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Configure your preferred AI provider:
   ```env
   # AI Provider: "openai", "gemini", "anthropic", "groq", "openrouter", or leave blank for offline mock
   AI_PROVIDER=openai
   AI_MODEL=gpt-4o-mini
   AI_API_KEY=your-api-key-here

   # Maximum upload file size in Megabytes (default: 10)
   MAX_UPLOAD_SIZE_MB=10
   ```

   > **Note on Zero-Config Mock Mode**:
   > If `AI_API_KEY` is not provided or set to `mock`, the application automatically activates intelligent deterministic mock responses, allowing you to test all upload, tailoring, proposal generation, editing, and PDF export workflows without an API key!

4. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Automated Tests

Run the Vitest test suite:
```bash
npm test
```

Test coverage includes:
- Plain text, PDF, and DOCX document extraction.
- Scanned PDF detection and empty buffer rejection.
- Prompt injection neutralization and delimiter stripping.
- Sliding-window rate limiter enforcement.
- Vector PDF rendering and WinAnsi font compliance across all templates.
- Resume tailoring schema validation and factual preservation.
- Conditional Agency vs. Individual proposal strategy generation.

---

## 📦 Production Build & Deployment

Verify the production build:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

### Vercel Deployment
This application targets standard Vercel and Node.js hosting environments.
- All PDF/DOCX processing routes run on the Node.js runtime (`export const runtime = "nodejs"`).
- Set `AI_PROVIDER`, `AI_MODEL`, and `AI_API_KEY` in your Vercel Project Environment Variables.
- No external database is required for core functionality.
