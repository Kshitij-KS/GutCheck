# Implementation Plan: UI/UX Overhaul

## Overview

This plan implements a presentation-, layout-, motion-, and responsiveness-only overhaul of the GutCheck web app as a series of incremental, integrated steps. It follows the layered architecture from the design: token additions to `globals.css` (Layer 1), shared CSS primitives and motion gates (Layer 2), the pure `lib/motion.ts` helper module plus a WCAG contrast helper (Layer 3), then components (Layer 4). The pure helpers are built early and exercised with `fast-check` property tests so the universal correctness properties are validated before they are wired into components. No data models, business logic, store shape, or API contracts change.

Implementation is in **TypeScript / React (TSX)** with **Tailwind CSS v4 (CSS-first)**, matching the existing codebase. Because this repo pins **Next.js 16.2.4** and **React 19.2.4** with documented breaking changes, the relevant guides under `node_modules/next/dist/docs/` are the source of truth for framework APIs and MUST be consulted before editing navigation, layout, or route-transition code.

## Tasks

- [x] 1. Establish motion foundation, dependencies, and design tokens
  - [x] 1.1 Confirm framework conventions and add pinned dev dependencies
    - Read `node_modules/next/dist/docs/index.md`, the App Router conventions under `node_modules/next/dist/docs/01-app/`, and `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.mdx`; note any `unstable_instant` route-transition guidance and Tailwind v4 CSS-first conventions before touching nav/layout/CSS
    - Add `fast-check` and `@playwright/test` as **pinned (exact-version)** devDependencies in `package.json`
    - _Requirements: framework version constraint (AGENTS.md); enables Requirements 5.3, 6.1, 6.2, 7.2, 8.1, 8.2 testing_

  - [x] 1.2 Add Layer 1 design tokens to `app/globals.css`
    - Append motion easing tokens (`--ease-out`, `--ease-in-out`, `--ease-drawer`), duration tokens (`--dur-press`, `--dur-state`, `--dur-enter`), `--press-scale`, `--stagger-step`, `--stagger-max-index`, `--enter-offset`, the spacing scale (`--space-1`..`--space-12`), elevation tokens (`--shadow-sm`, `--shadow-md`), and `--focus-ring` to `:root`
    - Do NOT modify any existing color/typography token values; only add new tokens
    - Keep shadow tokens within max blur 12px and max opacity 0.12; keep `--dur-state` within 150–200ms; choose `--focus-ring` (`#2F5A3A`) for >= 3:1 contrast on warm surfaces
    - _Requirements: 1.4, 2.1, 5.3, 6.2, 6.3, 7.2_

  - [x] 1.3 Add Layer 2 shared CSS primitives and global motion gates to `app/globals.css`
    - Add `.gc-interactive`, `.gc-enter` (with `@starting-style` + `data-mounted` fallback and `--gc-stagger-index` delay), `.gc-touch` (min 44×44), and a `.gc-toggle` base
    - Wrap hover motion in `@media (hover: hover) and (pointer: fine)` and add the `@media (prefers-reduced-motion: reduce)` block that zeroes transforms and makes entrances opacity-only
    - Ensure the base `.gc-enter` rule defines the settled (visible, final-position) state so content is never stuck hidden when no enhancement path runs
    - _Requirements: 6.1, 6.3, 7.1, 7.3, 7.4, 8.1, 8.2, 8.4, 8.5, 10.1, 10.3_

- [x] 2. Implement the pure motion helper module (`lib/motion.ts`)
  - [x] 2.1 Implement `lib/motion.ts`
    - Define `InteractionKind`, `EntranceVariant`, and `MotionRegistryEntry` types
    - Implement `staggerDelay(index, stepMs?, maxIndex?)` (non-decreasing, per-step delta in [30,80], capped at `step * maxIndex`), `transitionDuration(kind)` (always within [150,200]), `entranceVariants(prefersReducedMotion)` (offset 0 when reduced), and the `MOTION_REGISTRY` constant whose entries only list `transform`/`opacity`
    - No React/DOM imports; pure functions only
    - _Requirements: 6.1, 6.2, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2_

  - [ ]* 2.2 Write property test for the motion registry
    - **Property 1: Only `transform` and `opacity` are ever animated**
    - Use `fast-check` with `numRuns: 100`; tag `// Feature: ui-ux-overhaul, Property 1`
    - **Validates: Requirements 6.1, 6.5**

  - [ ]* 2.3 Write property test for state-transition durations
    - **Property 2: State-transition durations stay within the 150–200ms band**
    - `fast-check`, `numRuns: 100`, tagged comment
    - **Validates: Requirements 6.2**

  - [ ]* 2.4 Write property test for stagger delays
    - **Property 3: Stagger delays cascade by 30–80ms and never run away**
    - Generate arbitrary non-negative indices including large values to exercise the cap
    - **Validates: Requirements 7.2**

  - [ ]* 2.5 Write property test for normal-mode entrance variant
    - **Property 4: Normal-mode entrance is a fade-in-up with a settled terminal state**
    - **Validates: Requirements 7.1, 7.3, 7.4**

  - [ ]* 2.6 Write property test for reduced-motion entrance variant
    - **Property 5: Reduced-motion entrance is opacity-only**
    - **Validates: Requirements 8.1, 8.2**

