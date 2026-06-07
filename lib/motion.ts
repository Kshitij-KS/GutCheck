// lib/motion.ts
//
// Pure motion-helper module (Layer 3 of the UI/UX overhaul motion system).
//
// This module is the single source of truth for the numeric motion values used
// across the app. Both CSS (via inline custom properties such as
// `--gc-stagger-index`) and any JS-driven component read the same definitions
// declared here, keeping them in lockstep with the design tokens in
// `app/globals.css`:
//   --stagger-step:      60ms  (within the 30–80ms cascade band)
//   --stagger-max-index: 8     (cap so long lists never feel slow)
//   --dur-state:         180ms (state-transition duration, within 150–200ms)
//   --enter-offset:      8px   (fade-in-up vertical offset)
//
// IMPORTANT: This module is intentionally framework-free. It has NO React or DOM
// imports — pure functions and constants only — so it is unit/property testable
// in isolation.

/** A discrete interaction state whose transition we time. */
export type InteractionKind = 'hover' | 'focus' | 'active' | 'press';

/**
 * Describes a single item's entrance animation (fade-in-up).
 *
 * Invariants:
 *  - 0 <= fromOpacity < 1
 *  - toOpacity === 1
 *  - fromOffsetPx >= 0 (=== 0 when reduced motion)
 *  - toOffsetPx === 0
 */
export interface EntranceVariant {
  fromOpacity: number;
  toOpacity: number;
  fromOffsetPx: number;
  toOffsetPx: number;
}

/**
 * A registry entry naming an animation the app performs and the CSS properties
 * it animates. `animatedProperties` is constrained to the closed set
 * `{ 'transform', 'opacity' }` at the type level so the registry can prove only
 * transform/opacity are ever animated.
 */
export interface MotionRegistryEntry {
  name: string;
  animatedProperties: ReadonlyArray<'transform' | 'opacity'>;
}

// ---------------------------------------------------------------------------
// Numeric constants — mirror the design tokens in app/globals.css.
// ---------------------------------------------------------------------------

/** Default per-step stagger delay in ms. Mirrors `--stagger-step: 60ms`. */
const DEFAULT_STAGGER_STEP_MS = 60;
/** Default index cap. Mirrors `--stagger-max-index: 8`. */
const DEFAULT_STAGGER_MAX_INDEX = 8;
/** Lower bound of the per-step cascade band (ms). */
const STAGGER_STEP_MIN_MS = 30;
/** Upper bound of the per-step cascade band (ms). */
const STAGGER_STEP_MAX_MS = 80;
/** State-transition duration in ms. Mirrors `--dur-state: 180ms`. */
const STATE_DURATION_MS = 180;
/** Entrance vertical offset in px. Mirrors `--enter-offset: 8px`. */
const ENTER_OFFSET_PX = 8;

/** Clamp a number into the inclusive range [min, max]. */
function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Per-item entrance delay in ms for a staggered cascade.
 *
 * Guarantees (see design Property 3):
 *  - Non-decreasing in `index`.
 *  - The per-step delta `staggerDelay(i+1) - staggerDelay(i)` is either `0`
 *    (once the index cap is reached) or within `[30, 80]` ms. A custom `stepMs`
 *    is clamped into `[30, 80]` so this invariant always holds.
 *  - Never exceeds `clampedStep * maxIndex`.
 *
 * The function is total: negative or fractional indices are floored/clamped to a
 * non-negative integer so it is well-defined for any numeric input.
 *
 * @param index    Item position (any number; clamped to a non-negative integer).
 * @param stepMs   Per-step delay (clamped into [30, 80]); defaults to 60.
 * @param maxIndex Index cap (clamped to a non-negative integer); defaults to 8.
 */
export function staggerDelay(
  index: number,
  stepMs: number = DEFAULT_STAGGER_STEP_MS,
  maxIndex: number = DEFAULT_STAGGER_MAX_INDEX,
): number {
  // Make the function total: handle NaN, negatives, and fractional indices.
  const safeIndex = Number.isFinite(index) ? index : 0;
  const flooredIndex = Math.max(0, Math.floor(safeIndex));

  // Clamp the step into the cascade band so the per-step delta invariant holds
  // even when a custom step is supplied.
  const safeStep = Number.isFinite(stepMs) ? stepMs : DEFAULT_STAGGER_STEP_MS;
  const clampedStep = clamp(safeStep, STAGGER_STEP_MIN_MS, STAGGER_STEP_MAX_MS);

  const safeMaxIndex = Number.isFinite(maxIndex) ? maxIndex : DEFAULT_STAGGER_MAX_INDEX;
  const flooredMaxIndex = Math.max(0, Math.floor(safeMaxIndex));

  const cappedIndex = Math.min(flooredIndex, flooredMaxIndex);
  return clampedStep * cappedIndex;
}

/**
 * Duration (ms) for a state transition. Always returns a value within the
 * 150–200ms band for every `InteractionKind` (see design Property 2).
 *
 * Note: the `--dur-press` token (120ms) sits below this band and is reserved for
 * raw press feedback; this state-transition helper uses `--dur-state` (180ms)
 * for all kinds so callers always receive a value in [150, 200].
 */
export function transitionDuration(_kind: InteractionKind): number {
  return STATE_DURATION_MS;
}

/**
 * Entrance variant for the fade-in-up pattern.
 *
 * Normal mode begins lower and translucent and settles at full opacity in its
 * final position. Reduced-motion mode is opacity-only (no positional movement).
 */
export function entranceVariants(prefersReducedMotion: boolean): EntranceVariant {
  return {
    fromOpacity: 0,
    toOpacity: 1,
    fromOffsetPx: prefersReducedMotion ? 0 : ENTER_OFFSET_PX,
    toOffsetPx: 0,
  };
}

/**
 * Registry of every animation this app performs. Each entry's
 * `animatedProperties` lists only values from the closed set
 * `{ 'transform', 'opacity' }`, proving the app animates nothing else.
 */
export const MOTION_REGISTRY: ReadonlyArray<MotionRegistryEntry> = [
  { name: 'button-hover', animatedProperties: ['transform'] },
  { name: 'button-press', animatedProperties: ['transform'] },
  { name: 'focus-ring', animatedProperties: ['opacity'] },
  { name: 'card-entrance', animatedProperties: ['transform', 'opacity'] },
  { name: 'page-transition', animatedProperties: ['transform', 'opacity'] },
  { name: 'nav-sheet', animatedProperties: ['transform', 'opacity'] },
];
