"use client";

import * as React from "react";
import { Send, Building, User, Calendar, DollarSign, Sparkles, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ApplicantTypeToggle } from "./applicant-type-toggle";
import type { ProposalInput, ApplicantType, ProposalTone } from "@/types/proposal";

interface ProposalFormProps {
  onSubmit: (input: ProposalInput) => void;
  isLoading: boolean;
  errorMessage?: string | null;
  initialValues?: Partial<ProposalInput>;
}

export function ProposalForm({ onSubmit, isLoading, errorMessage, initialValues }: ProposalFormProps) {
  const [applicantType, setApplicantType] = React.useState<ApplicantType>(initialValues?.applicantType || "agency");
  const [projectRequirements, setProjectRequirements] = React.useState(initialValues?.projectRequirements || "");
  const [projectTitle, setProjectTitle] = React.useState(initialValues?.projectTitle || "");
  const [clientName, setClientName] = React.useState(initialValues?.clientName || "");
  const [industry, setIndustry] = React.useState(initialValues?.industry || "");
  const [applicantName, setApplicantName] = React.useState(initialValues?.applicantName || "");
  const [teamDetails, setTeamDetails] = React.useState(initialValues?.teamDetails || "");
  const [relevantExperience, setRelevantExperience] = React.useState(initialValues?.relevantExperience || "");
  const [skillsOrServices, setSkillsOrServices] = React.useState(initialValues?.skillsOrServices?.join(", ") || "");
  const [portfolioUrls, setPortfolioUrls] = React.useState(initialValues?.portfolioUrls?.join(", ") || "");
  const [projectTimeline, setProjectTimeline] = React.useState(initialValues?.projectTimeline || "");
  const [pricingOrBudget, setPricingOrBudget] = React.useState(initialValues?.pricingOrBudget || "");
  const [tone, setTone] = React.useState<ProposalTone>(initialValues?.tone || "professional");
  const [additionalInstructions, setAdditionalInstructions] = React.useState(initialValues?.additionalInstructions || "");

  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedReq = projectRequirements.trim();
    if (trimmedReq.length < 15) {
      setValidationError("Please provide meaningful project requirements (minimum 15 characters).");
      return;
    }

    const payload: ProposalInput = {
      applicantType,
      projectRequirements: trimmedReq,
      projectTitle: projectTitle.trim() || undefined,
      clientName: clientName.trim() || undefined,
      industry: industry.trim() || undefined,
      applicantName: applicantName.trim() || undefined,
      teamDetails: teamDetails.trim() || undefined,
      relevantExperience: relevantExperience.trim() || undefined,
      skillsOrServices: skillsOrServices
        ? skillsOrServices.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
      portfolioUrls: portfolioUrls
        ? portfolioUrls.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
      projectTimeline: projectTimeline.trim() || undefined,
      pricingOrBudget: pricingOrBudget.trim() || undefined,
      tone,
      additionalInstructions: additionalInstructions.trim() || undefined,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(errorMessage || validationError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Notice</AlertTitle>
          <AlertDescription>{errorMessage || validationError}</AlertDescription>
        </Alert>
      )}

      {/* Primary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Project Scope & Applicant Positioning
          </CardTitle>
          <CardDescription>
            Configure your proposal requirements. The generator adapts positioning, team dynamics, accountability
            narratives, and deliverables based on your chosen representation model.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Step 1: Applicant Type Toggle */}
          <ApplicantTypeToggle value={applicantType} onChange={setApplicantType} disabled={isLoading} />

          {/* Step 2: Project Requirements Textarea */}
          <div>
            <label className="text-xs font-semibold text-foreground flex items-center justify-between mb-1.5">
              <span>
                Project Requirements or Job Brief <span className="text-destructive">*</span>
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">
                {projectRequirements.length} characters
              </span>
            </label>
            <Textarea
              rows={8}
              placeholder="Paste the client's RFP, project brief, job description, technical requirements, or key deliverables..."
              value={projectRequirements}
              onChange={(e) => {
                setProjectRequirements(e.target.value);
                if (validationError) setValidationError(null);
              }}
              disabled={isLoading}
              className="text-xs leading-relaxed font-sans"
            />
          </div>

          {/* Optional Primary Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Project Title <span className="font-normal">(Optional)</span>
              </label>
              <Input
                placeholder="e.g. Modern E-Commerce Platform"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                disabled={isLoading}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Client / Company Name <span className="font-normal">(Optional)</span>
              </label>
              <Input
                placeholder="e.g. Acme Corporation"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                disabled={isLoading}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                {applicantType === "agency" ? "Agency / Firm Name" : "Your Name / Title"} <span className="font-normal">(Optional)</span>
              </label>
              <Input
                placeholder={applicantType === "agency" ? "e.g. Horizon Digital Studio" : "e.g. Jordan Vance, Lead Architect"}
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                disabled={isLoading}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced / Optional Fields Accordion */}
      <Card>
        <div
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors select-none"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              Optional Context: Timeline, Budget, Team & Tone Details
            </span>
          </div>
          <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0">
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {showAdvanced && (
          <CardContent className="pt-2 pb-6 space-y-4 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Estimated Timeline
                </label>
                <Input
                  placeholder="e.g. 6 to 8 weeks, milestone-based"
                  value={projectTimeline}
                  onChange={(e) => setProjectTimeline(e.target.value)}
                  disabled={isLoading}
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Pricing / Budget (Will not fabricate if blank)
                </label>
                <Input
                  placeholder="e.g. $8,500 fixed-price milestone scope"
                  value={pricingOrBudget}
                  onChange={(e) => setPricingOrBudget(e.target.value)}
                  disabled={isLoading}
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Target Industry
                </label>
                <Input
                  placeholder="e.g. FinTech, Healthcare, E-Commerce"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  disabled={isLoading}
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Proposal Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as ProposalTone)}
                  disabled={isLoading}
                  className="h-8 w-full rounded-md border bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="professional">Professional (Balanced & Authoritative)</option>
                  <option value="persuasive">Persuasive (High Conversion & Outcome-focused)</option>
                  <option value="technical">Technical (Architecture & Engineering Detail)</option>
                  <option value="collaborative">Collaborative (Partnership & Agile)</option>
                  <option value="executive">Executive (High-level ROI & Strategic)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                {applicantType === "agency" ? "Team Expertise & Service Coverage" : "Your Relevant Experience"}
              </label>
              <Textarea
                rows={2}
                placeholder={
                  applicantType === "agency"
                    ? "e.g. Squad consists of 1 Senior Full-Stack Lead, 1 UI/UX Specialist, and 1 QA Automation Engineer..."
                    : "e.g. 7+ years building enterprise Next.js and Node.js solutions for SaaS startups..."
                }
                value={teamDetails || relevantExperience}
                onChange={(e) => {
                  if (applicantType === "agency") setTeamDetails(e.target.value);
                  else setRelevantExperience(e.target.value);
                }}
                disabled={isLoading}
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Portfolio URLs / Case Studies (Comma separated)
              </label>
              <Input
                placeholder="e.g. https://github.com/myagency/app, https://clientcase.com"
                value={portfolioUrls}
                onChange={(e) => setPortfolioUrls(e.target.value)}
                disabled={isLoading}
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Additional Instructions or Exclusions
              </label>
              <Textarea
                rows={2}
                placeholder="e.g. Explicitly exclude cloud infrastructure hosting costs from base scope..."
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                disabled={isLoading}
                className="text-xs"
              />
            </div>
          </CardContent>
        )}
      </Card>

      <div className="flex items-center justify-end">
        <Button type="submit" isLoading={isLoading} disabled={isLoading} className="gap-2 px-6">
          <Sparkles className="h-4 w-4" />
          <span>{isLoading ? "Generating Structured Proposal..." : "Generate AI Proposal"}</span>
        </Button>
      </div>
    </form>
  );
}
