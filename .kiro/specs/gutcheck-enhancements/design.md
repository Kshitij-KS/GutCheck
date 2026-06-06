# Design — GutCheck Enhancements

## Overview

Incremental upgrades layered onto the existing Next.js 16 / React 19 / Zustand
app. The work is organized into 6 phases ordered by dependency and risk. Schema
changes are concentrated behind a single store-version bump. All UI is built from
existing tokens/classes.

## Design system reference (must reuse)

- Tokens: `--bg-primary/secondary/elevated`, `--text-primary/secondary/muted`,
  `--accent`/`--accent-hover`, `--border`/`--border-strong`,
  `--tl-prioritize|moderate|avoid` (+ `-bg`), `--status-*`.
- Fonts: `--font-display` (Cormorant), `--font-body` (DM Sans), `--font-mono` (DM Mono).
- Classes: `gc-card`, `gc-btn-primary`, `gc-btn-secondary`, `gc-input`,
  `gc-textarea`, `gc-safe-top`, `gc-pb-safe`, `no-print`.
- Motion: Framer Motion `AnimatePresence`, 0.2–0.4s easeOut; honor
  `prefers-reduced-motion`.

---

## Phase 0 — Foundations & quick wins

### 0.1 Privacy copy fix
`components/onboard/ProfileConfirmation.tsx` — replace inaccurate "never sent to
any server" with on-device/encrypted-processing wording matching the onboard page.

### 0.2 Font variable bug
`app/globals.css` — the second `:root` font block overrides the Next.js
font-loader bridge. Remove the duplicate plain-font declarations so
`--font-display/body/mono` keep referencing `--font-cormorant/-dm-sans/-dm-mono`.

### 0.3 Self-host pdf.js worker
`components/onboard/PDFPreview.tsx` — set `GlobalWorkerOptions.workerSrc` to a
bundled/own-origin worker. Use `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)`
(Turbopack-compatible) so version always matches the installed package.

### 0.4 Toast system
- `store/ui.store.ts` (new, ephemeral): `toasts: Toast[]`, `pushToast`, `dismissToast`.
  `Toast = { id, variant: 'success'|'info'|'error', message }`.
- `components/shared/Toast.tsx` (new): viewport + item. `gc-card`, `--bg-elevated`,
  left accent bar by variant (`--tl-prioritize`/`--tl-moderate`/`--tl-avoid`),
  auto-dismiss ~3.5s, tap/swipe dismiss, `AnimatePresence`. `role="status"`,
  `aria-live="polite"`. Bottom-center mobile, bottom-right desktop.
- Mount once in `AppShell.tsx`.

### 0.5 Logging seam
`lib/utils.ts` — `logger` methods funnel through `report(level, component, msg, meta?)`.
Console sink always; optional server sink behind env (no-op if unset). Add helper
`logRouteError(component, code, err)` used by API routes. Never log payloads.

### 0.6 Store migration scaffold
`store/gutcheck.store.ts` — `STORE_VERSION = 2`; `migrate` backfills new optional
fields (`location` already present; add `dietaryPreferences: []`, `allergies: []`).
Unit test for v1→v2.

---

## Phase 1 — Personalization inputs

### Types & store
`types/index.ts` — extend `HealthProfile`? No: keep these as **user context** on
the store (not the AI-built profile) to avoid contaminating the parsed profile.
Add to `GutCheckStore`: `dietaryPreferences: string[]`, `allergies: string[]`,
plus `setDietaryPreferences`, `setAllergies` (and reuse existing `location`/`setLocation`).
`UserContext` type extended with `dietaryPreferences`, `allergies`.

### UI — reusable chip selector
`components/shared/ChipSelect.tsx` (new): toggleable pills using `--tl-moderate-bg`
/ accent-selected states; matches existing pill styling in `MarkerCard`/`ChefCard`.
Used for dietary presets; free-text allergy via `gc-input` + add-on chips.

### Entry points
- Onboarding: a new optional step rendered in `ProfileConfirmation` (or a small
  step before save) — "Personalize (optional)" with location + diet + allergies.
  Skippable with a secondary button.
- Profile page (`app/profile/page.tsx`): an editable "Preferences" `gc-card`.

### Wiring
- `dashboard/page.tsx`: `SeasonalTip location={location ?? 'India'}`.
- `useAgentPipeline` translate fetch: include `userContext { location, dietaryPreferences, allergies }`.
- Translate route already accepts `userContext`; extend its Zod schema + prompt builder.
- `useMenuScan`/`useGroceryScan`: include allergies/diet in the profile JSON sent
  (extend the object beyond `consolidatedRules`), and prompt builders mention them.
- `lib/offline/cache-builder.ts`: seed `avoidKeywords` with allergy terms.

---

## Phase 2 — Scan experience

### 2.1 Progressive streaming
- `useMenuScan`/`useGroceryScan`: SSE consumer gains an `onChunk` that accumulates
  `streamingText`; expose it in state (`{ status:'scanning', streamingText }`).
- Reuse `components/shared/StreamingText.tsx`; show inside the loading area on
  `/scan` and `/grocery`. On `done`, clear and render structured cards.

### 2.2 Scan history UI
- New `components/scan/RecentScans.tsx` and `components/grocery/RecentAudits.tsx`
  (or one generic `RecentList`): compact `gc-card` rows (summary + `formatDate`),
  expandable to the full `DishResultCard`/`GroceryAuditResults`.
