import type { ParsedDocumentResult } from "./parse-pdf";

/**
 * Extracts plain text from a TXT file buffer.
 */
export function parseTextBuffer(buffer: Buffer): ParsedDocumentResult {
  if (!buffer || buffer.length === 0) {
    throw new Error("Cannot parse empty TXT file.");
  }

  const rawText = buffer.toString("utf-8");
  const cleanText = rawText.replace(/\r\n/g, "\n").trim();
  const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;

  return {
    text: cleanText,
    wordCount: words,
    isLikelyScanned: words === 0,
  };
}
