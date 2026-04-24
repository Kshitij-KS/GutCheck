// lib/security.ts

export interface InjectionCheckResult {
  isSafe: boolean;
  reason?: string;
}

/**
 * Common prompt injection patterns — attacker tries to override the system role.
 * Runs server-side on raw user input before it reaches the LLM.
 */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(previous|above|prior|all)\s+(instructions|prompts|rules|context)/i,
  /you\s+are\s+now\s+(a\s+)?(?!analyzing|scout)/i,
  /act\s+as\s+(a\s+)?(?!clinical|nutritionist|scout)/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /new\s+system\s+prompt/i,
  /override\s+(your\s+)?(instructions|rules|role|system)/i,
  /jailbreak/i,
  /DAN\s+mode/i,
  /disregard\s+(your\s+)?(training|instructions|guidelines)/i,
  /write\s+(a\s+)?(python|javascript|bash|code|script)\s+(for|that|to)/i,
  /\[SYSTEM\]/i,
  /<\|system\|>/i,
  /###\s*INSTRUCTION/i,
];

/**
 * Detects prompt injection attempts in user-supplied text.
 * Call this on menuText and extractedText BEFORE sending to Gemini.
 */
export function detectPromptInjection(text: string): InjectionCheckResult {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isSafe: false,
        reason: `Input contains content that appears to override AI instructions. Please paste only the restaurant menu.`,
      };
    }
  }
  return { isSafe: true };
}

/**
 * Strips null bytes, non-printable control characters, and known Unicode tricks.
 * Does NOT strip normal punctuation — menus have colons, slashes, parentheses.
 */
export function sanitizeInput(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // control chars
    .replace(/\u200B|\u200C|\u200D|\uFEFF/g, '')         // zero-width chars (used in injection tricks)
    .trim();
}

/**
 * Validates that a file is within safe bounds before processing.
 */
export function validateFileUpload(
  file: File,
  options: { maxSizeMB?: number; allowedTypes?: string[] } = {}
): InjectionCheckResult {
  const maxSizeMB = options.maxSizeMB ?? 10;
  const allowedTypes = options.allowedTypes ?? [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  if (file.size > maxSizeMB * 1024 * 1024) {
    return { isSafe: false, reason: `File exceeds ${maxSizeMB}MB limit.` };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isSafe: false,
      reason: `File type "${file.type}" is not supported. Please upload a PDF or image.`,
    };
  }

  return { isSafe: true };
}

/**
 * Checks if an LLM response has gone off-rails (model followed an injection).
 * Heuristic: valid responses are JSON objects; anything else is suspicious.
 */
export function isResponseSafe(rawText: string): boolean {
  const trimmed = rawText.trim();
  // Valid response must start with { (JSON object)
  if (!trimmed.startsWith('{')) return false;
  // Red flags: code blocks, executable language keywords at top level
  const redFlags = /^(import |def |function |class |#!\/|<script)/m;
  return !redFlags.test(trimmed.slice(0, 200));
}