- Store: add `removeScanResult(index|id)`, `clearScanHistory`,
  `removeGroceryResult`, `clearGroceryHistory`. (Note: results lack stable ids;
  add `id`/`timestamp`-based key or index-based removal.)
- Collapsed by default (`<details>`-style or a toggle) to keep pages clean.

### 2.3 Offline-aware mode toggle
`ScanModeToggle.tsx` — add `disabledModes?: ScanMode[]`; disabled tabs get
`aria-disabled`, reduced opacity, and a tooltip/inline hint. `/scan` passes
`['camera','menu-upload']` when `!isOnline`. If current mode becomes disabled on
going offline, auto-switch to `quick-query`.

### 2.4 Rate-limit feedback
Scan hooks + pipeline: inspect `res.status === 429` (and JSON `{error}`) before
reading the stream; surface message via error state + toast.

---

## Phase 3 — Onboarding & profile flow

### 3.1 Replace diff + undo
- New `components/onboard/ProfileDiff.tsx`: given previous + next profile, renders
  shared-marker deltas (reuse `MarkerDeltaRow` visuals / `computeMarkerDeltas`),
  plus added/removed lists. Shown in the `complete` stage when `?replace=1`.
  CTAs: "Update my profile" (commits) / "Keep current" (discards, routes back).
- Undo: after commit, push a toast with an "Undo" action (~6s) that restores
  `previous` (available as `reportHistory[0].profileSnapshot`). Add store action
  `restorePreviousProfile()` that pops the latest history entry and reinstates it.

### 3.2 Retry state
`hooks/useAgentPipeline.ts` — add `{ stage: 'retrying'; attempt; of; phase }`.
Replace the transient `error`+"Retrying…" hack. `onboard/page.tsx` +
`AgentProgressStepper.tsx` render a subtle "Reattempting…" line on the active step;
no error card / buttons during retry.

---

## Phase 4 — True offline (PWA)

### 4.1 Service worker
Rewrite `public/sw.js` (hand-rolled, no new deps):
- `CACHE = 'gutcheck-shell-v{N}'`. On `install`: precache shell routes + icons +
  manifest + self-hosted pdf worker; `skipWaiting`.
- On `activate`: delete old caches; `clients.claim`.
- On `fetch`:
  - bypass `/api/*` (return — network only).
  - navigations: network-first, fallback to cached route then cached `/`.
  - static (`/_next/static`, images, fonts): cache-first.
  - Only cache `GET`, same-origin.
- Note: Next build output hashes asset names; precache a stable shell + use
  runtime caching for hashed assets (cache-first) so we don't need the manifest.

### 4.2 Update prompt
`PwaRegister.tsx` — detect `registration.waiting` / `updatefound`; on new SW
waiting, `pushToast('New version ready — tap to refresh', action)` that posts
`SKIP_WAITING` and reloads on `controllerchange`.

---

## Phase 5 — Drive resilience

- `lib/drive/sync.ts` + `client.ts`: standardize on **single blob**
  (`gutcheck_profile.json`) for now; remove the unused `history` filename or wire
  it. Keep `wipe` deleting whatever is written.
- `useDriveSync`: add `restoreFromDrive()` (explicit pull + merge with result
  message). `mergeFromDrive` already does newer-wins union; have it return a
  small result describing the outcome (`'restored' | 'up-to-date' | 'local-newer'`).
- `app/profile/page.tsx`: "Restore from Drive" button; show `lastSyncedAt` via
  `formatDate`; toasts on push/restore success/failure. Status block already exists.

---

## Phase 6 — Cross-cutting quality

### 6.1 Accessibility
- Add focus-visible coverage (global ring exists; verify custom buttons not
  overriding outline). 
- Status-not-by-color: ensure `TrafficLightBadge`, `MarkerCard` chips,
  `DishResultCard` carry text/icon labels (mostly do; audit).
- Focus trap + restore for Clean Slate dialog and mobile nav drawer
  (`components/shared/useFocusTrap.ts` helper).
- `aria-live="polite"` on scan/audit/onboard result regions.
- Contrast check `--text-muted` on `--bg-secondary`; bump if < AA.

### 6.2 Toast sweep
Wire toasts: profile saved, scan/audit saved, Clean Slate, Drive push/restore,
rate-limit, SW update.

### 6.3 Tests (Vitest)
New suites: `thresholds.test.ts` (guardrail), `gutcheck.store.test.ts`
(computeTrend, computeMarkerDeltas, mergeFromDrive, migration), `cache-builder.test.ts`,
`fallback-tree.test.ts` (empty-keyword regression).

### 6.4 Observability
Ensure all route catches call `logRouteError`. Optional `/api/health` returns
version + uptime. Confirm no payloads logged.

---

## Verification strategy (every phase)
1. `npx tsc --noEmit`
2. `npx vitest run`
3. `npx next build` (after phases touching routes/config/SW: 0, 2, 3, 4, 5)
4. Manual smoke notes recorded in the task.

## Risk register
- **Phase 4 (SW)** highest risk: a bad cache can serve stale UI. Mitigate with
  versioned cache, network-first navigations, and an update prompt.
- **Schema (Phase 0.6/1):** migration must be idempotent and defensive.
- **Streaming (Phase 2.1):** must not break the existing final-result path; keep
  it as the source of truth, streamed text is cosmetic.
