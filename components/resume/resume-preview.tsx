"use client";

import * as React from "react";
import { Download, LayoutTemplate, AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import type { ParsedCV, ResumeTemplateId } from "@/types/resume";

interface ResumePreviewProps {
  cv: ParsedCV;
}

export function ResumePreview({ cv }: ResumePreviewProps) {
  const [template, setTemplate] = React.useState<ResumeTemplateId>("ats-classic");
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);

  const handleExportPdf = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      const res = await fetch("/api/resume/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv, templateId: template }),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        throw new Error(errorJson?.error || `Export failed with status ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = `${cv.contact.fullName.replace(/[^a-zA-Z0-9_-]/g, "_") || "Tailored"}_Resume.pdf`;
      a.download = safeName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error exporting PDF";
      setExportError(msg);
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
            onChange={(e) => setTemplate(e.target.value as ResumeTemplateId)}
            className="text-xs h-8 rounded-md border bg-background px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary font-medium"
          >
            <option value="ats-classic">ATS Classic (High Contrast)</option>
            <option value="modern-clean">Modern Clean (Navy Header)</option>
            <option value="executive-serif">Executive Serif (Traditional)</option>
          </select>
        </div>

        <Button
          onClick={handleExportPdf}
          isLoading={isExporting}
          disabled={isExporting}
          className="gap-2 text-xs h-8 px-4"
        >
          <Download className="h-3.5 w-3.5" />
          <span>{isExporting ? "Generating Vector PDF..." : "Download Resume PDF"}</span>
        </Button>
      </div>

      {/* Visual Live Document Preview */}
      <div
        className={`border rounded-xl p-8 sm:p-12 shadow-md bg-white text-slate-900 transition-all min-h-[700px] ${
          template === "executive-serif" ? "font-serif" : "font-sans"
        }`}
      >
        {/* Header */}
        <div className="border-b pb-4 mb-5">
          <h1
            className={`text-2xl font-bold tracking-tight mb-1.5 ${
              template === "modern-clean" ? "text-sky-900" : "text-slate-900"
            }`}
          >
            {cv.contact.fullName || "Your Full Name"}
          </h1>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
            {cv.contact.email && <span>{cv.contact.email}</span>}
            {cv.contact.phone && <span>• {cv.contact.phone}</span>}
            {cv.contact.location && <span>• {cv.contact.location}</span>}
            {cv.contact.linkedinUrl && <span>• {cv.contact.linkedinUrl}</span>}
            {cv.contact.portfolioUrl && <span>• {cv.contact.portfolioUrl}</span>}
          </div>
        </div>

        {/* Summary */}
        {cv.professionalSummary && (
          <div className="mb-5">
            <h2
              className={`text-xs font-bold uppercase tracking-wider mb-1.5 pb-0.5 border-b ${
                template === "modern-clean" ? "text-sky-900 border-sky-200" : "text-slate-900 border-slate-300"
              }`}
            >
              Professional Summary
            </h2>
            <p className="text-xs leading-relaxed text-slate-700">{cv.professionalSummary}</p>
          </div>
        )}

        {/* Skills */}
        {cv.skills.length > 0 && (
          <div className="mb-5">
            <h2
              className={`text-xs font-bold uppercase tracking-wider mb-1.5 pb-0.5 border-b ${
                template === "modern-clean" ? "text-sky-900 border-sky-200" : "text-slate-900 border-slate-300"
              }`}
            >
              Core Competencies & Skills
            </h2>
            <p className="text-xs leading-relaxed text-slate-700">{cv.skills.join("  •  ")}</p>
          </div>
        )}

        {/* Work Experience */}
        {cv.experience.length > 0 && (
          <div className="mb-5">
            <h2
              className={`text-xs font-bold uppercase tracking-wider mb-2 pb-0.5 border-b ${
                template === "modern-clean" ? "text-sky-900 border-sky-200" : "text-slate-900 border-slate-300"
              }`}
            >
              Professional Experience
            </h2>
            <div className="space-y-4">
              {cv.experience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="font-bold text-slate-900">{exp.jobTitle}</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {exp.startDate} – {exp.endDate}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 italic mb-1.5">
                    {exp.employer} {exp.location ? `| ${exp.location}` : ""}
                  </div>
                  {exp.bullets.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="leading-relaxed">
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {cv.education.length > 0 && (
          <div className="mb-5">
            <h2
              className={`text-xs font-bold uppercase tracking-wider mb-2 pb-0.5 border-b ${
                template === "modern-clean" ? "text-sky-900 border-sky-200" : "text-slate-900 border-slate-300"
              }`}
            >
              Education
            </h2>
            <div className="space-y-2">
              {cv.education.map((edu, idx) => (
                <div key={edu.id || idx} className="text-xs flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-slate-900">{edu.degree}</span>
                    {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
                    <div className="text-slate-600">{edu.institution}</div>
                  </div>
                  {edu.graduationDate && (
                    <span className="text-slate-500 text-[11px] font-mono">{edu.graduationDate}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {cv.certifications.length > 0 && (
          <div>
            <h2
              className={`text-xs font-bold uppercase tracking-wider mb-1.5 pb-0.5 border-b ${
                template === "modern-clean" ? "text-sky-900 border-sky-200" : "text-slate-900 border-slate-300"
              }`}
            >
              Certifications
            </h2>
            <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-700">
              {cv.certifications.map((c, idx) => (
                <li key={c.id || idx}>
                  <strong className="text-slate-900">{c.name}</strong> — {c.issuer} {c.date ? `(${c.date})` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
