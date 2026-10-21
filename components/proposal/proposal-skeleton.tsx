import { Skeleton } from "@/components/ui/skeleton";
import { Send } from "lucide-react";

export function ProposalGeneratingSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Send className="h-5 w-5 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <span className="text-sm font-semibold text-foreground">
              Formulating Proposal &amp; Delivery Strategy...
            </span>
            <p className="text-xs text-muted-foreground">
              Structuring executive summary, deliverables, scope milestones, and investment breakdown.
            </p>
          </div>
        </div>
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>

      {/* Main Proposal Document Skeleton */}
      <div className="border rounded-xl p-8 sm:p-12 shadow-sm bg-card space-y-8">
        <div className="space-y-3 border-b pb-6">
          <Skeleton className="h-5 w-36 rounded-full" />
          <Skeleton className="h-8 w-2/3" />
          <div className="flex gap-4">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        </div>

        {/* Executive summary skeleton */}
        <div className="p-4 rounded-lg bg-muted/40 space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-11/12" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>

        {/* Sections skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-60 border-b pb-1" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>

        {/* Deliverables skeleton */}
        <div className="space-y-2.5">
          <Skeleton className="h-5 w-52 border-b pb-1" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>

        {/* Milestones skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-56 border-b pb-1" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
