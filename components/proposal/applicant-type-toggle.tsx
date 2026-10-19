"use client";

import * as React from "react";
import { Users, User, CheckCircle2 } from "lucide-react";
import type { ApplicantType } from "@/types/proposal";

interface ApplicantTypeToggleProps {
  value: ApplicantType;
  onChange: (val: ApplicantType) => void;
  disabled?: boolean;
}

export function ApplicantTypeToggle({ value, onChange, disabled }: ApplicantTypeToggleProps) {
  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold text-foreground block">
        Applicant Representation Model <span className="text-destructive">*</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Agency Option */}
        <div
          onClick={() => !disabled && onChange("agency")}
          className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all select-none ${
            value === "agency"
              ? "border-primary bg-primary/[0.04] shadow-sm"
              : "border-border hover:border-primary/40 bg-card"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                  value === "agency" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="font-semibold text-sm text-foreground block">Agency / Studio</span>
                <span className="text-[11px] text-muted-foreground">Team & Corporate Delivery</span>
              </div>
            </div>

            {value === "agency" && <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />}
          </div>

          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            Positions the applicant as an organized firm with multi-disciplinary coverage, dedicated project
            management, QA governance, and collaborative squad delivery.
          </p>
        </div>

        {/* Individual Option */}
        <div
          onClick={() => !disabled && onChange("individual")}
          className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all select-none ${
            value === "individual"
              ? "border-primary bg-primary/[0.04] shadow-sm"
              : "border-border hover:border-primary/40 bg-card"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                  value === "individual" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <User className="h-5 w-5" />
              </div>
              <div>
                <span className="font-semibold text-sm text-foreground block">Individual Specialist</span>
                <span className="text-[11px] text-muted-foreground">Consultant & Freelancer</span>
              </div>
            </div>

            {value === "individual" && <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />}
          </div>

          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            Positions the applicant as a principal specialist with direct 1-on-1 accountability, agile turnaround,
            first-person narrative ("I will..."), and zero agency overhead.
          </p>
        </div>
      </div>
    </div>
  );
}
