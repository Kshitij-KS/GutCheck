// lib/motion.test.ts
//
// Property-based tests for the pure motion-helper module (`lib/motion.ts`).
// These cover Properties 1–5 from the UI/UX overhaul design's "Correctness
// Properties" section. Each `fc.assert` runs a minimum of 100 iterations.

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  type InteractionKind,
  type MotionRegistryEntry,
  staggerDelay,
  transitionDuration,
  entranceVariants,
  MOTION_REGISTRY,
} from './motion';

const ALLOWED_ANIMATED_PROPERTIES = new Set<'transform' | 'opacity'>([
  'transform',
  'opacity',
]);

const INTERACTION_KINDS: ReadonlyArray<InteractionKind> = [
  'hover',
  'focus',
  'active',
  'press',
];

describe('lib/motion property tests', () => {
  // Feature: ui-ux-overhaul, Property 1: Only transform/opacity are ever animated
  it('Property 1: every animated property is a subset of {transform, opacity}', () => {
    // Generator for registry-like entries the app could plausibly add: the
    // animatedProperties are drawn only from the closed allowed set, mirroring
    // the type-level constraint on MotionRegistryEntry.
    const registryEntryArb: fc.Arbitrary<MotionRegistryEntry> = fc.record({
      name: fc.string(),
      animatedProperties: fc.array(
        fc.constantFrom<'transform' | 'opacity'>('transform', 'opacity'),
      ),
    });

    fc.assert(
      fc.property(fc.array(registryEntryArb), (generatedEntries) => {
        const allEntries = [...MOTION_REGISTRY, ...generatedEntries];
        for (const entry of allEntries) {
          for (const prop of entry.animatedProperties) {
            expect(ALLOWED_ANIMATED_PROPERTIES.has(prop)).toBe(true);
          }
        }
      }),
      { numRuns: 100 },
    );

    // Also assert directly on the real registry for good measure.
    for (const entry of MOTION_REGISTRY) {
      for (const prop of entry.animatedProperties) {
        expect(['transform', 'opacity']).toContain(prop);
      }
    }
  });

  // Feature: ui-ux-overhaul, Property 2: State-transition durations stay within 150–200ms
  it('Property 2: transitionDuration is always within [150, 200] for every InteractionKind', () => {
    fc.assert(
      fc.property(fc.constantFrom(...INTERACTION_KINDS), (kind) => {
        const d = transitionDuration(kind);
        expect(d).toBeGreaterThanOrEqual(150);
        expect(d).toBeLessThanOrEqual(200);
      }),
      { numRuns: 100 },
    );
  });

  // Feature: ui-ux-overhaul, Property 3: Stagger delays cascade by 30–80ms and never run away
  it('Property 3: staggerDelay is non-decreasing, deltas are 0 or in [30,80], and capped', () => {
    const STEP = 60;
    const MAX_INDEX = 8;

    fc.assert(
      // Include large indices to exercise the cap.
      fc.property(fc.nat({ max: 1_000_000 }), (i) => {
        const current = staggerDelay(i);
        const next = staggerDelay(i + 1);

        // Non-decreasing.
        expect(next).toBeGreaterThanOrEqual(current);

        // Per-step delta is either 0 (cap reached) or within [30, 80].
        const delta = next - current;
        const deltaIsZero = delta === 0;
        const deltaInBand = delta >= 30 && delta <= 80;
        expect(deltaIsZero || deltaInBand).toBe(true);

        // Never exceeds step * maxIndex.
        expect(current).toBeLessThanOrEqual(STEP * MAX_INDEX);
        expect(next).toBeLessThanOrEqual(STEP * MAX_INDEX);
      }),
      { numRuns: 100 },
    );
  });

  // Feature: ui-ux-overhaul, Property 4: Normal-mode entrance is a fade-in-up with a settled terminal state
  it('Property 4: entranceVariants(false) fades in and up to a settled final state', () => {
    fc.assert(
      fc.property(fc.constant(false), (reduced) => {
        const v = entranceVariants(reduced);
        expect(v.fromOpacity).toBeGreaterThanOrEqual(0);
        expect(v.fromOpacity).toBeLessThan(1);
        expect(v.toOpacity).toBe(1);
        expect(v.fromOffsetPx).toBeGreaterThan(0);
        expect(v.toOffsetPx).toBe(0);
      }),
      { numRuns: 100 },
    );
  });

  // Feature: ui-ux-overhaul, Property 5: Reduced-motion entrance is opacity-only
  it('Property 5: entranceVariants(true) has no positional movement but opacity still rises', () => {
    fc.assert(
      fc.property(fc.constant(true), (reduced) => {
        const v = entranceVariants(reduced);
        expect(v.fromOffsetPx).toBe(0);
        expect(v.toOffsetPx).toBe(0);
        expect(v.fromOpacity).toBeLessThan(1);
        expect(v.toOpacity).toBe(1);
      }),
      { numRuns: 100 },
    );
  });
});
