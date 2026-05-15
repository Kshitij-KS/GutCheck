import { describe, expect, it } from 'vitest';
import { parseMenuScanResult } from '@/lib/parsers/scan.parser';

describe('parseMenuScanResult', () => {
  it('parses minimal valid menu JSON', () => {
    const raw = JSON.stringify({
      dishes: [
        {
          dishName: 'Dal',
          classification: 'PRIORITIZE',
          score: 80,
          primaryReason: 'High fiber',
          hiddenIngredients: [],
          modification: null,
          isOfflineResult: false,
        },
      ],
      scanSummary: 'Good choices',
      bestChoices: ['Dal'],
      timestamp: '2026-01-01T00:00:00.000Z',
    });
    const out = parseMenuScanResult(raw);
    expect(out.dishes).toHaveLength(1);
    expect(out.dishes[0]?.dishName).toBe('Dal');
  });
});
