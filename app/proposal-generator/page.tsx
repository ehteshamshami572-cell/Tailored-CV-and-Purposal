"use client";

import * as React from "react";
import { Send, ArrowLeft, RotateCcw, Sparkles, SlidersHorizontal, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProposalForm } from "@/components/proposal/proposal-form";
import { ProposalEditor } from "@/components/proposal/proposal-editor";
import { ProposalPreview } from "@/components/proposal/proposal-preview";
import type { ProposalInput, ProposalOutput } from "@/types/proposal";

export default function ProposalGeneratorPage() {
  const [view, setView] = React.useState<"form" | "result">("form");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // State
  const [currentInput, setCurrentInput] = React.useState<ProposalInput | null>(null);
  const [generatedProposal, setGeneratedProposal] = React.useState<ProposalOutput | null>(null);
  const [activeTab, setActiveTab] = React.useState("preview");

  const handleGenerate = async (input: ProposalInput) => {
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentInput(input);

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error generating proposal";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateProposal = () => {
    if (currentInput) {
      handleGenerate(currentInput);
    }
  };

  const handleRegenerateSection = async (sectionId: string) => {
    if (!generatedProposal || !currentInput) return;

    // We can regenerate the specific section while preserving all other user edits!
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
        const matchingSection = json.data.proposal.sections.find(
          (s: any) => s.title.toLowerCase() === targetSec.title.toLowerCase()
        ) || json.data.proposal.sections[0];

        if (matchingSection) {
          const updatedSections = generatedProposal.sections.map((s) =>
            s.id === sectionId ? { ...s, content: matchingSection.content } : s
          );
          setGeneratedProposal({ ...generatedProposal, sections: updatedSections });
        }
      }
    } catch (err) {
      console.error("Failed to regenerate section:", err);
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

        {view === "result" && generatedProposal && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setView("form")}
              className="text-xs gap-1.5"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Tweak Scope &amp; Parameters
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
          </div>
        )}
      </div>

      {/* View 1: Form */}
      {view === "form" && (
        <ProposalForm
          onSubmit={handleGenerate}
          isLoading={isLoading}
          errorMessage={errorMessage}
          initialValues={currentInput || undefined}
        />
      )}

      {/* View 2: Result Preview & Editor */}
      {view === "result" && generatedProposal && (
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
                  mode • Ready for client submission &amp; PDF download
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
                onChange={setGeneratedProposal}
                onRegenerateSection={handleRegenerateSection}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
