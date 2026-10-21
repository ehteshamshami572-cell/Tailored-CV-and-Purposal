"use client";

import * as React from "react";
import { Send, ArrowLeft, RotateCcw, Sparkles, SlidersHorizontal, Users, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { ProposalForm } from "@/components/proposal/proposal-form";
import { ProposalEditor } from "@/components/proposal/proposal-editor";
import { ProposalPreview } from "@/components/proposal/proposal-preview";
import { ProposalGeneratingSkeleton } from "@/components/proposal/proposal-skeleton";
import type { ProposalInput, ProposalOutput } from "@/types/proposal";

const PROPOSAL_STORAGE_KEY = "craftforge_proposal_state";

export default function ProposalGeneratorPage() {
  const [view, setView] = React.useState<"form" | "result">("form");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // State
  const [currentInput, setCurrentInput] = React.useState<ProposalInput | null>(null);
  const [generatedProposal, setGeneratedProposal] = React.useState<ProposalOutput | null>(null);
  const [activeTab, setActiveTab] = React.useState("preview");
  const [isInitialized, setIsInitialized] = React.useState(false);

  // 1. Restore state from localStorage so data is not lost on reload
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(PROPOSAL_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.currentInput) setCurrentInput(data.currentInput);
        if (data.generatedProposal) setGeneratedProposal(data.generatedProposal);
        if (data.view) setView(data.view);
        if (data.activeTab) setActiveTab(data.activeTab);
      }
    } catch (e) {
      console.warn("Failed to restore proposal state:", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // 2. Persist state to localStorage on update
  React.useEffect(() => {
    if (!isInitialized) return;

    if (currentInput || generatedProposal) {
      try {
        localStorage.setItem(
          PROPOSAL_STORAGE_KEY,
          JSON.stringify({
            view,
            currentInput,
            generatedProposal,
            activeTab,
          })
        );
      } catch (e) {
        console.warn("Failed to persist proposal state:", e);
      }
    }
  }, [isInitialized, view, currentInput, generatedProposal, activeTab]);

  const handleGenerate = async (input: ProposalInput) => {
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentInput(input);
    toast.info("Generating tailored proposal with AI...", "Proposal Generation");

    try {
      const res = await fetch("/api/proposal/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to generate proposal.");
      }

      setGeneratedProposal(json.data.proposal);
      setView("result");
      toast.success("Proposal generated successfully!", "Success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error generating proposal";
      setErrorMessage(msg);
      toast.error(msg, "Generation Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateProposal = () => {
    if (currentInput) {
      handleGenerate(currentInput);
    }
  };

  const handleClearSession = () => {
    try {
      localStorage.removeItem(PROPOSAL_STORAGE_KEY);
    } catch {}
    setCurrentInput(null);
    setGeneratedProposal(null);
    setView("form");
    toast.info("Proposal session reset. You can start a new proposal.");
  };

  const handleRegenerateSection = async (sectionId: string) => {
    if (!generatedProposal || !currentInput) return;

    toast.info("Regenerating section with AI...");

    try {
      const targetSec = generatedProposal.sections.find((s) => s.id === sectionId);
      if (!targetSec) return;

      const res = await fetch("/api/proposal/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            ...currentInput,
            additionalInstructions: `Focus specifically on rewriting only the section titled '${targetSec.title}'.`,
          },
        }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data.proposal.sections) {
        const matchingSection =
          json.data.proposal.sections.find(
            (s: any) => s.title.toLowerCase() === targetSec.title.toLowerCase()
          ) || json.data.proposal.sections[0];

        if (matchingSection) {
          const updatedSections = generatedProposal.sections.map((s) =>
            s.id === sectionId ? { ...s, content: matchingSection.content } : s
          );
          setGeneratedProposal({ ...generatedProposal, sections: updatedSections });
          toast.success(`Section "${targetSec.title}" regenerated successfully!`);
        }
      }
    } catch (err) {
      console.error("Failed to regenerate section:", err);
      toast.error("Failed to regenerate section.");
    }
  };

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Send className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">AI Proposal Generator</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Persuasive client proposals with conditional Agency vs Individual positioning
          </p>
        </div>

        <div className="flex items-center gap-2">
          {generatedProposal && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearSession}
              className="text-xs h-7 text-muted-foreground hover:text-destructive gap-1"
              title="Clear stored data and start over"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear &amp; New</span>
            </Button>
          )}

          {view === "result" && generatedProposal && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setView("form")}
                className="text-xs gap-1.5"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Tweak Scope
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRegenerateProposal}
                isLoading={isLoading}
                disabled={isLoading}
                className="text-xs gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Regenerate All
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && <ProposalGeneratingSkeleton />}

      {/* View 1: Form */}
      {!isLoading && view === "form" && (
        <ProposalForm
          onSubmit={handleGenerate}
          isLoading={isLoading}
          errorMessage={errorMessage}
          initialValues={currentInput || undefined}
        />
      )}

      {/* View 2: Result Preview & Editor */}
      {!isLoading && view === "result" && generatedProposal && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                {generatedProposal.applicantType === "agency" ? (
                  <Users className="h-5 w-5" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground line-clamp-1">{generatedProposal.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Generated in{" "}
                  <span className="font-semibold text-foreground uppercase">
                    {generatedProposal.applicantType}
                  </span>{" "}
                  mode • Saved in browser session
                </p>
              </div>
            </div>

            <Badge variant="outline" className="font-mono text-xs self-start sm:self-auto">
              {generatedProposal.sections.length} Sections • {generatedProposal.deliverables.length} Deliverables
            </Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full sm:w-80">
              <TabsTrigger value="preview" className="text-xs">
                Visual Preview &amp; Export
              </TabsTrigger>
              <TabsTrigger value="editor" className="text-xs">
                Interactive Section Editor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="pt-4">
              <ProposalPreview proposal={generatedProposal} />
            </TabsContent>

            <TabsContent value="editor" className="pt-4">
              <ProposalEditor
                proposal={generatedProposal}
                onChange={(updated) => {
                  setGeneratedProposal(updated);
                  toast.info("Proposal updated in preview.");
                }}
                onRegenerateSection={handleRegenerateSection}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