- [x] 3. Implement the WCAG contrast helper
  - [x] 3.1 Implement a pure contrast helper in `lib/contrast.ts`
    - Implement WCAG relative-luminance and contrast-ratio functions; export a helper that takes the ring color and a surface color and returns the ratio
    - Include the warm-palette surface token values (`--bg-primary`, `--bg-secondary`, `--bg-elevated`, muted tint backgrounds such as `--tl-prioritize-bg`) as a tested set
    - No React/DOM imports
    - _Requirements: 5.3_

  - [ ]* 3.2 Write property test for focus-ring contrast
    - **Property 6: Focus ring meets 3:1 contrast against every surface**
    - Generate colors within the warm-palette family plus the fixed surface-token set; assert ratio `>= 3.0`; `fast-check`, `numRuns: 100`
    - **Validates: Requirements 5.3**

- [x] 4. Checkpoint - Ensure all helper tests pass
  - Ensure all property tests for `lib/motion.ts` and `lib/contrast.ts` pass; ask the user if questions arise.

- [x] 5. Fix the Save Profile banner overlap
  - [x] 5.1 Rebuild `components/dashboard/SaveProfilePrompt.tsx` layout with CSS Grid
    - Convert the container to `display: grid` with a reserved `close` track (mobile `1fr auto` / `"content close"` then `"action action"`; `md+` `auto 1fr auto auto` / `"icon content action close"`) so dismiss, text, and sign-in never overlap at any width
    - Make the dismiss control a `.gc-touch` (44×44) cell with `aria-label="Dismiss save profile prompt"`; add `min-width: 0` and `padding-inline-end` to the content cell as defense-in-depth
    - Preserve `signIn('google')` on the sign-in action, `setDismissed(true)` on dismiss, and the existing `null` guards for signed-in/dismissed states
    - Replace the framer-motion entrance with the CSS `.gc-enter` pattern (simple unmount on dismiss, no exit animation), removing framer-motion from this component
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [ ]* 5.2 Write component tests for `SaveProfilePrompt`
    - Dismiss removes the banner; sign-in calls mocked `signIn('google')`; dismiss control exposes its accessible name; grid template areas/classes present
    - _Requirements: 4.6, 4.7, 4.8, 4.1_

- [x] 6. Modernize shared interactive controls in `app/globals.css`
  - [x] 6.1 Extend buttons, inputs, focus, and toggle styles
    - Tighten `.gc-btn-primary`/`.gc-btn-secondary` transitions to `transform`/`background-color` over `--dur-state` with `--ease-out`; add `:active { transform: scale(var(--press-scale)); }`; route hover motion through the `.gc-interactive` hover gate
    - Set `:focus-visible` to `outline: 2px solid var(--focus-ring); outline-offset: 2px`
    - Implement `.gc-toggle` as a `button[role="switch"]` style conveying on/off via knob position plus a non-color glyph (`✓`/`✕`) driven by `aria-checked`
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 6.3, 6.4_

  - [ ]* 6.2 Write tests for shared controls and motion gating
    - Buttons map to `gc-btn-primary`/`gc-btn-secondary`; `:focus-visible`/active rules use `outline` and `scale(0.97)`; toggle exposes a non-color cue in both states; hover rules nested in the fine-pointer media query; reduced-motion block zeroes transforms while keeping controls operable
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 6.4, 8.3, 8.4, 8.5_

- [x] 7. Apply staggered entrance to dashboard collections
  - [x] 7.1 Wrap dashboard cards/lists with the `.gc-enter` stagger pattern
    - In `app/dashboard/page.tsx` (and relevant `components/dashboard/*` wrappers), add `.gc-enter` and set `style={{ '--gc-stagger-index': i }}` for quick-action cards, marker cards, and trend cards, clamping `i` via `staggerDelay`'s index cap
    - Preserve the existing set of displayed information fields and the `gc-card` treatment
    - _Requirements: 1.1, 1.3, 2.5, 3.1, 7.1, 7.2, 7.3, 7.4_

  - [ ]* 7.2 Write tests for dashboard entrance and field preservation
    - Cards receive `.gc-enter` and a clamped stagger index; all pre-existing information fields remain present
    - _Requirements: 2.5, 7.1, 7.2_

