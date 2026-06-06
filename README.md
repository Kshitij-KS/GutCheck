# GutCheck 🩺🍽️

### Know your body. Trust your meals.

**GutCheck turns a blood report into everyday food wisdom.** Upload a lab report and GutCheck builds a personalized "Clinical Food Profile" that travels with you — so when you're staring at a restaurant menu, scanning a grocery cart, or handing a card to a chef, you already know what's worth eating and what to skip.

It's a **privacy-first**, **India-aware** wellness companion. Your health data lives on your device, not our servers. And it's a Progressive Web App, so it installs like a native app and keeps working when you lose signal.

> GutCheck is a lifestyle architect, not a diagnostic tool. It never replaces a doctor, and it's intentionally cautious about anything that looks like a medical emergency.

---

## The problem

Most people get a blood report, see a line like `HbA1c: 6.2%` or `LDL: 140 mg/dL`, and have no idea what that means at dinner. The gap between *clinical data* and *the menu in your hand* is where good intentions quietly fall apart.

GutCheck closes that gap. It reads your markers once, then quietly does the translation work every time you eat.

---

## What it does

- **🧪 Blood report decoding** — Upload a PDF or photo of your lab report. GutCheck extracts your markers (glucose, HbA1c, lipid panel, thyroid, liver, kidney, CBC, vitamins, and more), interprets each one, and explains it in plain language.
- **🧭 Personalized food profile** — Your markers are translated into clear, additive food rules: what to **prioritize**, what to take in **moderation**, and what to **strictly avoid** — plus hydration and gentle movement guidance.
- **📷 Real-time menu scanning** — Snap a photo of a menu or paste the text. Every dish is ranked against *your* profile with a traffic-light verdict, a score, the reasoning, and a suggested modification when something is borderline.
- **🛒 Grocery auditing** — Paste your cart or shopping list. GutCheck flags items, surfaces hidden ingredients, and suggests healthier, locally available swaps.
- **🪪 Chef's Card** — Generate a polite, printable, restaurant-ready summary of your dietary needs to hand to a server or chef. Kind in tone, not demanding.
- **📈 History & trends** — Track markers across multiple reports over time with trend sparklines and improving/worsening/stable deltas.
- **☁️ Optional Google Drive backup** — Sync your profile and history to your *private* Google Drive App Data folder so it follows you across devices. Entirely opt-in.
- **📶 Works offline** — As an installable PWA, GutCheck falls back to a cached keyword rule tree for quick menu checks even without a connection.

---

## Why it's different

**India-aware by design.** GutCheck reasons about *actual* dishes, not generic Western approximations. It understands that telebhaja is deep-fried, that Bengali cooking leans on mustard oil, that restaurant Punjabi food hides cream and butter, and that "aloo posto" is potato in a poppy-seed-and-mustard-oil paste. Regional cuisines, street food, and invisible ingredients are all part of its reasoning.

**Additive, not restrictive.** The guidance leads with what you *can* eat. Every "avoid" comes with a workaround where one exists. The tone is grounded and warm — a premium wellness journal, not a hospital chart.

**Mindful friction.** GutCheck nudges against obsessive, rapid-fire scanning. It's meant to support a calmer relationship with food, not feed anxiety.

---

## How it works

### The three-agent pipeline

Every blood report flows through three specialized AI agents in sequence — never skipped, never merged:

1. **Extraction Agent** — Reads the report and extracts structured marker data only. It standardizes names, preserves exact values and units, flags ambiguous units, and never interprets.
2. **Clinical Guardrail Agent** — A safety layer that runs **deterministic checks first** (hardcoded critical thresholds, emergency symptom keywords, pregnancy/pediatric detection) before any AI call. If a value looks dangerous, the pipeline halts and calmly redirects you to a healthcare provider instead of giving food advice.
3. **Translation Agent** — Turns safety-checked markers into holistic, India-aware lifestyle guidance across food, movement, and hydration, plus your consolidated rules, Chef's Card, and offline fallback tree.

### Two-pass scanning

Menu and grocery scans stream results over Server-Sent Events for a responsive feel, applying your consolidated profile rules to each dish or item with deep regional knowledge and hidden-ingredient detection.

