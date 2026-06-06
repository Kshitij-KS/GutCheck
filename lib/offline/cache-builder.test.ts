import { describe, expect, it } from 'vitest';
import { buildOfflineFallbackTree, estimateFallbackTreeSize } from '@/lib/offline/cache-builder';
import type { HealthProfile } from '@/types';

function profile(partial: Partial<HealthProfile>): HealthProfile {
  return {
    id: 'p1',
    schemaVersion: '1.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reportDate: null,
    reportLabName: null,
    specialPopulation: 'none',
    markers: [],
    primaryConcerns: [],
    overallSummary: '',
    consolidatedRules: {
      strictAvoid: [],
      moderate: [],
      prioritize: [],
      hydrationGuidance: '',
      movementGuidance: [],
      cuisineGuidance: '',
    },
    chefCardContent: {
      title: '',
      intro: '',
      strictAvoidList: [],
      moderateList: [],
      allergyNotes: null,
      additionalNote: null,
    },
    offlineFallbackTree: {
      avoidKeywords: [],
      moderateKeywords: [],
      prioritizeKeywords: [],
      lastBuiltAt: new Date().toISOString(),
    },
    ...partial,
  };
}

describe('buildOfflineFallbackTree', () => {
  it('extracts keywords from consolidated rules', () => {
    const tree = buildOfflineFallbackTree(
      profile({
        consolidatedRules: {
          strictAvoid: ['Deep fried foods'],
          moderate: ['White rice'],
          prioritize: ['Moong dal'],
          hydrationGuidance: '',
          movementGuidance: [],
          cuisineGuidance: '',
        },
      })
    );
    expect(tree.avoidKeywords).toContain('fried');
    expect(tree.prioritizeKeywords).toContain('moong');
  });

  it('never emits empty-string keywords (regression)', () => {
    const tree = buildOfflineFallbackTree(
      profile({
        consolidatedRules: {
          strictAvoid: ['', '   '],
          moderate: [],
          prioritize: [],
          hydrationGuidance: '',
          movementGuidance: [],
          cuisineGuidance: '',
        },
      })
    );
    expect(tree.avoidKeywords.every((k) => k.length > 0)).toBe(true);
  });

  it('avoid keywords win over moderate/prioritize', () => {
    const tree = buildOfflineFallbackTree(
      profile({
        consolidatedRules: {
          strictAvoid: ['sugar'],
          moderate: ['sugar'],
          prioritize: ['sugar'],
          hydrationGuidance: '',
          movementGuidance: [],
          cuisineGuidance: '',
        },
      })
    );
    expect(tree.avoidKeywords).toContain('sugar');
    expect(tree.moderateKeywords).not.toContain('sugar');
    expect(tree.prioritizeKeywords).not.toContain('sugar');
  });

  it('produces a compact tree', () => {
    const tree = buildOfflineFallbackTree(profile({}));
    expect(estimateFallbackTreeSize(tree)).toBeLessThan(5000);
  });
});
