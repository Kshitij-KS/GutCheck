// lib/contrast.test.ts
//
// Property-based test for the pure WCAG contrast helper (`lib/contrast.ts`).
// Covers Property 6 from the UI/UX overhaul design's "Correctness Properties"
// section. The `fc.assert` runs a minimum of 100 iterations.

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  type RGB,
  focusRingContrast,
  FOCUS_RING_HEX,
  SURFACE_TOKENS,
} from './contrast';

describe('lib/contrast property tests', () => {
  // Feature: ui-ux-overhaul, Property 6: Focus ring meets 3:1 contrast against every surface
  it('Property 6: focusRingContrast(FOCUS_RING_HEX, surface) >= 3.0 for warm-palette surfaces', () => {
    // Generator for colors within the warm-palette family: warm, light surface
    // tints sit in a high, slightly warm-biased RGB region (red >= green >= blue,
    // all bright). This exercises the whole family, not just the listed tokens.
    const warmSurfaceArb: fc.Arbitrary<RGB> = fc
      .record({
        r: fc.integer({ min: 235, max: 255 }),
        g: fc.integer({ min: 225, max: 255 }),
        b: fc.integer({ min: 215, max: 255 }),
      })
      .map(({ r, g, b }) => {
        // Enforce the warm ordering r >= g >= b so generated colors stay within
        // the established warm, muted palette family.
        const sorted = [r, g, b].sort((x, y) => y - x);
        return { r: sorted[0], g: sorted[1], b: sorted[2] };
      });

    // The fixed surface-token set is always checked alongside generated colors.
    const surfaceArb: fc.Arbitrary<RGB | string> = fc.oneof(
      fc.constantFrom(...SURFACE_TOKENS.map((t) => t.hex)),
      warmSurfaceArb,
    );

    fc.assert(
      fc.property(surfaceArb, (surface) => {
        const ratio = focusRingContrast(FOCUS_RING_HEX, surface);
        expect(ratio).toBeGreaterThanOrEqual(3.0);
      }),
      { numRuns: 100 },
    );

    // Assert directly on the real surface-token set for explicit coverage.
    for (const token of SURFACE_TOKENS) {
      expect(focusRingContrast(FOCUS_RING_HEX, token.hex)).toBeGreaterThanOrEqual(3.0);
    }
  });
});
