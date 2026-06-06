import { describe, expect, it } from 'vitest';
import { offlineQuickCheck, withAllergyAvoids } from '@/lib/offline/fallback-tree';
import type { OfflineFallbackTree } from '@/types';

function tree(partial: Partial<OfflineFallbackTree>): OfflineFallbackTree {
  return {
    avoidKeywords: [],
    moderateKeywords: [],
    prioritizeKeywords: [],
    lastBuiltAt: new Date().toISOString(),
    ...partial,
  };
}

describe('offlineQuickCheck', () => {
  it('classifies AVOID when a dish matches an avoid keyword', () => {
    const result = offlineQuickCheck('Deep fried telebhaja', tree({ avoidKeywords: ['fried'] }));
    expect(result.classification).toBe('AVOID');
    expect(result.isOfflineResult).toBe(true);
  });

  it('classifies PRIORITIZE when matching a prioritize keyword', () => {
    const result = offlineQuickCheck('Moong dal', tree({ prioritizeKeywords: ['moong'] }));
    expect(result.classification).toBe('PRIORITIZE');
  });

  it('does NOT flag everything when an empty keyword is present (regression)', () => {
    const result = offlineQuickCheck('Plain rice', tree({ avoidKeywords: ['', 'sugar'] }));
    expect(result.classification).not.toBe('AVOID');
  });

  it('returns MODERATE for an empty dish line', () => {
    const result = offlineQuickCheck('   ', tree({ avoidKeywords: ['fried'] }));
    expect(result.classification).toBe('MODERATE');
  });

  it('defaults to MODERATE when nothing matches', () => {
    const result = offlineQuickCheck('Mystery dish', tree({}));
    expect(result.classification).toBe('MODERATE');
  });
});

describe('withAllergyAvoids', () => {
  it('splits allergy phrases into avoid keywords', () => {
    const merged = withAllergyAvoids(tree({ avoidKeywords: ['sugar'] }), ['Dairy / Lactose']);
    expect(merged.avoidKeywords).toContain('dairy');
    expect(merged.avoidKeywords).toContain('lactose');
    expect(merged.avoidKeywords).toContain('sugar');
  });

  it('makes an allergen dish classify as AVOID', () => {
    const merged = withAllergyAvoids(tree({}), ['Peanuts']);
    expect(offlineQuickCheck('Peanut chikki', merged).classification).toBe('AVOID');
  });

  it('returns the same tree when no allergies', () => {
    const base = tree({ avoidKeywords: ['x'] });
    expect(withAllergyAvoids(base, [])).toBe(base);
  });
});
