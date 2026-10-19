"use client";

import * as React from "react";
import { Sparkles, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ResumeChangeSummary } from "@/types/resume";

export function ChangeSummaryView({ changeSummary }: { changeSummary: ResumeChangeSummary }) {
  return (
    <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-500/[0.03]">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            AI Tailoring Audit & Change Log
          </CardTitle>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>100% Factual Integrity Preserved</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-3 text-xs space-y-3">
        {changeSummary.summary.length > 0 && (
          <div>
            <span className="font-semibold text-foreground block mb-1">Professional Summary Refinements:</span>
            <ul className="space-y-1 text-muted-foreground">
              {changeSummary.summary.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {changeSummary.skillsAddedOrEmphasized.length > 0 && (
          <div className="pt-2 border-t">
            <span className="font-semibold text-foreground block mb-1">Skill Prioritization & Alignment:</span>
            <ul className="space-y-1 text-muted-foreground">
              {changeSummary.skillsAddedOrEmphasized.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {changeSummary.experienceRefinements.length > 0 && (
          <div className="pt-2 border-t">
            <span className="font-semibold text-foreground block mb-1">Work Experience Impact Updates:</span>
            <ul className="space-y-1 text-muted-foreground">
              {changeSummary.experienceRefinements.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
