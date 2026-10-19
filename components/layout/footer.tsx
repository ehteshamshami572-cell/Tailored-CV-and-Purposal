import { Shield, Lock, FileCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card text-card-foreground mt-auto">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <FileCheck className="h-4 w-4 text-primary" />
              CraftForge AI Studio
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Production-grade AI tools for job seekers and agency professionals. Real-time document parsing,
              truthful CV tailoring, and agency/individual proposal generation with ATS-friendly vector PDF exports.
            </p>
          </div>

          <div>
            <div className="font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-emerald-600" />
              Strict Privacy & Security
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Your uploaded documents are processed entirely in server memory and discarded immediately after parsing.
              No CVs or proposals are ever stored in public buckets, training corpuses, or persistent databases.
            </p>
          </div>

          <div>
            <div className="font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-primary" />
              Factual Truthfulness Guardrail
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Our AI prompts enforce strict factual accuracy. The engine reframes and highlights your genuine
              accomplishments without fabricating false degrees, metrics, dates, or skills.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} CraftForge AI Studio. Built with Next.js, TypeScript & Tailwind CSS.</p>
          <p className="mt-2 sm:mt-0">Compliant with ATS Parsing Standards • RFC-compliant Vector PDFs</p>
        </div>
      </div>
    </footer>
  );
}
