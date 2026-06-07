// lib/contrast.ts
//
// Pure WCAG contrast helper (Layer 3 of the UI/UX overhaul).
//
// This module computes WCAG 2.x relative luminance and contrast ratios for
// sRGB colors. It is the pure-function surface that the focus-ring contrast
// property test (Property 6) exercises: it proves the `--focus-ring` token
// clears a 3:1 contrast ratio against every warm-palette surface token.
//
// The surface-token set mirrors the real values declared in `app/globals.css`:
//   --bg-primary:       #FAF8F4  (warm off-white)
//   --bg-secondary:     #F3EFE8  (warm sand)
//   --bg-elevated:      #FFFFFF
//   --tl-prioritize-bg: #EAF4EE  (muted sage tint)
//   --tl-moderate-bg:   #FDF5E0  (muted amber tint)
//   --tl-avoid-bg:      #F5EDEA  (muted terracotta tint)
// and the focus-ring token:
//   --focus-ring:       #2F5A3A  (darkened sage, chosen for >= 3:1 contrast)
//
// IMPORTANT: This module is intentionally framework-free. It has NO React or DOM
// imports — pure functions and constants only — so it is unit/property testable
// in isolation.

/** An sRGB color with 8-bit integer channels in the range [0, 255]. */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/** A named design-token surface plus its literal hex value. */
export interface SurfaceToken {
  /** The CSS custom-property name, e.g. `--bg-primary`. */
  name: string;
  /** The literal hex value, e.g. `#FAF8F4`. */
  hex: string;
}

// ---------------------------------------------------------------------------
// Design-token values — mirror app/globals.css.
// ---------------------------------------------------------------------------

/** The focus-ring token value. Mirrors `--focus-ring: #2F5A3A`. */
export const FOCUS_RING_HEX = '#2F5A3A';

/**
 * The warm-palette surface tokens the focus ring must remain legible against.
 * Values are read directly from `app/globals.css`. Property 6 iterates over
 * this set and asserts the contrast ratio against `FOCUS_RING_HEX` is >= 3.0.
 */
export const SURFACE_TOKENS: ReadonlyArray<SurfaceToken> = [
  { name: '--bg-primary', hex: '#FAF8F4' },
  { name: '--bg-secondary', hex: '#F3EFE8' },
  { name: '--bg-elevated', hex: '#FFFFFF' },
  { name: '--tl-prioritize-bg', hex: '#EAF4EE' },
  { name: '--tl-moderate-bg', hex: '#FDF5E0' },
  { name: '--tl-avoid-bg', hex: '#F5EDEA' },
];

// ---------------------------------------------------------------------------
// Hex parsing.
// ---------------------------------------------------------------------------

/**
 * Parse a hex color string into its 8-bit RGB channels.
 *
 * Accepts 3-digit (`#abc`), 6-digit (`#aabbcc`), and the same forms without the
 * leading `#`. Casing is irrelevant. Throws on malformed input so callers never
 * silently operate on a bad color.
 *
 * @param hex A hex color string.
 * @returns The parsed {@link RGB} channels.
 * @throws {Error} If `hex` is not a valid 3- or 6-digit hex color.
 */
export function parseHexColor(hex: string): RGB {
  const cleaned = hex.trim().replace(/^#/, '');

  let normalized: string;
  if (/^[0-9a-fA-F]{3}$/.test(cleaned)) {
    // Expand shorthand: `abc` -> `aabbcc`.
    normalized = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  } else if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    normalized = cleaned;
  } else {
    throw new Error(`Invalid hex color: "${hex}"`);
  }

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

// ---------------------------------------------------------------------------
// WCAG relative luminance and contrast ratio.
// ---------------------------------------------------------------------------

/**
 * Linearize a single gamma-encoded sRGB channel per the WCAG definition.
 *
 * @param channel8bit Channel value in [0, 255].
 * @returns The linearized channel value in [0, 1].
 */
function linearizeChannel(channel8bit: number): number {
  const c = channel8bit / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * WCAG relative luminance of an sRGB color (the "L" in the contrast formula).
 *
 * Accepts either an {@link RGB} object or a hex string. The result is in the
 * range [0, 1], where 0 is black and 1 is white.
 *
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function relativeLuminance(color: RGB | string): number {
  const { r, g, b } = typeof color === 'string' ? parseHexColor(color) : color;
  const rl = linearizeChannel(r);
  const gl = linearizeChannel(g);
  const bl = linearizeChannel(b);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/**
 * WCAG contrast ratio between two colors.
 *
 * The ratio is `(Llighter + 0.05) / (Ldarker + 0.05)` and ranges from 1:1
 * (identical colors) to 21:1 (black vs white). The computation is symmetric in
 * its arguments. Each color may be an {@link RGB} object or a hex string.
 *
 * @see https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
export function contrastRatio(a: RGB | string, b: RGB | string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Contrast ratio between a focus-ring color and a surface (background) color.
 *
 * This is a thin, intent-revealing wrapper over {@link contrastRatio} used by
 * the focus-ring contrast checks. WCAG 2.4 requires a non-text UI component
 * such as a focus indicator to clear 3:1 against adjacent colors.
 *
 * @param ringColor    The focus-ring color (RGB or hex).
 * @param surfaceColor The adjacent surface/background color (RGB or hex).
 * @returns The numeric contrast ratio (>= 1).
 */
export function focusRingContrast(
  ringColor: RGB | string,
  surfaceColor: RGB | string,
): number {
  return contrastRatio(ringColor, surfaceColor);
}
