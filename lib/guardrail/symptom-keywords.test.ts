import { describe, expect, it } from 'vitest';
import { checkQuickQuerySafety } from '@/lib/guardrail/symptom-keywords';

describe('checkQuickQuerySafety', () => {
  it('returns isSafe: true for normal safe queries', () => {
    const result = checkQuickQuerySafety('what should I eat for lunch?');
    expect(result).toEqual({ isSafe: true });
  });

  it('returns isSafe: false and a reason when input contains an emergency keyword', () => {
    const result = checkQuickQuerySafety('I am experiencing chest pain right now');
    expect(result.isSafe).toBe(false);
    expect(result.reason).toContain('Emergency keyword detected: "chest pain"');
  });

  it('is case insensitive for emergency keywords', () => {
    const result = checkQuickQuerySafety('I HAVE CHEST PAIN');
    expect(result.isSafe).toBe(false);
    expect(result.reason).toContain('Emergency keyword detected: "chest pain"');
  });

  it('returns isSafe: true for empty string or just spaces', () => {
    expect(checkQuickQuerySafety('')).toEqual({ isSafe: true });
    expect(checkQuickQuerySafety('    ')).toEqual({ isSafe: true });
  });

  it('returns isSafe: false for diagnostic keywords', () => {
    const result = checkQuickQuerySafety('Can you diagnose this symptom?');
    expect(result.isSafe).toBe(false);
    expect(result.reason).toContain('Diagnostic query detected: "diagnose"');
  });

  it('is case insensitive for diagnostic keywords', () => {
    const result = checkQuickQuerySafety('DO I HAVE diabetes?');
    expect(result.isSafe).toBe(false);
    expect(result.reason).toContain('Diagnostic query detected: "do i have"');
  });
});
