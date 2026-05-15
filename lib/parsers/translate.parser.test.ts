import { describe, expect, it } from 'vitest';
import { parseHealthProfile } from '@/lib/parsers/translate.parser';

const marker = {
  id: 'm1',
  name: 'Glucose',
  value: '90',
  unit: 'mg/dL',
  unitAmbiguous: false,
  numericValue: 90,
  reportedRange: null,
  standardRange: '70-100',
  status: 'OPTIMAL',
  implication: 'ok',
  foodRules: { strictAvoid: [], moderate: [], prioritize: [] },
  movementRules: { recommended: [], avoid: [], breathworkSuggestions: [] },
  hydrationRules: [] as string[],
};

const tree = {
  avoidKeywords: [] as string[],
  moderateKeywords: [] as string[],
  prioritizeKeywords: [] as string[],
  lastBuiltAt: '2026-01-01T00:00:00.000Z',
};

const profile = {
  id: 'p1',
  schemaVersion: '1.0' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  reportDate: null,
  reportLabName: null,
  specialPopulation: 'none' as const,
  markers: [marker],
  primaryConcerns: [],
  overallSummary: 'Summary',
  consolidatedRules: {
    strictAvoid: [],
    moderate: [],
    prioritize: [],
    hydrationGuidance: '',
    movementGuidance: [],
    cuisineGuidance: '',
  },
  chefCardContent: {
    title: 'Card',
    intro: 'Hi',
    strictAvoidList: [],
    moderateList: [],
    allergyNotes: null,
    additionalNote: null,
  },
  offlineFallbackTree: tree,
};

describe('parseHealthProfile', () => {
  it('parses minimal health profile JSON', () => {
    const out = parseHealthProfile(JSON.stringify(profile));
    expect(out.id).toBe('p1');
    expect(out.markers).toHaveLength(1);
  });
});
