"use client";

import * as React from "react";
import { CheckCircle2, User, Briefcase, GraduationCap, Award, Wrench, Eye, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ParsedCV } from "@/types/resume";

interface ParsedCvReviewProps {
  parsedCV: ParsedCV;
  fileName: string;
  wordCount: number;
  onProceedToJobDescription: () => void;
  onReset: () => void;
}

export function ParsedCvReview({
  parsedCV,
  fileName,
  wordCount,
  onProceedToJobDescription,
  onReset,
}: ParsedCvReviewProps) {
  const [showRawText, setShowRawText] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
              Successfully Extracted CV Data
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Source: <span className="font-medium">{fileName}</span> ({wordCount} words extracted)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {parsedCV.rawText && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowRawText(!showRawText)}
              className="text-xs"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              {showRawText ? "Hide Raw Preview" : "View Raw Text"}
            </Button>
          )}
          <Button
            type="button"
            onClick={onProceedToJobDescription}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs"
          >
            <span>Proceed to Job Description</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      </div>

      {/* Raw Text Drawer if toggled */}
      {showRawText && parsedCV.rawText && (
        <Card className="bg-muted/40">
          <CardHeader className="py-3 px-4 border-b">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Extracted Raw Text Snippet
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
              {parsedCV.rawText}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Structured Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact & Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Contact & Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div>
              <span className="text-muted-foreground">Full Name: </span>
              <span className="font-semibold text-foreground">
                {parsedCV.contact.fullName || "Not detected"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Email: </span>
              <span className="font-medium">{parsedCV.contact.email || "Not detected"}</span>
            </div>
            {parsedCV.contact.phone && (
              <div>
                <span className="text-muted-foreground">Phone: </span>
                <span>{parsedCV.contact.phone}</span>
              </div>
            )}
            {parsedCV.contact.location && (
              <div>
                <span className="text-muted-foreground">Location: </span>
                <span>{parsedCV.contact.location}</span>
              </div>
            )}
            {parsedCV.professionalSummary && (
              <div className="pt-2 border-t mt-2">
                <span className="font-semibold block mb-1 text-foreground">Professional Summary:</span>
                <p className="text-muted-foreground leading-relaxed italic line-clamp-4">
                  "{parsedCV.professionalSummary}"
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" />
              Detected Skills ({parsedCV.skills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {parsedCV.skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                {parsedCV.skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs font-normal">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No specific skills listed or detected.</p>
            )}
          </CardContent>
        </Card>

        {/* Work Experience */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              Work History ({parsedCV.experience.length} roles found)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsedCV.experience.length > 0 ? (
              parsedCV.experience.map((exp, idx) => (
                <div key={exp.id || idx} className="border-b last:border-b-0 pb-3 last:pb-0 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <span className="font-semibold text-foreground text-sm">
                      {exp.jobTitle} <span className="font-normal text-muted-foreground">at</span> {exp.employer}
                    </span>
                    <span className="text-muted-foreground font-mono text-[11px]">
                      {exp.startDate} – {exp.endDate}
                    </span>
                  </div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1 mt-1">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="line-clamp-2">
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No work experience entries parsed.</p>
            )}
          </CardContent>
        </Card>

        {/* Education & Certifications */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Education & Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-semibold text-foreground block mb-2">Education:</span>
              {parsedCV.education.length > 0 ? (
                <ul className="space-y-2">
                  {parsedCV.education.map((edu, idx) => (
                    <li key={edu.id || idx} className="text-muted-foreground">
                      <strong className="text-foreground">{edu.degree}</strong>
                      {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
                      <div className="text-[11px]">
                        {edu.institution} {edu.graduationDate ? `(${edu.graduationDate})` : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No education listed.</p>
              )}
            </div>

            <div>
              <span className="font-semibold text-foreground block mb-2">Certifications:</span>
              {parsedCV.certifications.length > 0 ? (
                <ul className="space-y-1.5">
                  {parsedCV.certifications.map((cert, idx) => (
                    <li key={cert.id || idx} className="text-muted-foreground">
                      <strong className="text-foreground">{cert.name}</strong> — {cert.issuer}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No certifications listed.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size="sm" onClick={onReset} className="text-xs text-muted-foreground">
          Replace CV Document
        </Button>
        <Button onClick={onProceedToJobDescription} className="gap-2">
          <span>Continue to Job Description</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
