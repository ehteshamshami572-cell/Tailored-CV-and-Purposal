"use client";

import * as React from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/toast";
import { formatFileSize } from "@/lib/utils/formatters";
import type { ParsedCV } from "@/types/resume";
import type { ParseCvApiResponse } from "@/types/api";

interface ResumeUploadProps {
  onParsed: (data: ParseCvApiResponse) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function ResumeUpload({ onParsed, isLoading, setIsLoading }: ResumeUploadProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    const validExtensions = [".pdf", ".docx", ".txt"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();

    if (!validExtensions.includes(ext)) {
      setErrorMessage("Unsupported file format. Please upload a PDF (.pdf), Word document (.docx), or plain text (.txt).");
      return;
    }

    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxBytes) {
      setErrorMessage("File exceeds the 10 MB limit. Please upload a smaller document.");
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUploadAndParse = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setErrorMessage(null);
    toast.info("Extracting document text and structuring CV with AI...", "Parsing Started");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to parse document. Please check the file and try again.");
      }

      onParsed(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error parsing CV";
      setErrorMessage(msg);
      toast.error(msg, "Extraction Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Extraction Failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
            dragActive
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-muted/40"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <UploadCloud className="h-7 w-7" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            Drag & drop your CV here, or click to browse
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            Supported formats: PDF, DOCX, TXT (Maximum file size: 10MB)
          </p>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted px-3 py-1 rounded-full">
            <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Files are processed in-memory and never stored on public servers</span>
          </div>
        </div>
      ) : (
        <div className="border rounded-xl p-6 bg-card">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground line-clamp-1">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedFile(null);
                setErrorMessage(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              disabled={isLoading}
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedFile(null);
                setErrorMessage(null);
              }}
              disabled={isLoading}
            >
              Choose Different File
            </Button>
            <Button
              type="button"
              onClick={handleUploadAndParse}
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? "Parsing Document..." : "Extract & Review CV"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
