// lib/offline/cache-builder.ts
// Compresses HealthProfile into a tiny OfflineFallbackTree after every profile update
// Result must be under 5KB. Used for keyword matching when offline.

import type { HealthProfile, OfflineFallbackTree } from '@/types';
import { INGREDIENT_SYNONYMS } from '@/constants/regional-foods';

function takeFirstN<T>(set: Set<T>, n: number): T[] {
  const result: T[] = [];
  for (const item of set) {
    if (result.length >= n) break;
    result.push(item);
  }
  return result;
}

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
    avoidKeywords: takeFirstN(avoidSet, 80),    // cap for size
    moderateKeywords: takeFirstN(moderateSet, 80),
    prioritizeKeywords: takeFirstN(prioritizeSet, 80),
    lastBuiltAt: new Date().toISOString(),
  };
}

function addTermsToSet(terms: string[], set: Set<string>): void {
  for (const term of terms) {
    if (!term || !term.trim()) continue;
    // Extract individual keywords from multi-word phrases
    const keywords = extractKeywords(term);
    for (const kw of keywords) {
      if (kw.length > 0) set.add(kw);
    }
  }
}

function extractKeywords(phrase: string): string[] {
  const lower = phrase.toLowerCase().trim();
  if (lower.length === 0) return [];
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
  const entries = Object.entries(INGREDIENT_SYNONYMS);

  for (const term of set) {
    for (const [canonical, synonyms] of entries) {
      // Check if the term matches the canonical name or any of the synonyms
      const match =
        term.includes(canonical) ||
        canonical.includes(term) ||
        synonyms.some((synonym) => term.includes(synonym) || synonym.includes(term));

      if (match) {
        toAdd.push(canonical, ...synonyms);
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
