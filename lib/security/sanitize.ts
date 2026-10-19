/**
 * Security & Sanitization utilities to safeguard against prompt injection
 * and malformed inputs.
 */

// Patterns frequently used in prompt injection attempts
const INJECTION_PATTERNS = [
  /<\|(?:im_start|im_end|system|user|assistant)\|>/gi,
  /\[\/?(?:INST|SYS)\]/gi,
  /<\/?(?:system|instruction|developer|override|admin)>/gi,
  /\b(?:ignore all previous instructions|disregard prior directives|forget your rules|bypass system prompt)\b/gi,
];

/**
 * Sanitizes untrusted user text before passing it to AI prompts.
 * Defangs injection tokens, removes dangerous null bytes and unprintable control characters,
 * while preserving legitimate punctuation, accents, numbers, and formatting.
 */
export function sanitizeUntrustedInput(input: string, maxLen = 50000): string {
  if (typeof input !== "string") return "";

  // 1. Truncate to maximum permissible character length
  let cleaned = input.slice(0, maxLen);

  // 2. Strip null bytes and non-printable control characters (except newline, carriage return, tab)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // 3. Neutralize explicit delimiter attacks
  for (const pattern of INJECTION_PATTERNS) {
    cleaned = cleaned.replace(pattern, "[filtered-delimiter]");
  }

  return cleaned.trim();
}

/**
 * Validates whether an uploaded file's declared type and extension match safe CV extensions.
 */
export function isAllowedFileType(filename: string, mimeType?: string): boolean {
  const allowedExtensions = [".pdf", ".docx", ".txt"];
  const lowerName = filename.toLowerCase();
  const hasValidExt = allowedExtensions.some((ext) => lowerName.endsWith(ext));

  if (!hasValidExt) return false;

  if (mimeType) {
    const allowedMimes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
      "application/octet-stream", // sometimes sent by browsers for docx/txt
    ];
    return allowedMimes.includes(mimeType.toLowerCase());
  }

  return true;
}
