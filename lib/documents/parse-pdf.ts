import zlib from "zlib";
import { extractText } from "unpdf";
import pdfParse from "pdf-parse";

export interface ParsedDocumentResult {
  text: string;
  pageCount?: number;
  wordCount: number;
  isLikelyScanned: boolean;
}

/**
 * Decodes octal and common escape sequences in PDF literal text strings.
 */
function decodePdfLiteralString(str: string): string {
  return str
    .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\b/g, "\b")
    .replace(/\\f/g, "\f")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\");
}

/**
 * Decodes PDF hex strings, supporting both standard Latin1 and UTF-16BE BOM.
 */
function decodePdfHexString(hex: string): string {
  const cleanHex = hex.trim();
  if (cleanHex.length >= 4 && cleanHex.toUpperCase().startsWith("FEFF")) {
    let res = "";
    for (let i = 4; i < cleanHex.length; i += 4) {
      const code = parseInt(cleanHex.substring(i, i + 4), 16);
      if (!isNaN(code)) res += String.fromCharCode(code);
    }
    return res;
  }

  let res = "";
  for (let i = 0; i < cleanHex.length; i += 2) {
    const code = parseInt(cleanHex.substring(i, i + 2), 16);
    if (!isNaN(code)) res += String.fromCharCode(code);
  }
  return res;
}

/**
 * Extracts text operators (Tj, TJ, hex) from a decompressed PDF content stream.
 */
function parsePdfStreamOperators(streamText: string): string {
  let output = "";

  // 1. Literal text: (Sample Text) Tj
  const tjRegex = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*Tj/g;
  let m;
  while ((m = tjRegex.exec(streamText)) !== null) {
    output += decodePdfLiteralString(m[1]) + " ";
  }

  // 2. Text array: [(Sample) 20 (Text)] TJ
  const arrayTjRegex = /\[(.*?)\]\s*TJ/g;
  while ((m = arrayTjRegex.exec(streamText)) !== null) {
    const inner = m[1];
    const subRegex = /\(([^)\\]*(?:\\.[^)\\]*)*)\)/g;
    let subM;
    while ((subM = subRegex.exec(inner)) !== null) {
      output += decodePdfLiteralString(subM[1]) + " ";
    }
    output += "\n";
  }

  // 3. Hex text: <48656c6c6f> Tj
  const hexTjRegex = /<([0-9a-fA-F]+)>\s*Tj/g;
  while ((m = hexTjRegex.exec(streamText)) !== null) {
    output += decodePdfHexString(m[1]) + " ";
  }

  return output;
}

/**
 * Tier 3 Fallback: Extracts text directly from raw zlib streams.
 * Completely bypasses any corrupted, missing, or malformed XRef table ("bad XRef entry").
 */
function extractRawPdfStreamsFallback(buffer: Buffer): string {
  const binary = buffer.toString("binary");
  let combined = "";

  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;
  while ((match = streamRegex.exec(binary)) !== null) {
    const rawStream = Buffer.from(match[1], "binary");
    let decompressed: Buffer | null = null;

    try {
      decompressed = zlib.inflateSync(rawStream);
    } catch {
      try {
        decompressed = zlib.inflateRawSync(rawStream);
      } catch {
        // Stream may be uncompressed
        decompressed = rawStream;
      }
    }

    if (decompressed) {
      const parsed = parsePdfStreamOperators(decompressed.toString("latin1"));
      if (parsed.trim()) {
        combined += parsed + "\n";
      }
    }
  }

  // Also catch any plain text in BT ... ET blocks outside streams
  const btRegex = /BT([\s\S]*?)ET/g;
  while ((match = btRegex.exec(binary)) !== null) {
    const parsed = parsePdfStreamOperators(match[1]);
    if (parsed.trim()) {
      combined += parsed + "\n";
    }
  }

  return combined
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Multi-Tier PDF Text Extraction Engine:
 * - Tier 1: Modern `unpdf` parser with automated XRef reconstruction.
 * - Tier 2: `pdf-parse` fallback.
 * - Tier 3: Low-level raw stream extraction (impervious to bad XRef entries, corrupt tables, or truncated pointers).
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<ParsedDocumentResult> {
  if (!buffer || buffer.length === 0) {
    throw new Error("Cannot parse empty PDF file.");
  }

  let extractedText = "";
  let pageCount = 1;

  // ----------------------------------------------------
  // TIER 1: Modern `unpdf` Engine (Auto-repairs XRef tables)
  // ----------------------------------------------------
  try {
    const uint8 = new Uint8Array(buffer);
    const result = await extractText(uint8);
    const pages = Array.isArray(result.text) ? result.text : [result.text];
    const textJoined = pages.join("\n").replace(/\r\n/g, "\n").trim();

    if (textJoined.length > 30) {
      extractedText = textJoined;
      pageCount = result.totalPages || pages.length || 1;
    }
  } catch (err) {
    console.warn("[PDF Parser] Tier 1 (unpdf) failed, attempting Tier 2 fallback:", err instanceof Error ? err.message : err);
  }

  // ----------------------------------------------------
  // TIER 2: Legacy `pdf-parse` Engine
  // ----------------------------------------------------
  if (!extractedText || extractedText.length < 30) {
    try {
      const data = await pdfParse(buffer);
      const text = (data.text || "").replace(/\r\n/g, "\n").trim();
      if (text.length > 30) {
        extractedText = text;
        pageCount = data.numpages || 1;
      }
    } catch (err) {
      console.warn("[PDF Parser] Tier 2 (pdf-parse) failed, attempting Tier 3 raw stream fallback:", err instanceof Error ? err.message : err);
    }
  }

  // ----------------------------------------------------
  // TIER 3: Raw Stream Text Recovery (Zero XRef Dependency)
  // ----------------------------------------------------
  if (!extractedText || extractedText.length < 30) {
    try {
      const rawText = extractRawPdfStreamsFallback(buffer);
      if (rawText.length > 20) {
        extractedText = rawText;
      }
    } catch (err) {
      console.warn("[PDF Parser] Tier 3 (raw streams) failed:", err instanceof Error ? err.message : err);
    }
  }

  const cleanText = extractedText.replace(/\r\n/g, "\n").trim();
  const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
  const isLikelyScanned = pageCount >= 1 && words < 15;

  if (words < 10) {
    throw new Error(
      "The uploaded PDF appears to be a scanned image or contains unreadable text. Please provide an OCR-converted document or a text-based PDF/Word file."
    );
  }

  return {
    text: cleanText,
    pageCount,
    wordCount: words,
    isLikelyScanned,
  };
}
