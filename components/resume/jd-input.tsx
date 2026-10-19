"use client";

import * as React from "react";
import { Sparkles, Briefcase, Building2, AlertCircle, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface JdInputProps {
  onBack: () => void;
  onSubmit: (data: { jobDescription: string; targetJobTitle?: string; companyName?: string }) => void;
  isLoading: boolean;
  errorMessage?: string | null;
}

export function JdInput({ onBack, onSubmit, isLoading, errorMessage }: JdInputProps) {
  const [jobDescription, setJobDescription] = React.useState("");
  const [targetJobTitle, setTargetJobTitle] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmed = jobDescription.trim();
    if (trimmed.length < 30) {
      setValidationError("Please paste the complete Job Description (minimum 30 characters) to ensure effective keyword matching and tailoring.");
      return;
    }

    onSubmit({
      jobDescription: trimmed,
      targetJobTitle: targetJobTitle.trim() || undefined,
      companyName: companyName.trim() || undefined,
    });
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Target Job Description & Details
          </CardTitle>
          <CardDescription>
            Paste the target Job Description (JD). Our AI engine will analyze keyword density, required qualifications,
            and reframe your genuine experience to maximize interview opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                Target Job Title <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Input
                placeholder="e.g. Senior Full Stack Engineer"
                value={targetJobTitle}
                onChange={(e) => setTargetJobTitle(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                Target Company Name <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Input
                placeholder="e.g. Acme Tech Solutions"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground flex items-center justify-between mb-1.5">
              <span>
                Job Description Text <span className="text-destructive">*</span>
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">
                {jobDescription.length} characters
              </span>
            </label>
            <Textarea
              placeholder="Paste the complete responsibilities, requirements, and qualifications from the target job posting here..."
              rows={12}
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                if (validationError) setValidationError(null);
              }}
              disabled={isLoading}
              className="font-sans text-xs leading-relaxed"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={isLoading} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Extracted CV</span>
        </Button>

        <Button type="submit" isLoading={isLoading} disabled={isLoading} className="gap-2 px-6">
          <Sparkles className="h-4 w-4" />
          <span>{isLoading ? "Analyzing & Tailoring CV..." : "Tailor My CV with AI"}</span>
        </Button>
      </div>
    </form>
  );
}
