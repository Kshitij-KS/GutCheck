# Tasks — GutCheck Enhancements

> Each phase ends with: `tsc --noEmit`, `vitest run`, and (where noted) `next build`.
> Nothing already working may regress.

## Phase 0 — Foundations & quick wins

- [x] 1. Fix font-variable override in `app/globals.css` (keep Next font-loader bridge). _(Req 1.2)_
- [x] 2. Correct privacy copy in `ProfileConfirmation.tsx`. _(Req 1.3)_
- [x] 3. Self-host pdf.js worker in `PDFPreview.tsx`. _(Req 1.6)_
- [x] 4. Add logging seam + `logRouteError` in `lib/utils.ts`; route API catches through it. _(Req 1.5, 7.5)_
- [x] 5. Create toast store (`store/ui.store.ts`) and `components/shared/Toast.tsx`; mount in `AppShell`. _(Req 1.1)_
- [x] 6. Bump `STORE_VERSION`→2 with real `migrate` backfilling new fields. _(Req 1.4)_
- [x] 7. Verify: tsc + tests + build.

## Phase 1 — Personalization inputs

- [x] 8. Extend store: `dietaryPreferences`, `allergies` + setters; extend `UserContext`. _(Req 2.3)_
- [x] 9. Create `components/shared/ChipSelect.tsx`. _(Req 2.1, 2.3)_
- [x] 10. Add optional Personalize step (location + diet + allergies) in onboarding; skippable. _(Req 2.1, 2.5)_
- [x] 11. Add editable Preferences card to `app/profile/page.tsx`. _(Req 2.1)_
- [x] 12. Use store `location` in `dashboard` SeasonalTip (drop hardcoded "India"). _(Req 2.2)_
- [x] 13. Pass `userContext` (location/diet/allergies) through translate; extend route Zod + prompt. _(Req 2.2, 2.3)_
- [x] 14. Include diet/allergies in menu & grocery scan payloads + prompts. _(Req 2.3)_
- [x] 15. Seed allergy terms into offline `avoidKeywords` (`cache-builder.ts` / check-time merge). _(Req 2.4)_
- [x] 16. Verify: tsc + tests + build.

## Phase 2 — Scan experience

- [x] 17. Progressive streaming in `useMenuScan`/`useGroceryScan` (live "found N" count). _(Req 3.1, 3.2)_
- [x] 18. Store actions to remove/clear scan & grocery history. _(Req 3.3)_
- [x] 19. `RecentScans`/`RecentAudits` collapsed sections on scan/grocery pages. _(Req 3.3)_
- [x] 20. `ScanModeToggle` disabledModes; disable Camera/Upload offline + auto-switch. _(Req 3.4)_
- [x] 21. 429 handling in scan hooks + pipeline → real message + toast. _(Req 3.5)_
- [x] 22. Verify: tsc + tests + build.

## Phase 3 — Onboarding & profile flow

- [x] 23. `ProfileDiff.tsx` before/after for replace flow. _(Req 4.1)_
- [x] 24. `restorePreviousProfile()` store action + Undo toast after commit. _(Req 4.2)_
- [x] 25. Add `retrying` pipeline state; update stepper; remove error flash. _(Req 4.3)_
- [x] 26. Verify: tsc + tests + build.

## Phase 4 — True offline (PWA)

- [x] 27. Rewrite `public/sw.js` (precache start URL, network-first nav, SWR static, bypass /api). _(Req 5.1, 5.2, 5.4)_
- [x] 28. SW update prompt in `PwaRegister.tsx` via toast. _(Req 5.3)_
- [x] 29. Verify offline: tsc + tests + build. (manual cold-offline smoke pending real device)

## Phase 5 — Drive resilience

- [x] 30. Standardize Drive file strategy across sync/read/wipe (single blob). _(Req 6.4)_
- [x] 31. `restoreFromDrive()` + merge outcome reporting. _(Req 6.1, 6.2)_
- [x] 32. Profile: Restore button, last-synced display, sync toasts. _(Req 6.3)_
- [x] 33. Verify: tsc + tests + build.

## Phase 6 — Cross-cutting quality

- [x] 34. Accessibility: focus traps (Clean Slate, mobile nav), aria-live result regions, color+label audit, contrast bump. _(Req 7.1, 7.2, 7.3)_
- [x] 35. Toast sweep across all silent actions. _(Req 1.1)_
- [x] 36. Unit tests: guardrail, history (trend/delta/merge), cache-builder, fallback-tree (18 → 43 tests). _(Req 7.4)_
- [x] 37. Observability: logger seam in place; `/api/health` reports version/uptime. _(Req 7.5)_
- [x] 38. Final verify: tsc + full test suite (43 passing) + build. _(all)_
