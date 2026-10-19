import Link from "next/link";
import { FileText, Send, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Zap, Target, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="container py-12 md:py-16 space-y-16">
      {/* Hero Section */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Production AI Productivity Platform</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
          Precision Resume Tailoring &amp; Winning Client Proposals
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Two dedicated, end-to-end AI tools engineered for technical precision, factual accuracy,
          and client conversion. Download ATS-compliant PDFs in seconds.
        </p>
      </div>

      {/* Main 2-Tool Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Card 1: AI Resume Tailor */}
        <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
          <div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-primary flex items-center justify-center">
                  <FileText className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="font-mono text-[11px]">
                  PDF • DOCX • TXT
                </Badge>
              </div>
              <CardTitle className="text-xl">AI Resume Tailor</CardTitle>
              <CardDescription className="text-sm leading-relaxed mt-1">
                Upload your existing CV, provide a target Job Description, and receive an ATS-optimized, truthfully
                aligned resume with full editing control and downloadable vector PDF.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>Deep PDF/Word text extraction with scanned document detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>JD keyword gap analysis &amp; competency matching</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>Strict factual integrity: never invents false metrics or degrees</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>Multi-page vector PDF generation with 3 ATS-tested layouts</span>
                </li>
              </ul>
            </CardContent>
          </div>

          <CardFooter className="pt-4 border-t bg-muted/20">
            <Link href="/resume-tailor" className="w-full">
              <Button className="w-full gap-2 group-hover:bg-primary/95">
                <span>Upload CV &amp; Tailor Now</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Card 2: AI Proposal Generator */}
        <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Send className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="font-mono text-[11px]">
                  Agency vs. Individual
                </Badge>
              </div>
              <CardTitle className="text-xl">AI Proposal Generator</CardTitle>
              <CardDescription className="text-sm leading-relaxed mt-1">
                Generate high-converting, tailored proposals with distinct positioning strategies whether you are
                submitting as an established Agency or an Individual Specialist.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>Conditional strategy branching for Agency vs Individual representation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>Scope of work, deliverables, milestones, and investment breakdown</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>Real-time section editor with inline regeneration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>Client-ready vector PDF with pagination and header branding</span>
                </li>
              </ul>
            </CardContent>
          </div>

          <CardFooter className="pt-4 border-t bg-muted/20">
            <Link href="/proposal-generator" className="w-full">
              <Button className="w-full gap-2 group-hover:bg-primary/95">
                <span>Start New Proposal</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Feature & Security Badges Section */}
      <div className="max-w-4xl mx-auto pt-6 border-t">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">ATS Parse-Proof</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Outputs vector PDFs encoded with standard fonts and clean hierarchies readable by standard ATS scanners.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Factual Integrity</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                AI prompts prohibit hallucinations, fake metrics, or invented certifications. Missing qualifications are
                flagged as gaps.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Zero Retention</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                All files process in server memory only. No document retention or public storage buckets.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
