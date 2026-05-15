import { describe, expect, it } from 'vitest';
import { parseGroceryAuditResult } from '@/lib/parsers/grocery.parser';

describe('parseGroceryAuditResult', () => {
  it('parses minimal grocery audit JSON', () => {
    const raw = JSON.stringify({
      items: [
        {
          name: 'Oats',
          classification: 'PRIORITIZE',
          reason: 'Fiber',
          hiddenIngredients: [],
          swap: null,
        },
      ],
      summary: 'Looks good',
      greatCount: 1,
      moderateCount: 0,
      reconsiderCount: 0,
      timestamp: '2026-01-01T00:00:00.000Z',
    });
    const out = parseGroceryAuditResult(raw);
    expect(out.items).toHaveLength(1);
    expect(out.items[0]?.name).toBe('Oats');
  });
});
