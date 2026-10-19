export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, string[] | string>;
}

export interface ParseCvApiResponse {
  parsedCV: import("./resume").ParsedCV;
  fileName: string;
  fileSizeBytes: number;
  wordCount: number;
  rawTextPreview: string;
}

export interface TailorCvApiRequest {
  parsedCV: import("./resume").ParsedCV;
  jobDescription: string;
  targetJobTitle?: string;
  companyName?: string;
}

export interface TailorCvApiResponse {
  analysis: import("./resume").JobDescriptionAnalysis;
  tailoredCV: import("./resume").ParsedCV;
  changeSummary: import("./resume").ResumeChangeSummary;
}

export interface ExportResumePdfRequest {
  cv: import("./resume").ParsedCV;
  templateId?: import("./resume").ResumeTemplateId;
}

export interface GenerateProposalApiRequest {
  input: import("./proposal").ProposalInput;
}

export interface GenerateProposalApiResponse {
  proposal: import("./proposal").ProposalOutput;
}

export interface ExportProposalPdfRequest {
  proposal: import("./proposal").ProposalOutput;
  templateId?: import("./proposal").ProposalTemplateId;
}
