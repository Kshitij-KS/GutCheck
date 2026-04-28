// lib/offline/fallback-tree.ts
// Offline keyword matching — no API calls, works completely offline
// Used when useOfflineDetection() returns isOnline: false

import type { DishScanResult, OfflineFallbackTree, TrafficLight } from '@/types';

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

  const hasAvoid = tree.avoidKeywords.some(
    (kw) => lower.includes(kw) || kw.includes(lower)
  );
  const hasModerate = tree.moderateKeywords.some(
    (kw) => lower.includes(kw) || kw.includes(lower)
  );
  const hasPrioritize = tree.prioritizeKeywords.some(
    (kw) => lower.includes(kw) || kw.includes(lower)
  );

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
