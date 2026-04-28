// lib/guardrail/special-populations.ts
// Pregnancy and pediatric population detection

import {
  PREGNANCY_KEYWORDS,
  PEDIATRIC_AGE_THRESHOLD,
  PREGNANCY_REDIRECT,
  PEDIATRIC_REDIRECT,
} from '@/constants/critical-thresholds';
import type { SpecialPopulation } from '@/types';

/**
 * Detects special populations from extracted report text or user-provided age.
 * Used by Agent 2 (AI) and as a pre-check on extracted markers.
 */
export function detectSpecialPopulation(
  reportText: string,
  age?: number
): { population: SpecialPopulation; redirectMessage: string | null } {
  const lower = reportText.toLowerCase();

  // Check for pregnancy keywords in report text
  const isPregnant = PREGNANCY_KEYWORDS.some((kw) => lower.includes(kw));
  if (isPregnant) {
    return { population: 'pregnant', redirectMessage: PREGNANCY_REDIRECT };
  }

  // Check age — either from user context or detected in report
  if (age !== undefined && age < PEDIATRIC_AGE_THRESHOLD) {
    return { population: 'pediatric', redirectMessage: PEDIATRIC_REDIRECT };
  }

  // Try to extract age from report text (e.g., "Age: 15 years")
  const ageMatch = lower.match(/\bage[:\s]+(\d{1,3})\s*(?:years?|yrs?)?/);
  if (ageMatch) {
    const extractedAge = parseInt(ageMatch[1] ?? '0', 10);
    if (extractedAge > 0 && extractedAge < PEDIATRIC_AGE_THRESHOLD) {
      return { population: 'pediatric', redirectMessage: PEDIATRIC_REDIRECT };
    }
  }

  return { population: 'none', redirectMessage: null };
}
