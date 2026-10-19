import { NextRequest, NextResponse } from "next/server";
import { isAllowedFileType, sanitizeUntrustedInput } from "@/lib/security/sanitize";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { parsePdfBuffer } from "@/lib/documents/parse-pdf";
import { parseDocxBuffer } from "@/lib/documents/parse-docx";
import { parseTextBuffer } from "@/lib/documents/parse-text";
import { callAIWithJsonOutput } from "@/lib/ai/provider";
import { RESUME_PARSE_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { ParsedCVSchema } from "@/lib/validation/resume-schema";
import type { ParsedCV } from "@/types/resume";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting
    const ip = req.headers.get("x-forwarded-for") || "local-client";
    const limit = checkRateLimit(ip, 20, 60000);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait a moment before uploading again." },
        { status: 429 }
      );
    }

    // 2. Read multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file was uploaded. Please select a valid CV document." },
        { status: 400 }
      );
    }

    // 3. Validate file size
    const maxMb = parseInt(process.env.MAX_UPLOAD_SIZE_MB || "10", 10);
    const maxBytes = maxMb * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { success: false, error: `File exceeds maximum permissible size of ${maxMb}MB.` },
        { status: 400 }
      );
    }

    // 4. Validate extension and mime
    if (!isAllowedFileType(file.name, file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file format. Please upload a PDF (.pdf), Word document (.docx), or plain text (.txt).",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Extract text based on file format
    const lowerName = file.name.toLowerCase();
    let extractedText = "";
    let wordCount = 0;
    let isLikelyScanned = false;

    if (lowerName.endsWith(".pdf")) {
      const parsed = await parsePdfBuffer(buffer);
      extractedText = parsed.text;
      wordCount = parsed.wordCount;
      isLikelyScanned = parsed.isLikelyScanned;
    } else if (lowerName.endsWith(".docx")) {
      const parsed = await parseDocxBuffer(buffer);
      extractedText = parsed.text;
      wordCount = parsed.wordCount;
      isLikelyScanned = parsed.isLikelyScanned;
    } else {
      const parsed = parseTextBuffer(buffer);
      extractedText = parsed.text;
      wordCount = parsed.wordCount;
      isLikelyScanned = parsed.isLikelyScanned;
    }

    // 6. Handle empty or unreadable extractions
    if (isLikelyScanned || wordCount < 15) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The uploaded document contains unreadable or insufficient text. If this is a scanned image PDF, please provide an OCR-converted document or a text-based PDF/Word file.",
        },
        { status: 422 }
      );
    }

    // 7. Structure the extracted text using AI
    const sanitizedCVText = sanitizeUntrustedInput(extractedText, 25000);
    const parsedCV = await callAIWithJsonOutput<ParsedCV>({
      systemPrompt: RESUME_PARSE_SYSTEM_PROMPT,
      userPrompt: `Extract structured data from this CV text:\n\n${sanitizedCVText}`,
      temperature: 0.1,
    });

    // 8. Validate against Zod schema
    const validationResult = ParsedCVSchema.safeParse(parsedCV);
    const validatedCV = validationResult.success ? validationResult.data : parsedCV;

    // Attach raw text preview for review
    validatedCV.rawText = extractedText.slice(0, 1000);

    return NextResponse.json({
      success: true,
      data: {
        parsedCV: validatedCV,
        fileName: file.name,
        fileSizeBytes: file.size,
        wordCount,
        rawTextPreview: extractedText.slice(0, 500),
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "An unexpected server error occurred during parsing.";
    console.error("[API Parse Error]:", err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
