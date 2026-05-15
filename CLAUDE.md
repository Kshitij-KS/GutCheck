# GutCheck — agent context

Also read [@AGENTS.md](AGENTS.md) for Next.js 16 conventions (this repo uses the App Router; APIs may differ from older Next docs).

## What this app is

Privacy-first PWA: blood report → personalized food guidance (Gemini on the server), menu/grocery scans, optional **Google Drive App Data** backup. Health payloads are **not** persisted server-side; they pass through API routes in memory.

## Stack

- Next.js 16, React 19, TypeScript strict
- AI: `@google/generative-ai` ([`lib/gemini.ts`](lib/gemini.ts))
- Auth: next-auth v4 + Google (`drive.appdata` scope) — OAuth tokens live **only in the JWT**; Drive routes read them via [`lib/drive-auth.ts`](lib/drive-auth.ts) (`getToken`). Do not put `accessToken` on the client `Session`.
- State: Zustand + persist ([`store/gutcheck.store.ts`](store/gutcheck.store.ts))

## Environment

See [`.env.example`](.env.example) for `GEMINI_API_KEY`, Google OAuth, `NEXTAUTH_*`, and optional Upstash vars for rate limiting.

## Security / API design

- **`/api/agents/*` and `/api/pdf/extract`** are intentionally **unauthenticated** (privacy). Mitigations: Zod + size caps + [`lib/security.ts`](lib/security.ts) (`sanitizeInput`, `detectPromptInjection`, `isResponseSafe` where applicable), optional **Upstash** IP limits ([`lib/rate-limit.ts`](lib/rate-limit.ts)).
- **`/api/drive/*`** require a logged-in session (enforced by [`proxy.ts`](proxy.ts) + JWT checks in route handlers).

## Drive merge

Client pull uses [`mergeFromDrive`](store/gutcheck.store.ts): newer `HealthProfile.updatedAt` wins for the profile; `reportHistory` is **union-by-id** with local, sorted newest-first, capped at 50 entries.

## Deeper architecture

See [GUTCHECK_ARCHITECTURE.md](GUTCHECK_ARCHITECTURE.md) and [GUTCHECK_CLAUDE_CODE_PROMPT.md](GUTCHECK_CLAUDE_CODE_PROMPT.md) for product and build specs.
