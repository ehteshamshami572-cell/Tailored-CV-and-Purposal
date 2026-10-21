import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Sparkles, FileText } from "lucide-react";

export function CvParsingSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact info card skeleton */}
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-16 w-full mt-2" />
          </CardContent>
        </Card>

        {/* Skills card skeleton */}
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-14 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-18 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
          </CardContent>
        </Card>

        {/* Work experience skeleton */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 border-b pb-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-52" />
                <Skeleton className="h-3.5 w-24" />
              </div>
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-5/6" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3.5 w-24" />
              </div>
              <Skeleton className="h-3 w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function CvTailoringSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-primary/20 bg-primary/[0.03]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles className="h-5 w-5 animate-spin" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">AI Career Strategist is Tailoring Your CV...</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Aligning competency keywords, refining impact bullets, and ensuring strict factual accuracy.
            </p>
          </div>
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 border-b pb-2">
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>

      {/* Main Resume Document Skeleton */}
      <div className="border rounded-xl p-8 sm:p-12 shadow-sm bg-card space-y-6">
        <div className="space-y-2 border-b pb-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-3.5 w-80" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-44" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-6 w-24 rounded-md" />
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-28 rounded-md" />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <Skeleton className="h-4 w-40" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3.5 w-24" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
