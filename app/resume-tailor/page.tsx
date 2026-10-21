"use client";

import * as React from "react";
import { FileText, ArrowLeft, RotateCcw, Sparkles, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { ResumeUpload } from "@/components/resume/resume-upload";
import { ParsedCvReview } from "@/components/resume/parsed-cv-review";
import { JdInput } from "@/components/resume/jd-input";
import { JdAnalysisView } from "@/components/resume/jd-analysis-view";
import { ChangeSummaryView } from "@/components/resume/change-summary";
import { TailoredCvEditor } from "@/components/resume/tailored-cv-editor";
import { ResumePreview } from "@/components/resume/resume-preview";
import { CvParsingSkeleton, CvTailoringSkeleton } from "@/components/resume/resume-skeleton";
import type { ParsedCV, JobDescriptionAnalysis, ResumeChangeSummary } from "@/types/resume";
import type { ParseCvApiResponse } from "@/types/api";

type WorkflowStep = "upload" | "review" | "jd" | "tailored";

const RESUME_STORAGE_KEY = "craftforge_resume_tailor_state";

export default function ResumeTailorPage() {
  const [step, setStep] = React.useState<WorkflowStep>("upload");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Stored state
  const [originalCV, setOriginalCV] = React.useState<ParsedCV | null>(null);
  const [fileName, setFileName] = React.useState<string>("");
  const [wordCount, setWordCount] = React.useState<number>(0);

  const [jobDescription, setJobDescription] = React.useState<string>("");
  const [targetJobTitle, setTargetJobTitle] = React.useState<string>("");
  const [companyName, setCompanyName] = React.useState<string>("");

  const [analysis, setAnalysis] = React.useState<JobDescriptionAnalysis | null>(null);
  const [tailoredCV, setTailoredCV] = React.useState<ParsedCV | null>(null);
  const [changeSummary, setChangeSummary] = React.useState<ResumeChangeSummary | null>(null);

  const [activeTab, setActiveTab] = React.useState("preview");
  const [isInitialized, setIsInitialized] = React.useState(false);

  // 1. Restore state from localStorage on page load so data is never lost on refresh
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(RESUME_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.originalCV) setOriginalCV(data.originalCV);
        if (data.fileName) setFileName(data.fileName);
        if (data.wordCount) setWordCount(data.wordCount);
        if (data.jobDescription) setJobDescription(data.jobDescription);
        if (data.targetJobTitle) setTargetJobTitle(data.targetJobTitle);
        if (data.companyName) setCompanyName(data.companyName);
        if (data.analysis) setAnalysis(data.analysis);
        if (data.tailoredCV) setTailoredCV(data.tailoredCV);
        if (data.changeSummary) setChangeSummary(data.changeSummary);
        if (data.step) setStep(data.step);
        if (data.activeTab) setActiveTab(data.activeTab);
      }
    } catch (e) {
      console.warn("Failed to restore resume state:", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // 2. Persist state to localStorage whenever it updates
  React.useEffect(() => {
    if (!isInitialized) return;

    if (originalCV || jobDescription) {
      try {
        localStorage.setItem(
          RESUME_STORAGE_KEY,
          JSON.stringify({
            step,
            originalCV,
            fileName,
            wordCount,
            jobDescription,
            targetJobTitle,
            companyName,
            analysis,
            tailoredCV,
            changeSummary,
            activeTab,
          })
        );
      } catch (e) {
        console.warn("Failed to persist resume state:", e);
      }
    }
  }, [
    isInitialized,
    step,
    originalCV,
    fileName,
    wordCount,
    jobDescription,
    targetJobTitle,
    companyName,
    analysis,
    tailoredCV,
    changeSummary,
    activeTab,
  ]);

  // Step 1: Upload Complete
  const handleParsed = (data: ParseCvApiResponse) => {
    setOriginalCV(data.parsedCV);
    setFileName(data.fileName);
    setWordCount(data.wordCount);
    setStep("review");
    toast.success("CV parsed and structured successfully! Review your data below.", "Extraction Complete");
  };

  // Step 3: Tailor with JD
  const handleTailor = async (params: {
    jobDescription: string;
    targetJobTitle?: string;
    companyName?: string;
  }) => {
    if (!originalCV) return;

    setIsLoading(true);
    setErrorMessage(null);
    setJobDescription(params.jobDescription);
    if (params.targetJobTitle) setTargetJobTitle(params.targetJobTitle);
    if (params.companyName) setCompanyName(params.companyName);

    toast.info("Analyzing Job Description and tailoring CV with AI...", "Optimization Started");

    try {
      const res = await fetch("/api/resume/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parsedCV: originalCV,
          jobDescription: params.jobDescription,
          targetJobTitle: params.targetJobTitle,
          companyName: params.companyName,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to tailor resume with Job Description.");
      }

      setAnalysis(json.data.analysis);
      setTailoredCV(json.data.tailoredCV);
      setChangeSummary(json.data.changeSummary);
      setStep("tailored");
      toast.success("Resume tailored successfully with ATS optimization!", "Success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error during tailoring";
      setErrorMessage(msg);
      toast.error(msg, "Tailoring Failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear Session & Start Fresh
  const handleClearSession = () => {
    try {
      localStorage.removeItem(RESUME_STORAGE_KEY);
    } catch {}
    setOriginalCV(null);
    setFileName("");
    setWordCount(0);
    setJobDescription("");
    setTargetJobTitle("");
    setCompanyName("");
    setAnalysis(null);
    setTailoredCV(null);
    setChangeSummary(null);
    setStep("upload");
    toast.info("Session reset. You can upload a new CV.");
  };

  // Re-tailor entire CV
  const handleRegenerateEntireCV = () => {
    if (jobDescription) {
      handleTailor({ jobDescription, targetJobTitle, companyName });
    }
  };

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      {/* Workflow Header & Step Tracker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">AI Resume Tailor</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Factual alignment and ATS optimization tailored to your target job posting
          </p>
        </div>

        <div className="flex items-center gap-2">
          {originalCV && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearSession}
              className="text-xs h-7 text-muted-foreground hover:text-destructive gap-1"
              title="Clear stored data and start over"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear &amp; New CV</span>
            </Button>
          )}

          {/* Step Indicator */}
          <div className="flex items-center gap-1 sm:gap-2 text-xs">
            <button
              onClick={() => step !== "upload" && setStep("upload")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                step === "upload"
                  ? "bg-primary text-primary-foreground"
                  : originalCV
                  ? "bg-secondary text-foreground hover:bg-secondary/80"
                  : "text-muted-foreground"
              }`}
            >
              1. Upload
            </button>
            <span className="text-muted-foreground">›</span>
            <button
              onClick={() => originalCV && setStep("review")}
              disabled={!originalCV}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                step === "review"
                  ? "bg-primary text-primary-foreground"
                  : originalCV
                  ? "bg-secondary text-foreground hover:bg-secondary/80"
                  : "text-muted-foreground opacity-50 cursor-not-allowed"
              }`}
            >
              2. Review
            </button>
            <span className="text-muted-foreground">›</span>
            <button
              onClick={() => originalCV && setStep("jd")}
              disabled={!originalCV}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                step === "jd"
                  ? "bg-primary text-primary-foreground"
                  : tailoredCV
                  ? "bg-secondary text-foreground hover:bg-secondary/80"
                  : "text-muted-foreground opacity-50 cursor-not-allowed"
              }`}
            >
              3. Job Description
            </button>
            <span className="text-muted-foreground">›</span>
            <button
              onClick={() => tailoredCV && setStep("tailored")}
              disabled={!tailoredCV}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                step === "tailored"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground opacity-50 cursor-not-allowed"
              }`}
            >
              4. Tailored Result
            </button>
          </div>
        </div>
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div className="space-y-6">
          <ResumeUpload
            onParsed={handleParsed}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
          {isLoading && <CvParsingSkeleton />}
        </div>
      )}

      {/* Step 2: Parsed CV Review */}
      {step === "review" && originalCV && (
        <ParsedCvReview
          parsedCV={originalCV}
          fileName={fileName}
          wordCount={wordCount}
          onProceedToJobDescription={() => setStep("jd")}
          onReset={() => {
            setOriginalCV(null);
            setStep("upload");
          }}
        />
      )}

      {/* Step 3: Job Description Input */}
      {step === "jd" && (
        <div className="space-y-6">
          {isLoading ? (
            <CvTailoringSkeleton />
          ) : (
            <JdInput
              onBack={() => setStep("review")}
              onSubmit={handleTailor}
              isLoading={isLoading}
              errorMessage={errorMessage}
            />
          )}
        </div>
      )}

      {/* Step 4: Tailored CV Result & Tabs */}
      {step === "tailored" && tailoredCV && originalCV && analysis && changeSummary && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-primary/[0.03] border border-primary/20">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Tailored CV Ready for {analysis.targetJobTitle}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review changes, adjust sections in the live editor, or export your downloadable PDF. Data is saved in your browser session.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep("jd")}
                className="text-xs gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Edit JD
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRegenerateEntireCV}
                isLoading={isLoading}
                disabled={isLoading}
                className="text-xs gap-1"
                title="Regenerate tailoring with current parameters"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Regenerate AI CV
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
              <TabsTrigger value="preview" className="text-xs">
                Visual Preview &amp; Export
              </TabsTrigger>
              <TabsTrigger value="editor" className="text-xs">
                Interactive CV Editor
              </TabsTrigger>
              <TabsTrigger value="analysis" className="text-xs">
                JD Intelligence Report
              </TabsTrigger>
              <TabsTrigger value="audit" className="text-xs">
                Tailoring Audit Log
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="pt-4">
              <ResumePreview cv={tailoredCV} />
            </TabsContent>

            <TabsContent value="editor" className="pt-4">
              <TailoredCvEditor
                cv={tailoredCV}
                originalCV={originalCV}
                onChange={(updated) => {
                  setTailoredCV(updated);
                  toast.info("CV changes updated in preview.");
                }}
              />
            </TabsContent>

            <TabsContent value="analysis" className="pt-4">
              <JdAnalysisView analysis={analysis} />
            </TabsContent>

            <TabsContent value="audit" className="pt-4">
              <ChangeSummaryView changeSummary={changeSummary} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
