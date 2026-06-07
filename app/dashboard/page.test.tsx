// Feature: ui-ux-overhaul — Task 7.2 tests for the dashboard staggered entrance
// and information-field preservation.
//
// Strategy: render the real DashboardPage so the genuine quick-action cards and
// the real MarkerGrid/MarkerCard collection are exercised. Unrelated sibling
// components (profile snapshot, tips, save prompt) are stubbed so the test stays
// focused on the entrance/stagger behaviour and the marker fields.
//
// Validates: Requirements 2.5 (information fields preserved), 7.1 (cards get the
// fade-in-up entrance class), 7.2 (per-item stagger index, clamped so it never
// exceeds the cap of 8).

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// --- Fixtures (hoisted so the store mock factory can use them) ---------------
const { mockProfile } = vi.hoisted(() => {
  const makeMarker = (i: number) => ({
    id: `m${i}`,
    name: `Marker ${i}`,
    value: `${10 + i}`,
    unit: `u${i}`,
    unitAmbiguous: false,
    numericValue: 10 + i,
    reportedRange: null,
    standardRange: `0-${100 + i}`,
    status: 'OPTIMAL',
    implication: '',
    foodRules: { strictAvoid: [], moderate: [], prioritize: [] },
    movementRules: { recommended: [], avoid: [], breathworkSuggestions: [] },
    hydrationRules: [],
  });
  // 10 markers so indices 8 and 9 both clamp to the max stagger index of 8.
  const markers = Array.from({ length: 10 }, (_, i) => makeMarker(i));
  return {
    mockProfile: {
      id: 'p1',
      schemaVersion: '1.0',
      createdAt: '',
      updatedAt: '',
      reportDate: null,
      reportLabName: null,
      specialPopulation: 'none',
      markers,
      primaryConcerns: [],
      overallSummary: '',
      consolidatedRules: {
        strictAvoid: [],
        moderate: [],
        prioritize: [],
        hydrationGuidance: '',
        movementGuidance: [],
        cuisineGuidance: '',
      },
      chefCardContent: {
        title: '',
        intro: '',
        strictAvoidList: [],
        moderateList: [],
        allergyNotes: null,
        additionalNote: null,
      },
      offlineFallbackTree: {},
    },
  };
});

// --- Mocks --------------------------------------------------------------------
vi.mock('@/store/gutcheck.store', () => ({
  useGutCheckStore: () => ({
    isOnboarded: true,
    healthProfile: mockProfile,
    reportHistory: [],
    location: 'India',
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/dashboard',
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: unknown; children: React.ReactNode }) =>
    React.createElement('a', { href: typeof href === 'string' ? href : '', ...rest }, children),
}));

// framer-motion (used by MarkerCard) → strip animation-only props so they don't
// leak onto real DOM nodes, but keep children/structure intact.
vi.mock('framer-motion', () => {
  const FRAMER_PROPS = new Set([
    'initial', 'animate', 'exit', 'transition', 'variants',
    'whileHover', 'whileTap', 'whileFocus', 'whileInView', 'layout', 'layoutId',
  ]);
  const make = (tag: string) =>
    ({ children, ...rest }: Record<string, unknown>) => {
      const clean: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(rest)) if (!FRAMER_PROPS.has(k)) clean[k] = v;
      return React.createElement(tag, clean, children as React.ReactNode);
    };
  const motion = new Proxy({}, { get: (_t, tag: string) => make(tag) });
  return { motion, AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children) };
});

// Stub unrelated sibling components so the test isolates the animated collections.
vi.mock('@/components/dashboard/ProfileSnapshot', () => ({
  ProfileSnapshot: () => React.createElement('div', { 'data-testid': 'profile-snapshot' }),
}));
vi.mock('@/components/dashboard/DailyNudge', () => ({
  DailyNudge: () => React.createElement('div', { 'data-testid': 'daily-nudge' }),
}));
vi.mock('@/components/dashboard/SeasonalTip', () => ({
  SeasonalTip: () => React.createElement('div', { 'data-testid': 'seasonal-tip' }),
}));
vi.mock('@/components/dashboard/SaveProfilePrompt', () => ({
  SaveProfilePrompt: () => React.createElement('div', { 'data-testid': 'save-prompt' }),
}));

import DashboardPage from './page';

describe('DashboardPage staggered entrance and field preservation', () => {
  it('applies the .gc-enter entrance class to quick-action and marker cards (Req 7.1)', () => {
    const { container } = render(<DashboardPage />);
    const entering = container.querySelectorAll('.gc-enter');
    // 4 quick-action cards + 10 marker cards = 14 entrance-animated cards.
    expect(entering.length).toBe(14);
  });

  it('sets a per-item --gc-stagger-index on every entering card, clamped to <= 8 (Req 7.2)', () => {
    const { container } = render(<DashboardPage />);
    const entering = Array.from(container.querySelectorAll<HTMLElement>('.gc-enter'));

    const indices = entering.map((el) => el.style.getPropertyValue('--gc-stagger-index'));
    // Every card carries an explicit index.
    expect(indices.every((v) => v !== '')).toBe(true);

    const numeric = indices.map((v) => Number(v));
    expect(numeric.every((n) => Number.isInteger(n) && n >= 0 && n <= 8)).toBe(true);
    // With 10 markers (indices 8 and 9), the cap is actually exercised.
    expect(Math.max(...numeric)).toBe(8);
  });

  it('preserves the existing marker information fields (Req 2.5)', () => {
    render(<DashboardPage />);

    // Marker name, value, unit, standard range, and status label all remain.
    expect(screen.getByText('Marker 0')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // value of Marker 0
    expect(screen.getByText('u0')).toBeInTheDocument(); // unit of Marker 0
    expect(screen.getByText('Normal: 0-100')).toBeInTheDocument(); // standard range
    // Status label is rendered for every marker (all OPTIMAL here).
    expect(screen.getAllByText('Optimal').length).toBe(10);

    // Quick-action destinations preserved.
    expect(screen.getByText('Scan menu')).toBeInTheDocument();
    expect(screen.getByText('Audit grocery list')).toBeInTheDocument();
    expect(screen.getByText("Chef's card")).toBeInTheDocument();
    expect(screen.getByText('View history')).toBeInTheDocument();

    // Section heading preserved.
    expect(screen.getByRole('heading', { name: 'Your markers' })).toBeInTheDocument();
  });
});
