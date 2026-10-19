import pdfParse from "pdf-parse";

export interface ParsedDocumentResult {
  text: string;
  pageCount?: number;
  wordCount: number;
  isLikelyScanned: boolean;
}

/**
 * Extracts plain text from a PDF file buffer.
 * Detects scanned PDFs where extracted text is empty or too sparse.
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<ParsedDocumentResult> {
  if (!buffer || buffer.length === 0) {
    throw new Error("Cannot parse empty PDF file.");
  }

  try {
    const data = await pdfParse(buffer);
    const rawText = data.text || "";
    const cleanText = rawText.replace(/\r\n/g, "\n").trim();
    const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;

    // If a PDF has several pages but fewer than 25 words, it is almost certainly a scanned image PDF
    const isLikelyScanned = (data.numpages || 1) >= 1 && words < 25;

    return {
      text: cleanText,
      pageCount: data.numpages,
      wordCount: words,
      isLikelyScanned,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to extract text from PDF: ${message}`);
  }
}
