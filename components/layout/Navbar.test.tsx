// Feature: ui-ux-overhaul — Task 8.3 component tests for the responsive Navbar.
//
// jsdom does not evaluate CSS media queries, so the mobile bottom bar and the
// persistent desktop bar both exist in the DOM gated by Tailwind `md:` classes.
// These tests therefore assert on presence/classes rather than pixel widths.
//
// Validates: Requirements 3.4 / 11.5 (same destination set everywhere), 11.3
// (each destination links to its route), 11.1 (thumb-zone control on mobile),
// 11.2 (persistent bar on desktop), 11.4 (open sheet has a close control and
// traps focus via useFocusTrap).

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// The canonical destination set (mirrors NAV_LINKS in Navbar.tsx).
const EXPECTED_DESTINATIONS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/scan', label: 'Scan Menu' },
  { href: '/grocery', label: 'Groceries' },
  { href: '/chef-card', label: "Chef's Card" },
  { href: '/history', label: 'History' },
  { href: '/profile', label: 'Profile' },
];

// --- Mocks --------------------------------------------------------------------
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: unknown; children: React.ReactNode }) =>
    React.createElement('a', { href: typeof href === 'string' ? href : '', ...rest }, children),
}));

vi.mock('@/store/gutcheck.store', () => ({
  // Navbar calls useGutCheckStore((s) => s.isOnboarded); apply the selector to a
  // minimal state so the onboarded UI (top bar + bottom bar) renders.
  useGutCheckStore: (selector: (s: { isOnboarded: boolean }) => unknown) =>
    selector({ isOnboarded: true }),
}));

// framer-motion mock that FORWARDS REFS — required so the sheet's ref (the
// useFocusTrap container) resolves to the real <aside> DOM node.
vi.mock('framer-motion', () => {
  const FRAMER_PROPS = new Set([
    'initial', 'animate', 'exit', 'transition', 'variants',
    'whileHover', 'whileTap', 'whileFocus', 'whileInView', 'layout', 'layoutId',
  ]);
  const make = (tag: string) =>
    React.forwardRef<HTMLElement, Record<string, unknown>>(({ children, ...rest }, ref) => {
      const clean: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(rest)) if (!FRAMER_PROPS.has(k)) clean[k] = v;
      return React.createElement(tag, { ...clean, ref }, children as React.ReactNode);
    });
  const motion = new Proxy({}, { get: (_t, tag: string) => make(tag) });
  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

import { Navbar } from './Navbar';

describe('Navbar destinations', () => {
  it('renders the full NAV_LINKS destination set, each linking to its route (Req 3.4, 11.3, 11.5)', () => {
    render(<Navbar />);

    const hrefs = new Set(
      screen.getAllByRole('link').map((a) => a.getAttribute('href')),
    );
    for (const dest of EXPECTED_DESTINATIONS) {
      expect(hrefs.has(dest.href)).toBe(true);
      // A link with that accessible name points at the expected route.
      const matching = screen
        .getAllByRole('link', { name: dest.label })
        .map((a) => a.getAttribute('href'));
      expect(matching).toContain(dest.href);
    }
  });
});

describe('Navbar responsive structure', () => {
  it('renders a thumb-zone bottom bar with a "More" control on mobile (Req 11.1)', () => {
    render(<Navbar />);

    const bottomBar = screen.getByRole('navigation', { name: 'Primary' });
    // Fixed to the bottom (thumb zone) and shown only on small screens.
    expect(bottomBar.className).toContain('fixed');
    expect(bottomBar.className).toContain('bottom-0');
    expect(bottomBar.className).toContain('md:hidden');

    expect(screen.getByRole('button', { name: 'More' })).toBeInTheDocument();
  });

  it('renders a persistent top bar for desktop, gated by md: classes (Req 11.2)', () => {
    const { container } = render(<Navbar />);

    const topBar = container.querySelector('nav.sticky');
    expect(topBar).not.toBeNull();
    // Desktop destination row is present in the DOM, revealed at md+.
    const desktopRow = (topBar as HTMLElement).querySelector('.md\\:flex');
    expect(desktopRow).not.toBeNull();
    // All six destinations live in the persistent bar.
    const labels = EXPECTED_DESTINATIONS.map((d) => d.label);
    for (const label of labels) {
      expect(within(desktopRow as HTMLElement).getByText(label)).toBeInTheDocument();
    }
  });
});

describe('Navbar slide-out sheet', () => {
  it('opens a sheet with a close control and traps focus inside it (Req 11.4)', async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    // Sheet is closed initially.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'More' }));

    const dialog = screen.getByRole('dialog', { name: 'More navigation' });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    // A close control exists inside the sheet.
    const close = within(dialog).getByRole('button', { name: 'Close menu' });
    expect(close).toBeInTheDocument();

    // Overflow destinations are reachable inside the sheet.
    expect(within(dialog).getByRole('link', { name: 'History' })).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: 'Profile' })).toBeInTheDocument();

    // Focus has been moved into the open sheet (focus trap engaged).
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('closes the sheet when the close control is activated', async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    await user.click(screen.getByRole('button', { name: 'More' }));
    const dialog = screen.getByRole('dialog', { name: 'More navigation' });
    await user.click(within(dialog).getByRole('button', { name: 'Close menu' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
