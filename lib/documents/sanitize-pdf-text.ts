import type { PDFFont } from "pdf-lib";

/**
 * Sanitizes text to be 100% compliant with WinAnsi / Standard PDF fonts (Helvetica, Times, etc.).
 * Replaces non-breaking hyphens (0x2011), special dashes, smart quotes, and unencodable unicode
 * with standard ASCII equivalents, preventing "WinAnsi cannot encode" export errors.
 */
export function sanitizeForPdf(text: string, font?: PDFFont): string {
  if (!text) return "";

  // 1. Substitute common incompatible Unicode characters
  let s = text
    .replace(/[\u2010\u2011\u2012\u2212\uFE63\uFF0D]/g, "-") // Non-breaking hyphens (0x2011), figure dashes, minus
    .replace(/[\u2013\u2014\u2015]/g, "-") // En-dash, em-dash, horizontal bar -> standard hyphen
    .replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, " ") // Non-breaking spaces and ideographic spaces
    .replace(/[\u200B\u200C\u200D\uFEFF\u200E\u200F]/g, "") // Zero-width spaces & formatting marks
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'") // Smart single quotes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"') // Smart double quotes
    .replace(/\u2026/g, "...") // Ellipsis
    .replace(/[\u25E6\u25AA\u25AB\u2023\u2219]/g, "•") // Bullet variants
    .replace(/[\u2713\u2714\u2611]/g, "•"); // Checkmarks

  // 2. Strict character-by-character validation if font is supplied
  if (font) {
    let result = "";
    for (const char of s) {
      try {
        font.encodeText(char);
        result += char;
      } catch {
        // Fallback for emojis, special math symbols, or unknown code points
        result += " ";
      }
    }
    return result;
  }

  return s;
}
