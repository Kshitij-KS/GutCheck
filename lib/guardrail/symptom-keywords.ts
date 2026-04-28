// lib/guardrail/symptom-keywords.ts
// Emergency symptom keyword detection — runs CLIENT-SIDE before any API call

import { EMERGENCY_SYMPTOM_KEYWORDS, EMERGENCY_RESPONSE } from '@/constants/critical-thresholds';

/**
 * Client-side safety check for Quick-Query input.
 * Runs instantly with ZERO latency — no API call ever made for emergency inputs.
 */
export function checkQuickQuerySafety(input: string): {
  safe: boolean;
  emergencyResponse?: string;
} {
  const lower = input.toLowerCase().trim();

  const hasEmergencyKeyword = EMERGENCY_SYMPTOM_KEYWORDS.some((kw) =>
    lower.includes(kw)
  );

  if (hasEmergencyKeyword) {
    return { safe: false, emergencyResponse: EMERGENCY_RESPONSE };
  }

  return { safe: true };
}
