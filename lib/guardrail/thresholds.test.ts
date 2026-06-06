import { describe, expect, it } from 'vitest';
import { runDeterministicGuardrail } from '@/lib/guardrail/thresholds';
import type { BloodMarker } from '@/types';

function marker(partial: Partial<BloodMarker> & { id: string; numericValue: number }): BloodMarker {
  return {
    name: partial.id,
    value: String(partial.numericValue),
    unit: null,
    unitAmbiguous: false,
    reportedRange: null,
    standardRange: '',
    status: 'OPTIMAL',
    implication: '',
    foodRules: { strictAvoid: [], moderate: [], prioritize: [] },
    movementRules: { recommended: [], avoid: [], breathworkSuggestions: [] },
    hydrationRules: [],
    ...partial,
  };
}

describe('runDeterministicGuardrail', () => {
  it('passes when all markers are within safe thresholds', () => {
    const result = runDeterministicGuardrail([
      marker({ id: 'hba1c', numericValue: 5.6 }),
      marker({ id: 'ldl', numericValue: 110 }),
    ]);
    expect(result.passed).toBe(true);
    expect(result.criticalMarkers).toHaveLength(0);
  });

  it('blocks when a marker exceeds its max threshold', () => {
    const result = runDeterministicGuardrail([marker({ id: 'hba1c', numericValue: 13 })]);
    expect(result.passed).toBe(false);
    expect(result.criticalMarkers[0]?.direction).toBe('above');
    expect(result.redirectMessage).toBeTruthy();
  });

  it('blocks when a marker is below its min threshold', () => {
    const result = runDeterministicGuardrail([marker({ id: 'hemoglobin', numericValue: 4 })]);
    expect(result.passed).toBe(false);
    expect(result.criticalMarkers[0]?.direction).toBe('below');
  });

  it('matches threshold keys via aliases (case-insensitive)', () => {
    const result = runDeterministicGuardrail([marker({ id: 'A1C', numericValue: 13 })]);
    expect(result.passed).toBe(false);
  });

  it('ignores unknown marker ids', () => {
    const result = runDeterministicGuardrail([marker({ id: 'totally_unknown', numericValue: 99999 })]);
    expect(result.passed).toBe(true);
  });

  it('ignores non-finite numeric values', () => {
    const result = runDeterministicGuardrail([marker({ id: 'hba1c', numericValue: NaN })]);
    expect(result.passed).toBe(true);
  });
});
