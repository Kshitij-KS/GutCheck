// lib/offline/cache-builder.ts
// Compresses HealthProfile into a tiny OfflineFallbackTree after every profile update
// Result must be under 5KB. Used for keyword matching when offline.

import type { HealthProfile, OfflineFallbackTree } from '@/types';
import { INGREDIENT_SYNONYMS } from '@/constants/regional-foods';

/**
 * Build an offline fallback tree from a health profile.
 * Deduplicates, lowercases, adds regional synonyms.
 * Called after every profile update — result stored in Zustand (persisted to localStorage).
 */
export function buildOfflineFallbackTree(profile: HealthProfile): OfflineFallbackTree {
  const avoidSet = new Set<string>();
  const moderateSet = new Set<string>();
  const prioritizeSet = new Set<string>();

  // Collect from consolidated rules (primary source)
  addTermsToSet(profile.consolidatedRules.strictAvoid, avoidSet);
  addTermsToSet(profile.consolidatedRules.moderate, moderateSet);
  addTermsToSet(profile.consolidatedRules.prioritize, prioritizeSet);

  // Also collect from individual marker food rules
  for (const marker of profile.markers) {
    if (marker.status === 'CRITICAL' || marker.status === 'ELEVATED') {
      addTermsToSet(marker.foodRules.strictAvoid, avoidSet);
      addTermsToSet(marker.foodRules.moderate, moderateSet);
      addTermsToSet(marker.foodRules.prioritize, prioritizeSet);
    }
  }

  // Expand with regional synonyms
  expandWithSynonyms(avoidSet);
  expandWithSynonyms(moderateSet);
  expandWithSynonyms(prioritizeSet);

  // Remove items from moderate/prioritize if they appear in avoid (avoid wins)
  for (const term of avoidSet) {
    moderateSet.delete(term);
    prioritizeSet.delete(term);
  }

  // Remove items from prioritize if in moderate (moderate wins over prioritize for safety)
  for (const term of moderateSet) {
    prioritizeSet.delete(term);
  }

  return {
    avoidKeywords: Array.from(avoidSet).slice(0, 80),    // cap for size
    moderateKeywords: Array.from(moderateSet).slice(0, 80),
    prioritizeKeywords: Array.from(prioritizeSet).slice(0, 80),
    lastBuiltAt: new Date().toISOString(),
  };
}

function addTermsToSet(terms: string[], set: Set<string>): void {
  for (const term of terms) {
    // Extract individual keywords from multi-word phrases
    const keywords = extractKeywords(term);
    for (const kw of keywords) {
      set.add(kw);
    }
  }
}

function extractKeywords(phrase: string): string[] {
  const lower = phrase.toLowerCase().trim();
  // Add the full phrase
  const results: string[] = [lower];

  // Also extract meaningful sub-words (skip common words)
  const skipWords = new Set(['and', 'or', 'with', 'in', 'of', 'the', 'a', 'an', 'from', 'to', 'for']);
  const words = lower.split(/[\s,;/]+/).filter((w) => w.length > 3 && !skipWords.has(w));
  results.push(...words);

  return results;
}

function expandWithSynonyms(set: Set<string>): void {
  const toAdd: string[] = [];

  for (const term of set) {
    // Check if this term matches any synonym key
    for (const [canonical, synonyms] of Object.entries(INGREDIENT_SYNONYMS)) {
      if (term.includes(canonical) || canonical.includes(term)) {
        toAdd.push(canonical);
        toAdd.push(...synonyms);
      }

      // Check against synonyms
      for (const synonym of synonyms) {
        if (term.includes(synonym) || synonym.includes(term)) {
          toAdd.push(canonical);
          toAdd.push(...synonyms);
          break;
        }
      }
    }
  }

  for (const term of toAdd) {
    set.add(term.toLowerCase().trim());
  }
}

/**
 * Estimate the byte size of the fallback tree for validation.
 */
export function estimateFallbackTreeSize(tree: OfflineFallbackTree): number {
  return new TextEncoder().encode(JSON.stringify(tree)).length;
}
