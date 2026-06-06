import { describe, expect, it } from 'vitest';
import { computeTrend, computeMarkerDeltas, mergeReportHistories } from '@/lib/history';
import type { BloodMarker, ReportHistoryEntry } from '@/types';

function marker(p: Partial<BloodMarker> & { id: string; numericValue: number; status: BloodMarker['status'] }): BloodMarker {
  return {
    name: p.id,
    value: String(p.numericValue),
    unit: null,
    unitAmbiguous: false,
    reportedRange: null,
    standardRange: '',
    implication: '',
    foodRules: { strictAvoid: [], moderate: [], prioritize: [] },
    movementRules: { recommended: [], avoid: [], breathworkSuggestions: [] },
    hydrationRules: [],
    ...p,
  };
}

describe('computeTrend', () => {
  it('high-marker status worsening', () => {
    const prev = marker({ id: 'ldl', numericValue: 110, status: 'BORDERLINE' });
    const curr = marker({ id: 'ldl', numericValue: 160, status: 'ELEVATED' });
    expect(computeTrend(prev, curr)).toBe('WORSENING');
  });

  it('high-marker status improving', () => {
    const prev = marker({ id: 'ldl', numericValue: 160, status: 'ELEVATED' });
    const curr = marker({ id: 'ldl', numericValue: 110, status: 'BORDERLINE' });
    expect(computeTrend(prev, curr)).toBe('IMPROVING');
  });

  it('low-marker (deficiency) improving when value rises', () => {
    const prev = marker({ id: 'hemoglobin', numericValue: 9, status: 'LOW' });
    const curr = marker({ id: 'hemoglobin', numericValue: 12, status: 'LOW' });
    expect(computeTrend(prev, curr)).toBe('IMPROVING');
  });

  it('stable within 5% and same status', () => {
    const prev = marker({ id: 'ldl', numericValue: 100, status: 'OPTIMAL' });
    const curr = marker({ id: 'ldl', numericValue: 102, status: 'OPTIMAL' });
    expect(computeTrend(prev, curr)).toBe('STABLE');
  });
});

describe('computeMarkerDeltas', () => {
  it('only compares markers present in both reports', () => {
    const prev = [marker({ id: 'ldl', numericValue: 160, status: 'ELEVATED' })];
    const curr = [
      marker({ id: 'ldl', numericValue: 120, status: 'BORDERLINE' }),
      marker({ id: 'hba1c', numericValue: 5.5, status: 'OPTIMAL' }),
    ];
    const deltas = computeMarkerDeltas(prev, curr);
    expect(deltas).toHaveLength(1);
    expect(deltas[0]?.markerId).toBe('ldl');
    expect(deltas[0]?.trend).toBe('IMPROVING');
  });
});

describe('mergeReportHistories', () => {
  const entry = (id: string, uploadedAt: string): ReportHistoryEntry => ({
    id,
    uploadedAt,
    reportDate: null,
    profileSnapshot: {} as ReportHistoryEntry['profileSnapshot'],
    markerDeltas: [],
  });

  it('unions by id, newest first, keeps newer uploadedAt on conflict', () => {
    const local = [entry('a', '2024-01-02T00:00:00Z')];
    const remote = [entry('a', '2024-01-01T00:00:00Z'), entry('b', '2024-03-01T00:00:00Z')];
    const merged = mergeReportHistories(local, remote);
    expect(merged.map((e) => e.id)).toEqual(['b', 'a']);
    expect(merged.find((e) => e.id === 'a')?.uploadedAt).toBe('2024-01-02T00:00:00Z');
  });

  it('caps at 50 entries', () => {
    const many = Array.from({ length: 60 }, (_, i) =>
      entry(`id-${i}`, `2024-01-01T00:00:${String(i).padStart(2, '0')}Z`)
    );
    expect(mergeReportHistories(many, [])).toHaveLength(50);
  });
});
