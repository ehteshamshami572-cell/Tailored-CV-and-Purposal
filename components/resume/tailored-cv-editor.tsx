"use client";

import * as React from "react";
import { User, Briefcase, GraduationCap, Wrench, RotateCcw, Plus, Trash2, Award, FolderGit2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import type { ParsedCV } from "@/types/resume";

interface TailoredCvEditorProps {
  cv: ParsedCV;
  originalCV: ParsedCV;
  onChange: (updated: ParsedCV) => void;
}

export function TailoredCvEditor({ cv, originalCV, onChange }: TailoredCvEditorProps) {
  const [newSkill, setNewSkill] = React.useState("");

  // Contact field updates
  const handleContactChange = (field: keyof typeof cv.contact, val: string) => {
    onChange({
      ...cv,
      contact: {
        ...cv.contact,
        [field]: val,
      },
    });
  };

  // Summary update
  const handleSummaryChange = (val: string) => {
    onChange({ ...cv, professionalSummary: val });
  };

  // Restore summary
  const restoreSummary = () => {
    onChange({ ...cv, professionalSummary: originalCV.professionalSummary });
    toast.info("Original summary restored.");
  };

  // Skills management
  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !cv.skills.includes(trimmed)) {
      onChange({ ...cv, skills: [...cv.skills, trimmed] });
      setNewSkill("");
      toast.success(`Skill "${trimmed}" added.`);
    }
  };

  const removeSkill = (index: number) => {
    const skillName = cv.skills[index];
    const updated = cv.skills.filter((_, i) => i !== index);
    onChange({ ...cv, skills: updated });
    toast.info(`Skill "${skillName}" removed.`);
  };

  const restoreSkills = () => {
    onChange({ ...cv, skills: [...originalCV.skills] });
    toast.info("Original skills restored.");
  };

  // Experience updates
  const handleExpBulletChange = (expIdx: number, bulletIdx: number, val: string) => {
    const newExp = [...cv.experience];
    const newBullets = [...newExp[expIdx].bullets];
    newBullets[bulletIdx] = val;
    newExp[expIdx] = { ...newExp[expIdx], bullets: newBullets };
    onChange({ ...cv, experience: newExp });
  };

  const addExpBullet = (expIdx: number) => {
    const newExp = [...cv.experience];
    newExp[expIdx] = {
      ...newExp[expIdx],
      bullets: [...newExp[expIdx].bullets, "Delivered measurable results by..."],
    };
    onChange({ ...cv, experience: newExp });
    toast.info("New bullet point added.");
  };

  const removeExpBullet = (expIdx: number, bulletIdx: number) => {
    const newExp = [...cv.experience];
    newExp[expIdx] = {
      ...newExp[expIdx],
      bullets: newExp[expIdx].bullets.filter((_, i) => i !== bulletIdx),
    };
    onChange({ ...cv, experience: newExp });
    toast.info("Bullet point removed.");
  };

  const restoreExperience = () => {
    onChange({ ...cv, experience: JSON.parse(JSON.stringify(originalCV.experience)) });
    toast.info("Original work experience restored.");
  };

  return (
    <div className="space-y-6">
      {/* Contact Section */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Full Name</label>
            <Input
              value={cv.contact.fullName}
              onChange={(e) => handleContactChange("fullName", e.target.value)}
              className="h-8 text-xs font-medium"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Email</label>
            <Input
              value={cv.contact.email}
              onChange={(e) => handleContactChange("email", e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Phone</label>
            <Input
              value={cv.contact.phone || ""}
              onChange={(e) => handleContactChange("phone", e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Location</label>
            <Input
              value={cv.contact.location || ""}
              onChange={(e) => handleContactChange("location", e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">LinkedIn Profile</label>
            <Input
              value={cv.contact.linkedinUrl || ""}
              onChange={(e) => handleContactChange("linkedinUrl", e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Portfolio / GitHub</label>
            <Input
              value={cv.contact.portfolioUrl || cv.contact.githubUrl || ""}
              onChange={(e) => handleContactChange("portfolioUrl", e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Professional Summary */}
      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Tailored Professional Summary
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={restoreSummary}
            className="text-xs h-7 gap-1 text-muted-foreground hover:text-foreground"
            title="Revert to original extracted summary"
          >
            <RotateCcw className="h-3 w-3" />
            Restore Original
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <Textarea
            rows={4}
            value={cv.professionalSummary}
            onChange={(e) => handleSummaryChange(e.target.value)}
            className="text-xs leading-relaxed"
          />
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            Tailored Skills ({cv.skills.length})
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={restoreSkills}
            className="text-xs h-7 gap-1 text-muted-foreground hover:text-foreground"
            title="Revert to original extracted skills"
          >
            <RotateCcw className="h-3 w-3" />
            Restore Original
          </Button>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {cv.skills.map((skill, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs pr-1 flex items-center gap-1">
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(idx)}
                  className="hover:text-destructive p-0.5 rounded"
                  title="Remove skill"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Input
              placeholder="Add another verified skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              className="h-8 text-xs max-w-xs"
            />
            <Button type="button" size="sm" variant="outline" onClick={addSkill} className="h-8 text-xs gap-1">
              <Plus className="h-3 w-3" />
              Add Skill
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Professional Work Experience ({cv.experience.length})
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={restoreExperience}
            className="text-xs h-7 gap-1 text-muted-foreground hover:text-foreground"
            title="Revert to original experience bullets"
          >
            <RotateCcw className="h-3 w-3" />
            Restore Original
          </Button>
        </CardHeader>
        <CardContent className="pt-4 space-y-6">
          {cv.experience.map((exp, expIdx) => (
            <div key={exp.id || expIdx} className="border rounded-lg p-4 bg-muted/20 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {exp.jobTitle} <span className="text-muted-foreground font-normal">at</span> {exp.employer}
                  </h4>
                  {exp.location && <span className="text-[11px] text-muted-foreground">{exp.location}</span>}
                </div>
                <Badge variant="outline" className="font-mono text-[10px] self-start sm:self-auto">
                  {exp.startDate} – {exp.endDate}
                </Badge>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  Tailored Achievement Bullets:
                </span>
                {exp.bullets.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-1 text-xs">•</span>
                    <Textarea
                      rows={2}
                      value={bullet}
                      onChange={(e) => handleExpBulletChange(expIdx, bIdx, e.target.value)}
                      className="text-xs leading-relaxed flex-1 py-1 px-2"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExpBullet(expIdx, bIdx)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                      title="Remove bullet"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addExpBullet(expIdx)}
                  className="h-7 text-xs gap-1 mt-1"
                >
                  <Plus className="h-3 w-3" />
                  Add Bullet Point
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      {cv.education.length > 0 && (
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {cv.education.map((edu, idx) => (
              <div key={edu.id || idx} className="text-xs border-b last:border-0 pb-2 last:pb-0">
                <div className="font-semibold text-foreground">
                  {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                </div>
                <div className="text-muted-foreground">
                  {edu.institution} {edu.graduationDate ? `(${edu.graduationDate})` : ""}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
