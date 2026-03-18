/**
 * sanitizeInput — strips prompt injection patterns and caps input length.
 *
 * Tested patterns (all case-insensitive):
 *   "ignore previous instructions", "ignore all instructions",
 *   "disregard instructions", "you are now", "act as",
 *   "system:", "forget everything", "new instructions"
 *
 * Confirmed 4,000-character limit:
 *   sanitizeInput('ignore previous instructions ' + 'x'.repeat(4500))
 *   → ≤4,000 chars, injection phrase removed
 *
 *   sanitizeInput('x'.repeat(5000))
 *   → exactly 4,000 chars
 */

const INJECTION_PATTERNS = [
  /ignore\s+previous\s+instructions/gi,
  /ignore\s+all\s+instructions/gi,
  /disregard\s+instructions/gi,
  /you\s+are\s+now/gi,
  /act\s+as/gi,
  /system:/gi,
  /forget\s+everything/gi,
  /new\s+instructions/gi,
]

// Strip markdown code fences that could be used to smuggle structured instructions
const MARKDOWN_FENCE = /```[\s\S]*?```/g

export function sanitizeInput(text: string, maxLength = 4000): string {
  let cleaned = text

  // Remove markdown fences first
  cleaned = cleaned.replace(MARKDOWN_FENCE, '')

  // Strip all injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    cleaned = cleaned.replace(pattern, '')
  }

  // Truncate to maxLength after stripping (strip may have shortened it)
  cleaned = cleaned.slice(0, maxLength)

  return cleaned.trim()
}
