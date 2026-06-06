# Requirements — GutCheck Enhancements

## Introduction

This spec covers a batch of feature, UX, accessibility, resilience, and quality
upgrades for GutCheck. The guiding constraints:

- **Reuse the existing design system** (CSS variables in `app/globals.css`,
  `gc-card` / `gc-btn-*` / `gc-input` classes, the `--font-display/body/mono`
  trio, traffic-light tokens, and the Framer Motion `AnimatePresence` patterns).
  No new color language.
- **Simplistic, clean, user-friendly.** New surfaces are quiet, optional, and
  dismissible. Nothing blocks the user.
- **Do no harm.** Existing working behavior must not regress. Every phase ends
  with `tsc --noEmit`, the Vitest suite, and (where relevant) `next build`.

Out of scope (explicitly excluded by request): manual marker entry/correction,
and multi-language UI/AI.

---

## Requirement 1 — Foundations & integrity

**User story:** As a user, I want consistent feedback and a correctly built app,
so the experience feels trustworthy and polished.

#### Acceptance Criteria
1. WHEN any notable action completes (save, sync, delete, rate-limit) THEN the system SHALL show a quiet, auto-dismissing toast consistent with the design tokens.
2. WHEN the app loads THEN the system SHALL use the Next.js font-loader variables (custom fonts), not system fallbacks.
3. WHEN the profile confirmation screen is shown THEN its privacy copy SHALL accurately state that reports are processed server-side in-memory and the profile is stored on-device.
4. WHEN a persisted store from a previous version is loaded THEN the system SHALL migrate it without data loss and without runtime errors.
5. WHEN a server route logs an error THEN it SHALL route through a single logging seam that never emits health payloads.
6. WHEN the PDF preview renders THEN the pdf.js worker SHALL be served from the app's own origin (not a third-party CDN).

## Requirement 2 — Personalization inputs (location, dietary, allergies)

**User story:** As a user, I want to optionally tell GutCheck where I live and my
dietary needs, so guidance is regionally and personally relevant.

#### Acceptance Criteria
1. WHEN onboarding completes OR on the profile page THEN the user SHALL be able to set an optional location.
2. WHEN a location is set THEN seasonal tips and the translation prompt SHALL use it instead of the hardcoded "India".
3. WHEN the user sets dietary preferences and/or allergies THEN they SHALL persist and be passed to translation, menu scan, grocery audit, and the Chef's Card.
4. WHEN an allergy is set THEN allergens SHALL be treated as absolute avoids, including in the offline keyword fallback tree.
5. WHEN the user skips these inputs THEN the app SHALL function exactly as before (all optional).

## Requirement 3 — Scan experience

**User story:** As a user, I want scans to feel alive and reviewable, so I trust
the result and can revisit past checks.

#### Acceptance Criteria
1. WHILE a menu or grocery scan is streaming THEN the system SHALL progressively reveal incoming reasoning text, then replace it with structured results on completion.
2. IF the final result fails to parse THEN any streamed text SHALL still be shown and a clear error surfaced.
3. WHEN the user has saved scans/audits THEN a "Recent" section on the scan/grocery pages SHALL list them, allow re-opening, deleting one, and clearing all.
4. WHILE offline THEN the Camera and Upload Photo modes SHALL be visibly disabled with an explanation, while Quick Query and Paste Menu remain available.
5. WHEN a request is rate-limited (HTTP 429) THEN the user SHALL see the actual "too many requests" message, not a generic failure.

## Requirement 4 — Onboarding & profile flow

**User story:** As a returning user uploading a new report, I want to see what
changed and be able to undo, so I never lose my prior profile by accident.

#### Acceptance Criteria
1. WHEN replacing an existing profile THEN the system SHALL show a before/after diff of shared markers (plus added/removed) before committing.
2. WHEN the new profile is committed THEN the system SHALL offer a time-boxed Undo that restores the previous profile.
3. WHILE the pipeline is retrying a transient failure THEN the UI SHALL show a calm "reattempting" state on the active step rather than flashing the error card.

## Requirement 5 — True offline (PWA)

**User story:** As an installed-PWA user, I want the app to open and work offline,
so guidance is available without a connection.

#### Acceptance Criteria
1. WHEN the PWA is installed and launched offline (cold start) THEN the app shell and core routes SHALL load from cache.
2. WHEN offline THEN `/api/*` requests SHALL NOT be served from cache.
3. WHEN a new service worker version is available THEN the user SHALL be prompted (toast) to refresh.
4. WHEN offline THEN Quick Query and Paste Menu SHALL produce keyword-based results from the cached profile.

## Requirement 6 — Drive sync resilience

**User story:** As a multi-device user, I want predictable, visible Drive backup,
so I never silently lose data.

#### Acceptance Criteria
1. WHEN signed in THEN the user SHALL be able to explicitly "Restore from Drive" in addition to auto-merge on login.
2. WHEN a merge occurs THEN the user SHALL be told what happened (restored / already up to date), and newer local edits SHALL never be silently overwritten.
3. WHEN sync state changes THEN the profile page SHALL show synced status and last-synced time, with toasts on push/restore success or failure.
4. The Drive file strategy (single blob vs. profile+history files) SHALL be consistent across read, write, and wipe.

## Requirement 7 — Cross-cutting quality

**User story:** As any user (including assistive-tech users), I want an accessible,
well-tested, observable app.

#### Acceptance Criteria
1. WHEN navigating via keyboard/screen reader THEN all interactive elements SHALL have visible focus, accessible names, and status conveyed by more than color.
2. WHEN modals (Clean Slate, mobile nav) are open THEN focus SHALL be trapped and restored on close.
3. WHEN scan/audit results arrive THEN the result region SHALL announce via `aria-live`.
4. THEN the safety/logic-critical modules (deterministic guardrail, trend/delta, offline fallback, Drive merge, store migration) SHALL have unit tests.
5. WHEN a route fails THEN error counts SHALL be observable via the logging seam.
