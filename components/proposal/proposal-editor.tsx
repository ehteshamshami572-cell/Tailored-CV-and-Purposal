"use client";

import * as React from "react";
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  Calendar,
  Layers,
  Sparkles,
  DollarSign,
  Send,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { ProposalOutput, ProposalSection } from "@/types/proposal";

interface ProposalEditorProps {
  proposal: ProposalOutput;
  onChange: (updated: ProposalOutput) => void;
  onRegenerateSection?: (sectionId: string) => void;
  isRegeneratingSection?: boolean;
}

export function ProposalEditor({
  proposal,
  onChange,
  onRegenerateSection,
  isRegeneratingSection = false,
}: ProposalEditorProps) {
  // Update section title or content
  const handleSectionChange = (sectionIdx: number, field: "title" | "content", val: string) => {
    const newSections = [...proposal.sections];
    newSections[sectionIdx] = {
      ...newSections[sectionIdx],
      [field]: val,
    };
    onChange({ ...proposal, sections: newSections });
  };

  const addSection = () => {
    const newSection: ProposalSection = {
      id: `sec-${Date.now()}`,
      title: "New Custom Section",
      content: "Detail the specific terms, technical architecture, or approach here...",
    };
    onChange({ ...proposal, sections: [...proposal.sections, newSection] });
  };

  const removeSection = (sectionIdx: number) => {
    const newSections = proposal.sections.filter((_, idx) => idx !== sectionIdx);
    onChange({ ...proposal, sections: newSections });
  };

  // Deliverables
  const handleDeliverableChange = (idx: number, val: string) => {
    const newDeliverables = [...proposal.deliverables];
    newDeliverables[idx] = val;
    onChange({ ...proposal, deliverables: newDeliverables });
  };

  const addDeliverable = () => {
    onChange({ ...proposal, deliverables: [...proposal.deliverables, "New project deliverable item..."] });
  };

  const removeDeliverable = (idx: number) => {
    onChange({ ...proposal, deliverables: proposal.deliverables.filter((_, i) => i !== idx) });
  };

  // Milestones
  const handleMilestoneChange = (
    idx: number,
    field: "name" | "description" | "estimatedDuration",
    val: string
  ) => {
    const newMilestones = [...proposal.milestones];
    newMilestones[idx] = {
      ...newMilestones[idx],
      [field]: val,
    };
    onChange({ ...proposal, milestones: newMilestones });
  };

  const addMilestone = () => {
    onChange({
      ...proposal,
      milestones: [
        ...proposal.milestones,
        {
          name: `Phase ${proposal.milestones.length + 1}: Custom Milestone`,
          description: "Milestone scope and review criteria...",
          estimatedDuration: "2 Weeks",
        },
      ],
    });
  };

  const removeMilestone = (idx: number) => {
    onChange({ ...proposal, milestones: proposal.milestones.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-6">
      {/* Document Metadata Card */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Document Header & Representation
            </span>
            <Badge variant="outline" className="text-xs uppercase font-mono">
              {proposal.applicantType} Mode
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Proposal Title</label>
            <Input
              value={proposal.title}
              onChange={(e) => onChange({ ...proposal, title: e.target.value })}
              className="h-8 text-xs font-semibold"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Client Name</label>
            <Input
              value={proposal.clientName || ""}
              onChange={(e) => onChange({ ...proposal, clientName: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              {proposal.applicantType === "agency" ? "Agency Name" : "Applicant Name"}
            </label>
            <Input
              value={proposal.applicantName || ""}
              onChange={(e) => onChange({ ...proposal, applicantName: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Textarea
            rows={4}
            value={proposal.executiveSummary}
            onChange={(e) => onChange({ ...proposal, executiveSummary: e.target.value })}
            className="text-xs leading-relaxed"
          />
        </CardContent>
      </Card>

      {/* Proposal Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Detailed Proposal Sections ({proposal.sections.length})
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addSection} className="text-xs h-7 gap-1">
            <Plus className="h-3.5 w-3.5" />
            Add Section
          </Button>
        </div>

        {proposal.sections.map((section, idx) => (
          <Card key={section.id || idx}>
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between gap-3">
              <Input
                value={section.title}
                onChange={(e) => handleSectionChange(idx, "title", e.target.value)}
                className="h-8 text-xs font-semibold max-w-md bg-transparent"
              />
              <div className="flex items-center gap-1">
                {onRegenerateSection && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRegenerateSection(section.id)}
                    disabled={isRegeneratingSection}
                    className="text-xs h-7 gap-1 text-muted-foreground hover:text-foreground"
                    title="Regenerate this section with AI"
                  >
                    <Sparkles className="h-3 w-3" />
                    Regenerate
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSection(idx)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  title="Remove section"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Textarea
                rows={5}
                value={section.content}
                onChange={(e) => handleSectionChange(idx, "content", e.target.value)}
                className="text-xs leading-relaxed"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Deliverables */}
      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            Key Deliverables ({proposal.deliverables.length})
          </CardTitle>
          <Button type="button" variant="ghost" size="sm" onClick={addDeliverable} className="text-xs h-7 gap-1">
            <Plus className="h-3 w-3" />
            Add Deliverable
          </Button>
        </CardHeader>
        <CardContent className="pt-4 space-y-2">
          {proposal.deliverables.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary">✓</span>
              <Input
                value={item}
                onChange={(e) => handleDeliverableChange(idx, e.target.value)}
                className="h-8 text-xs flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeDeliverable(idx)}
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Project Milestones & Timeline ({proposal.milestones.length})
          </CardTitle>
          <Button type="button" variant="ghost" size="sm" onClick={addMilestone} className="text-xs h-7 gap-1">
            <Plus className="h-3 w-3" />
            Add Milestone
          </Button>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {proposal.milestones.map((m, idx) => (
            <div key={idx} className="border rounded-lg p-3 bg-muted/20 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <Input
                  value={m.name}
                  onChange={(e) => handleMilestoneChange(idx, "name", e.target.value)}
                  className="h-7 text-xs font-semibold flex-1"
                  placeholder="Milestone name"
                />
                <Input
                  value={m.estimatedDuration || ""}
                  onChange={(e) => handleMilestoneChange(idx, "estimatedDuration", e.target.value)}
                  className="h-7 text-xs w-28 font-mono"
                  placeholder="e.g. 2 Weeks"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMilestone(idx)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Textarea
                rows={2}
                value={m.description}
                onChange={(e) => handleMilestoneChange(idx, "description", e.target.value)}
                className="text-xs"
                placeholder="Milestone deliverables and review criteria..."
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pricing & Next Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Investment & Pricing Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Textarea
              rows={4}
              value={proposal.pricingSummary || ""}
              onChange={(e) => onChange({ ...proposal, pricingSummary: e.target.value })}
              className="text-xs leading-relaxed"
              placeholder="Commercial terms, payment milestones, or pricing notes..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Send className="h-4 w-4 text-primary" />
              Next Steps & Kickoff
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Textarea
              rows={4}
              value={proposal.nextSteps}
              onChange={(e) => onChange({ ...proposal, nextSteps: e.target.value })}
              className="text-xs leading-relaxed"
              placeholder="Immediate next steps to formalize agreement and schedule discovery..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