---

## Privacy & security

Privacy is the architecture, not a footnote.

- **Your data stays on your device.** Your health profile and report history live in your browser (Zustand + `localStorage`). Optional Drive backup writes only to your own private App Data folder.
- **Zero server-side persistence of health data.** Blood reports and menu text pass through the API routes **in memory** for processing and are never logged or stored.
- **OAuth tokens stay in the JWT.** Google access tokens never reach the client session; Drive routes read them server-side only.
- **Prompt-injection defense.** User input is scanned for injection patterns and sanitized before it ever reaches the model, and AI responses are validated for safety.
- **Schema validation.** Every AI output is validated against strict Zod schemas before it's trusted.
- **Hardened endpoints.** Size caps on all inputs, optional Upstash IP rate limiting, and security headers (HSTS, `X-Frame-Options`, `X-Content-Type-Options`, restrictive `Permissions-Policy`).

The AI agent routes are intentionally **unauthenticated** to preserve privacy (no account required to analyze a report), protected instead by validation, sanitization, size caps, and optional rate limiting. Drive routes require a logged-in session.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript (strict) |
| AI | Google Gemini (`gemini-2.5-flash`) via `@google/generative-ai`, streaming + JSON mode |
| State | Zustand with persistence |
| Auth | NextAuth v4 + Google OAuth (`drive.appdata` scope) |
| Backup | Google Drive App Data API (`googleapis`) |
| Validation | Zod |
| Parsing | `pdf-parse` (server) + `pdfjs-dist` (client preview) |
| Styling | Tailwind CSS 4 + custom CSS |
| Animation | Framer Motion |
| Rate limiting | Upstash Redis (optional, no-op when unset) |
| PWA | Service worker + offline fallback |
| Testing | Vitest |

---

## Getting started

### Prerequisites

- Node.js 18+
- A Google Gemini API key ([Google AI Studio](https://ai.google.dev/))
- (Optional) Google OAuth credentials for Drive sync
- (Optional) Upstash Redis for rate limiting

### Installation

```bash
# 1. Clone
git clone https://github.com/Kshitij-KS/GutCheck.git
cd GutCheck

# 2. Install
npm install

# 3. Configure environment
cp .env.example .env.local
# then fill in the values below

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Set these in `.env.local` (see `.env.example`):

```env
# Required for AI features
GEMINI_API_KEY=

# Required for Google Drive sync
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Optional — enables IP rate limiting on AI/PDF routes
# UPSTASH_REDIS_REST_URL=
# UPSTASH_REDIS_REST_TOKEN=
# RATE_LIMIT_AGENTS_PER_MINUTE=45
# RATE_LIMIT_PDF_PER_MINUTE=20
```

> Note: `GEMINI_API_KEY` is a **server-side** secret — it is read only inside API routes and is never exposed to the browser.

### Scripts

```bash
npm run dev      # Start the dev server
npm run build    # Production build (standalone output)
npm run start    # Run the production build
npm run test     # Run the Vitest suite
npm run icons    # Regenerate PWA icons
```

---

## Project structure

```
app/                 # Next.js App Router pages + API routes
  api/agents/        # extract · guardrail · translate · scan-menu · scan-grocery
  api/pdf/extract/   # Server-side PDF → text
  api/drive/         # sync · wipe (auth required)
  onboard/ dashboard/ scan/ grocery/ chef-card/ profile/ history/
components/          # UI by feature area (onboard, dashboard, scan, grocery, ...)
lib/                 # gemini, security, rate-limit, prompts, parsers, guardrail, drive, cultural
hooks/               # agent pipeline, scans, drive sync, offline, rate limiting
store/               # Zustand stores (persisted profile + ephemeral scan session)
constants/           # marker definitions, critical thresholds, regional foods, food rules
types/               # All shared TypeScript types
```

---

## Disclaimer

GutCheck is a wellness and educational tool. It is **not** a medical device, does not provide diagnoses, and does not replace professional medical advice. Always consult a qualified healthcare provider about your health and before making significant dietary changes. If you're experiencing a medical emergency, contact your local emergency services immediately.

---

Built with care for better metabolic health. 🌿
