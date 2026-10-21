"use client";

import * as React from "react";
import { Download, Copy, Check, LayoutTemplate, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/toast";
import type { ProposalOutput, ProposalTemplateId } from "@/types/proposal";

interface ProposalPreviewProps {
  proposal: ProposalOutput;
}

export function ProposalPreview({ proposal }: ProposalPreviewProps) {
  const [template, setTemplate] = React.useState<ProposalTemplateId>("modern-corp");
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const handleCopyText = async () => {
    try {
      const fullText = `
# ${proposal.title}
Date: ${proposal.date}
Prepared For: ${proposal.clientName || "Valued Client"}
Prepared By: ${proposal.applicantName || "Lead Professional"} (${proposal.applicantType.toUpperCase()})

## Executive Summary
${proposal.executiveSummary}

${proposal.sections
  .map(
    (sec) => `## ${sec.title}
${sec.content}`
  )
  .join("\n\n")}

## Key Deliverables
${proposal.deliverables.map((d) => `- ${d}`).join("\n")}

## Milestones & Timeline
${proposal.milestones.map((m) => `### ${m.name} (${m.estimatedDuration || "TBD"})\n${m.description}`).join("\n\n")}

## Pricing & Investment
${proposal.pricingSummary || "Standard milestone terms apply."}

## Next Steps
${proposal.nextSteps}
      `.trim();

      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      toast.success("Proposal text copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard.");
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      const res = await fetch("/api/proposal/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposal, templateId: template }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || `Export failed with HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeTitle = (proposal.title || "Project_Proposal").replace(/[^a-zA-Z0-9_-]/g, "_");
      a.download = `${safeTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Proposal PDF downloaded successfully!", "Download Complete");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error exporting PDF";
      setExportError(msg);
      toast.error(msg, "Export Failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {exportError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Export Error</AlertTitle>
          <AlertDescription>{exportError}</AlertDescription>
        </Alert>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-muted/40 rounded-xl border">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Style Template:</span>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value as ProposalTemplateId)}
            className="text-xs h-8 rounded-md border bg-background px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary font-medium"
          >
            <option value="modern-corp">Modern Corporate (Navy & Slate)</option>
            <option value="creative-agency">Creative Studio (Deep Purple)</option>
            <option value="minimalist">Minimalist Monochrome</option>
          </select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button type="button" variant="outline" size="sm" onClick={handleCopyText} className="gap-1.5 text-xs h-8">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied" : "Copy Text"}</span>
          </Button>

          <Button
            onClick={handleExportPdf}
            isLoading={isExporting}
            disabled={isExporting}
            className="gap-2 text-xs h-8 px-4"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isExporting ? "Generating PDF..." : "Download Proposal PDF"}</span>
          </Button>
        </div>
      </div>

      {/* Live Visual Document Preview */}
      <div
        className={`border rounded-xl p-8 sm:p-14 shadow-md bg-white text-slate-900 transition-all min-h-[800px] ${
          template === "creative-agency" ? "border-purple-200" : "border-slate-200"
        }`}
      >
        {/* Document Header */}
        <div className="border-b pb-6 mb-8">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
            <span
              className={`font-semibold uppercase tracking-wider px-2 py-0.5 rounded text-[10px] ${
                proposal.applicantType === "agency"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              {proposal.applicantType === "agency" ? "Agency Corporate Proposal" : "Independent Consultant Proposal"}
            </span>
            <span>Date: {proposal.date}</span>
          </div>

          <h1
            className={`text-2xl sm:text-3xl font-bold tracking-tight mb-3 ${
              template === "creative-agency"
                ? "text-purple-900"
                : template === "modern-corp"
                ? "text-slate-900"
                : "text-neutral-900"
            }`}
          >
            {proposal.title}
          </h1>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600">
            {proposal.applicantName && (
              <span>
                <strong>Prepared By:</strong> {proposal.applicantName}
              </span>
            )}
            {proposal.clientName && (
              <span>
                <strong>Prepared For:</strong> {proposal.clientName}
              </span>
            )}
          </div>
        </div>

        {/* Executive Summary */}
        {proposal.executiveSummary && (
          <div className="mb-8 p-4 rounded-lg bg-slate-50 border border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Executive Summary</h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700">{proposal.executiveSummary}</p>
          </div>
        )}

        {/* Sections */}
        {proposal.sections.map((sec, idx) => (
          <div key={sec.id || idx} className="mb-8">
            <h2
              className={`text-sm sm:text-base font-bold mb-2 pb-1 border-b ${
                template === "creative-agency"
                  ? "text-purple-900 border-purple-200"
                  : "text-slate-900 border-slate-200"
              }`}
            >
              {sec.title}
            </h2>
            <div className="text-xs sm:text-sm leading-relaxed text-slate-700 whitespace-pre-wrap space-y-2">
              {sec.content}
            </div>
          </div>
        ))}

        {/* Deliverables */}
        {proposal.deliverables.length > 0 && (
          <div className="mb-8">
            <h2
              className={`text-sm sm:text-base font-bold mb-3 pb-1 border-b ${
                template === "creative-agency"
                  ? "text-purple-900 border-purple-200"
                  : "text-slate-900 border-slate-200"
              }`}
            >
              Key Deliverables & Scope
            </h2>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
              {proposal.deliverables.map((d, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Milestones */}
        {proposal.milestones.length > 0 && (
          <div className="mb-8">
            <h2
              className={`text-sm sm:text-base font-bold mb-3 pb-1 border-b ${
                template === "creative-agency"
                  ? "text-purple-900 border-purple-200"
                  : "text-slate-900 border-slate-200"
              }`}
            >
              Project Milestones & Timeline
            </h2>
            <div className="space-y-3">
              {proposal.milestones.map((m, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                    <span>{m.name}</span>
                    {m.estimatedDuration && (
                      <span className="font-mono text-[11px] text-slate-500 font-normal">
                        Duration: {m.estimatedDuration}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        {proposal.pricingSummary && (
          <div className="mb-8">
            <h2
              className={`text-sm sm:text-base font-bold mb-2 pb-1 border-b ${
                template === "creative-agency"
                  ? "text-purple-900 border-purple-200"
                  : "text-slate-900 border-slate-200"
              }`}
            >
              Investment & Commercial Terms
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700">{proposal.pricingSummary}</p>
          </div>
        )}

        {/* Next Steps */}
        {proposal.nextSteps && (
          <div className="pt-4 border-t">
            <h2
              className={`text-sm sm:text-base font-bold mb-2 ${
                template === "creative-agency" ? "text-purple-900" : "text-slate-900"
              }`}
            >
              Next Steps & Project Kickoff
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700">{proposal.nextSteps}</p>
          </div>
        )}
      </div>
    </div>
  );
}
