// Feature: ui-ux-overhaul — Task 6.2 tests for shared interactive controls and
// motion gating. These rules live in `app/globals.css`, so the assertions read
// the stylesheet text directly (jsdom does not apply author stylesheets or
// evaluate @media queries, so computed-style checks are not meaningful here).
//
// Validates: Requirements 5.1 (shared button classes), 5.2 (primary/secondary
// treatments), 5.4 (focus-visible outline ring), 5.5 (toggle non-color cue in
// both states), 6.4 (scale(0.97) on press), 8.3 (controls operable under
// reduced motion), 8.4 / 8.5 (hover motion gated to fine-pointer devices).

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

let css = '';

beforeAll(() => {
  // Vitest runs from the workspace root, so resolve the stylesheet from cwd.
  // Strip CSS comments first: some comments mention `@media (hover...)` in prose
  // and would otherwise confuse the block extractor / matchers.
  css = readFileSync(resolve(process.cwd(), 'app/globals.css'), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );
});

/**
 * Extract the body of the first `@media <query> { ... }` block whose header
 * contains `headerNeedle`, using brace matching so nested rules are included.
 */
function extractMediaBlock(source: string, headerNeedle: string): string | null {
  const atIdx = source.indexOf('@media');
  let searchFrom = 0;
  while (searchFrom < source.length) {
    const start = source.indexOf('@media', searchFrom);
    if (start === -1) break;
    const braceOpen = source.indexOf('{', start);
    if (braceOpen === -1) break;
    const header = source.slice(start, braceOpen);
    if (header.includes(headerNeedle)) {
      // Walk braces to find the matching close.
      let depth = 0;
      for (let i = braceOpen; i < source.length; i++) {
        if (source[i] === '{') depth++;
        else if (source[i] === '}') {
          depth--;
          if (depth === 0) return source.slice(braceOpen + 1, i);
        }
      }
    }
    searchFrom = braceOpen + 1;
  }
  void atIdx;
  return null;
}

describe('globals.css shared controls and motion gating', () => {
  it('defines shared primary and secondary button classes (Req 5.1, 5.2)', () => {
    expect(css).toMatch(/\.gc-btn-primary\s*\{/);
    expect(css).toMatch(/\.gc-btn-secondary\s*\{/);
  });

  it('renders the focus state as an outline ring using var(--focus-ring) (Req 5.4)', () => {
    expect(css).toMatch(
      /:focus-visible\s*\{[^}]*outline:[^;}]*var\(--focus-ring\)[^}]*\}/,
    );
  });

  it('applies scale(var(--press-scale)) on the active/press state, equal to 0.97 (Req 6.4)', () => {
    // The token resolves to 0.97 ...
    expect(css).toMatch(/--press-scale:\s*0?\.97\s*;/);
    // ... and at least one :active rule applies it as a scale transform.
    expect(css).toMatch(/:active\s*\{[^}]*transform:\s*scale\(var\(--press-scale\)\)/);
  });

  it('conveys toggle on/off via a non-color glyph in both states (Req 5.5)', () => {
    // Off state: ✕ on the default ::after.
    expect(css).toMatch(/\.gc-toggle::after\s*\{[^}]*content:\s*"✕"/);
    // On state: ✓ driven by aria-checked="true".
    expect(css).toMatch(
      /\.gc-toggle\[aria-checked="true"\]::after\s*\{[^}]*content:\s*"✓"/,
    );
    // The knob position also moves with aria-checked (a second non-color cue).
    expect(css).toMatch(
      /\.gc-toggle\[aria-checked="true"\]::before\s*\{[^}]*transform:\s*translateX/,
    );
  });

  it('gates hover motion behind @media (hover: hover) and (pointer: fine) (Req 8.4, 8.5)', () => {
    const block = extractMediaBlock(css, '(hover: hover) and (pointer: fine)');
    expect(block).not.toBeNull();
    // The hover lift lives only inside the fine-pointer gate.
    expect(block as string).toMatch(/:hover\s*\{[^}]*transform:/);
    // And no ungated `.gc-interactive:hover { transform: ... }` exists outside it.
    const outside = (css as string).replace(block as string, '');
    expect(outside).not.toMatch(/\.gc-interactive:hover\s*\{[^}]*transform:\s*translateY/);
  });

  it('zeroes transforms under prefers-reduced-motion while keeping controls operable (Req 8.3)', () => {
    const block = extractMediaBlock(css, 'prefers-reduced-motion: reduce');
    expect(block).not.toBeNull();
    const reduced = block as string;
    // Motion is removed ...
    expect(reduced).toMatch(/transform:\s*none/);
    // ... but controls remain fully operable: nothing hides or disables them.
    expect(reduced).not.toMatch(/display:\s*none/);
    expect(reduced).not.toMatch(/visibility:\s*hidden/);
    expect(reduced).not.toMatch(/pointer-events:\s*none/);
  });
});