- [x] 8. Implement thumb-optimized responsive navigation
  - [x] 8.1 Add the mobile bottom navigation bar and "More" sheet to `components/layout/Navbar.tsx`
    - Keep the persistent top bar for tablet/desktop unchanged in destination structure; reuse `NAV_LINKS` as the single source of destinations
    - Add a `position: fixed; bottom: 0` bottom bar in the Thumb_Zone (`padding-bottom: env(safe-area-inset-bottom)`) showing primary destinations as 44×44 targets plus a "More" control that opens the existing slide-out sheet for overflow destinations
    - Retain `useFocusTrap`, Escape handling, scrim, and close button on the sheet; keep `usePathname()` active-route detection; keep the sheet on framer-motion with the `--ease-drawer` curve; confirm `usePathname`/`Link` conventions against the version docs before editing
    - _Requirements: 3.4, 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 8.2 Offset page content for the mobile bottom bar in `components/layout/AppShell.tsx`
    - Add mobile bottom padding to the main content region so the fixed bottom bar never occludes content; structure otherwise unchanged
    - _Requirements: 9.1, 11.1_

  - [ ]* 8.3 Write component tests for `Navbar`
    - Destination set equals `NAV_LINKS` at mobile/tablet/desktop widths; each destination links to its route; thumb-zone control renders at mobile and persistent bar at desktop; sheet open renders a close control and traps focus
    - _Requirements: 3.4, 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 9. Reconcile route transitions in `components/layout/PageTransition.tsx`
  - [x] 9.1 Convert the page wrapper to the CSS `.gc-enter` transition (or retain framer-motion using the `--ease-out` curve and a `transform` string)
    - Animate only `transform`/`opacity`; honor reduced-motion; verify against `instant-navigation.mdx` so the change does not regress client-navigation correctness (apply `unstable_instant` route export if the docs require it)
    - _Requirements: 6.1, 6.3, 8.1, 8.2_

- [ ] 10. Integration / visual-responsive verification (real browser)
  - [ ]* 10.1 Write Playwright test for banner non-overlap across viewport bands
    - Measure `getBoundingClientRect()` of dismiss control, sign-in action, and heading/body; assert no pairwise intersection at mobile (320–480), tablet (768–1024), desktop (>=1200)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 10.2 Write Playwright test for no horizontal scrolling
    - Assert `documentElement.scrollWidth <= clientWidth` on each primary page at each band
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 10.3 Write Playwright test for responsive dashboard columns and field preservation
    - Assert quick-action grid renders 1–2 columns on mobile and >=3 on desktop (degrading when too narrow); assert every information field stays visible across breakpoint crossings
    - _Requirements: 9.4, 9.5, 9.6_

  - [ ]* 10.4 Write Playwright test for touch targets and section spacing
    - Assert every interactive element measures >=44×44 at mobile/tablet, small graphics are expanded to 44×44, adjacent hit areas do not intersect, and adjacent grouped sections have >=1.5rem spacing
    - _Requirements: 2.4, 10.1, 10.2, 10.3, 10.4_

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all property, component, and integration tests pass; ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster MVP; core implementation tasks are never optional.
- Property tests (2.2–2.6, 3.2) map 1:1 to Properties 1–6 in the design and use `fast-check` with a minimum of 100 runs each.
- Layout, overlap, responsive, and touch-target criteria are geometric and verified with real-browser (Playwright) tests rather than property tests, since jsdom cannot measure layout.
- Each task references specific requirements clauses for traceability; checkpoints provide incremental validation.
- No data models, business logic, store shape, or API contracts change — presentation, layout, motion, and responsiveness only.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "3.1"] },
    { "id": 1, "tasks": ["1.2", "2.2", "2.3", "2.4", "2.5", "2.6", "3.2"] },
    { "id": 2, "tasks": ["1.3"] },
    { "id": 3, "tasks": ["6.1"] },
    { "id": 4, "tasks": ["5.1", "7.1", "8.1", "9.1"] },
    { "id": 5, "tasks": ["5.2", "6.2", "7.2", "8.2", "8.3"] },
    { "id": 6, "tasks": ["10.1", "10.2", "10.3", "10.4"] }
  ]
}
```
