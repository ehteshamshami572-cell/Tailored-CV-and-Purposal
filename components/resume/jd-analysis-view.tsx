"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, Target, KeyRound, ListChecks } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { JobDescriptionAnalysis } from "@/types/resume";

export function JdAnalysisView({ analysis }: { analysis: JobDescriptionAnalysis }) {
  return (
    <Card className="border-primary/20 bg-primary/[0.02]">
      <CardHeader className="pb-3 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Job Description Intelligence Analysis
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Target Role: <strong className="text-foreground">{analysis.targetJobTitle}</strong>
              {analysis.companyName && ` at ${analysis.companyName}`}
            </p>
          </div>
          {analysis.experienceExpectations && (
            <Badge variant="outline" className="text-[11px] self-start sm:self-auto font-mono">
              Exp: {analysis.experienceExpectations}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 text-xs">
        {/* Skills Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <span className="font-semibold text-foreground flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Mandatory / Core Required Skills:
            </span>
            <div className="flex flex-wrap gap-1">
              {analysis.requiredSkills.length > 0 ? (
                analysis.requiredSkills.map((skill, idx) => (
                  <Badge key={idx} variant="default" className="text-[11px] font-normal">
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">None specified</span>
              )}
            </div>
          </div>

          <div>
            <span className="font-semibold text-foreground flex items-center gap-1.5 mb-2">
              <KeyRound className="h-3.5 w-3.5 text-blue-600" />
              Preferred / Secondary Qualifications:
            </span>
            <div className="flex flex-wrap gap-1">
              {analysis.preferredSkills.length > 0 ? (
                analysis.preferredSkills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="text-[11px] font-normal">
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">None specified</span>
              )}
            </div>
          </div>
        </div>

        {/* Identified Gaps */}
        {analysis.identifiedGaps && analysis.identifiedGaps.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
            <span className="font-semibold flex items-center gap-1.5 mb-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Potential Experience & Qualification Gaps:
            </span>
            <p className="text-[11px] text-muted-foreground mb-2">
              The AI preserved factual accuracy and did not fabricate these missing items on your CV. Consider
              addressing them in an interview or cover letter:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              {analysis.identifiedGaps.map((gap, idx) => (
                <li key={idx}>{gap}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
