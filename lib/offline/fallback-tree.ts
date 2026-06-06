// lib/offline/fallback-tree.ts
// Offline keyword matching — no API calls, works completely offline
// Used when useOfflineDetection() returns isOnline: false

import type { DishScanResult, OfflineFallbackTree, TrafficLight } from '@/types';

/**
 * Merge user allergy terms into a fallback tree's avoid keywords. Allergies are
 * absolute avoids and may be set/changed after the profile (and its baked-in
 * tree) was built, so this is applied at check time.
 */
export function withAllergyAvoids(
  tree: OfflineFallbackTree,
  allergies: string[]
): OfflineFallbackTree {
  if (!allergies.length) return tree;
  const extra = allergies.flatMap((a) => {
    const words = a
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2);
    const out: string[] = [];
    for (const w of words) {
      out.push(w);
      // Add a depluralized form so "Peanuts" also matches "peanut".
      if (w.length > 3 && w.endsWith('s')) out.push(w.slice(0, -1));
    }
    return out;
  });
  return { ...tree, avoidKeywords: [...tree.avoidKeywords, ...extra] };
}

/**
 * Offline quick-check for a single dish name using keyword matching.
 * Returns a simplified DishScanResult with isOfflineResult: true.
 * No API call is made.
 */
export function offlineQuickCheck(
  dishName: string,
  tree: OfflineFallbackTree
): Pick<DishScanResult, 'classification' | 'primaryReason' | 'isOfflineResult'> {
  const lower = dishName.toLowerCase().trim();

  // An empty dish line can't be assessed; treat as uncertain rather than matching
  // every keyword (an empty keyword would otherwise match via includes('')).
  if (lower.length === 0) {
    return {
      classification: 'MODERATE',
      primaryReason: 'Unable to fully assess offline — proceed mindfully and check when connected',
      isOfflineResult: true,
    };
  }

  const matches = (kw: string) =>
    kw.length > 0 && (lower.includes(kw) || kw.includes(lower));

  const hasAvoid = tree.avoidKeywords.some(matches);
  const hasModerate = tree.moderateKeywords.some(matches);
  const hasPrioritize = tree.prioritizeKeywords.some(matches);

  if (hasAvoid) {
    return {
      classification: 'AVOID',
      primaryReason: 'Contains an ingredient on your avoid list (offline check — reconnect for full analysis)',
      isOfflineResult: true,
    };
  }

  if (hasModerate) {
    return {
      classification: 'MODERATE',
      primaryReason: 'Contains an ingredient to consume mindfully (offline check — reconnect for full analysis)',
      isOfflineResult: true,
    };
  }

  if (hasPrioritize) {
    return {
      classification: 'PRIORITIZE',
      primaryReason: 'Looks like a good choice based on your profile (offline check — reconnect for full analysis)',
      isOfflineResult: true,
    };
  }

  // Default: moderate when uncertain offline
  return {
    classification: 'MODERATE',
    primaryReason: 'Unable to fully assess offline — proceed mindfully and check when connected',
    isOfflineResult: true,
  };
}

/**
 * Offline audit for a grocery list — keyword matching for each item.
 */
export function offlineGroceryCheck(
  items: string[],
  tree: OfflineFallbackTree
): Array<{ name: string; classification: TrafficLight; primaryReason: string; isOfflineResult: true }> {
  return items.map((item) => {
    const result = offlineQuickCheck(item, tree);
    return {
      name: item,
      classification: result.classification,
      primaryReason: result.primaryReason,
      isOfflineResult: true as const,
    };
  });
}
