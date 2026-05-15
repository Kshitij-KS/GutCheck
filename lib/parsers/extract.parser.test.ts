import { describe, expect, it } from 'vitest';
import { parseExtractedMarkers } from '@/lib/parsers/extract.parser';

const minimalMarker = {
  id: 'm1',
  name: 'Glucose',
  value: '90',
  numericValue: 90,
  unit: 'mg/dL',
  unitAmbiguous: false,
  reportedRange: null,
  standardRange: '70-100',
  status: 'OPTIMAL',
  implication: 'Within range',
  foodRules: { strictAvoid: [], moderate: [], prioritize: [] },
  movementRules: { recommended: [], avoid: [], breathworkSuggestions: [] },
  hydrationRules: [] as string[],
};

describe('parseExtractedMarkers', () => {
  it('parses minimal extraction JSON', () => {
    const raw = JSON.stringify({
      extractionFailed: false,
      reportDate: null,
      labName: null,
      unitAmbiguousMarkers: [],
      markers: [minimalMarker],
    });
    const out = parseExtractedMarkers(raw);
    expect(out.extractionFailed).toBe(false);
    expect(out.markers).toHaveLength(1);
  });
});
