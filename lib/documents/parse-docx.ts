import mammoth from "mammoth";
import type { ParsedDocumentResult } from "./parse-pdf";

/**
 * Extracts plain text from a DOCX Word file buffer.
 */
export async function parseDocxBuffer(buffer: Buffer): Promise<ParsedDocumentResult> {
  if (!buffer || buffer.length === 0) {
    throw new Error("Cannot parse empty DOCX file.");
  }

  try {
    const result = await mammoth.extractRawText({ buffer });
    const rawText = result.value || "";
    const cleanText = rawText.replace(/\r\n/g, "\n").trim();
    const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;

    return {
      text: cleanText,
      wordCount: words,
      isLikelyScanned: words === 0,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to extract text from DOCX: ${message}`);
  }
}
