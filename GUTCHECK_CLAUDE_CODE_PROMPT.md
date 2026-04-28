# GutCheck — Complete Claude Code Build Prompt
> Paste this entire document into Claude Code and press Enter. It is self-contained.

---

## ROLE & MISSION

You are an elite full-stack engineer. Your task is to scaffold and build **GutCheck** — a privacy-first, AI-powered wellness PWA — from absolute zero to a fully functional, production-quality application. Read this entire prompt before writing a single line of code. Follow every instruction exactly. Do not improvise architecture or substitute libraries.

GutCheck translates blood report data (PDFs and images) into personalized, everyday food and lifestyle guidance. It is a **lifestyle architect**, never a diagnostic tool.

---

## PRODUCT VIBE — READ THIS FIRST

The aesthetic is **grounded, organic, effortlessly classy**. Think premium wellness journal meets intelligent nutritionist — not a hospital app, not a generic AI chatbot.

**The "Anti-AI" Rule is absolute:** No glowing neon gradients. No matrix-style backgrounds. No robotic avatars. No sparkly "magic wand" icons. No generic dashboard grids. The AI is the invisible engine. The UI is entirely human and organic.

**Every screen should feel like** reading a premium minimalist lifestyle magazine or stepping into a high-end Ayurvedic wellness retreat. Whitespace is a feature. Clutter creates anxiety. Calm creates trust.

---

## TECH STACK — EXACT VERSIONS, NO SUBSTITUTIONS

```
Framework:       Next.js 14.2.5 (App Router ONLY — never Pages Router)
Language:        TypeScript 5.4+ (strict: true, noImplicitAny: true, zero `any`)
Styling:         Tailwind CSS 3.4 + shadcn/ui
State:           Zustand 4.5 (persist middleware + devtools)
AI SDK:          @anthropic-ai/sdk 0.24+ (streaming SSE)
PDF (server):    pdf-parse 1.1.1
PDF (client):    pdfjs-dist 4.x (canvas render for preview only)
Forms:           React Hook Form 7.5 + Zod 3.23 (ALL inputs validated)
Animations:      Framer Motion 11
Icons:           Lucide React
Auth:            next-auth 4.24 (Google OAuth)
Drive API:       googleapis 140+ (server-side only)
PWA:             next-pwa 5.6 (service worker + offline support)
Testing:         Vitest 1.x
Fonts:           Cormorant Garamond (display), DM Sans (body), DM Mono (data)
Charts:          Recharts 2.12
```

**Install everything in one command at the start:**

```bash
npx create-next-app@14.2.5 gutcheck --typescript --tailwind --app --no-src-dir --import-alias "@/*" && cd gutcheck && npx shadcn@latest init && npm install @anthropic-ai/sdk next-auth googleapis zustand zod react-hook-form @hookform/resolvers framer-motion lucide-react pdf-parse pdfjs-dist uuid next-pwa recharts clsx tailwind-merge class-variance-authority && npm install -D vitest @vitest/ui @types/uuid @types/pdf-parse
```

---

## COMPLETE FOLDER STRUCTURE

Create this exact structure. Every file listed must exist.

```
gutcheck/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                        ← Landing page
│   ├── onboard/page.tsx
│   ├── dashboard/page.tsx
│   ├── scan/page.tsx
│   ├── grocery/page.tsx
│   ├── chef-card/page.tsx
│   ├── profile/page.tsx
│   ├── history/page.tsx
│   └── api/
│       ├── agents/
│       │   ├── extract/route.ts
│       │   ├── guardrail/route.ts
│       │   ├── translate/route.ts
│       │   ├── scan-menu/route.ts
│       │   └── scan-grocery/route.ts
│       ├── pdf/extract/route.ts
│       └── drive/
│           ├── sync/route.ts
│           └── wipe/route.ts
├── components/
│   ├── ui/                             ← shadcn auto-generated
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Navbar.tsx
│   │   ├── OfflineBanner.tsx
│   │   └── PageTransition.tsx
│   ├── onboard/
│   │   ├── FileDropzone.tsx
│   │   ├── PDFPreview.tsx
│   │   ├── AgentProgressStepper.tsx
│   │   ├── GuardrailAlert.tsx
│   │   └── ProfileConfirmation.tsx
│   ├── dashboard/
│   │   ├── ProfileSnapshot.tsx
│   │   ├── MarkerGrid.tsx
│   │   ├── MarkerCard.tsx
│   │   ├── DailyNudge.tsx
│   │   ├── TrendSparkline.tsx
│   │   └── SeasonalTip.tsx
│   ├── scan/
│   │   ├── ScanModeToggle.tsx
│   │   ├── CameraCapture.tsx
│   │   ├── QuickQueryInput.tsx
│   │   ├── DishResultCard.tsx
│   │   ├── OfflineScanBadge.tsx
│   │   └── MindfulNudge.tsx
│   ├── grocery/
│   │   ├── CartPasteInput.tsx
│   │   ├── GroceryItemRow.tsx
│   │   └── SwapSuggestion.tsx
│   ├── chef-card/
│   │   └── ChefCardView.tsx
│   └── shared/
│       ├── TrafficLight.tsx
│       ├── StreamingText.tsx
│       └── LoadingOrb.tsx
├── lib/
│   ├── anthropic.ts
│   ├── prompts/
│   │   ├── agent-extract.prompt.ts
│   │   ├── agent-guardrail.prompt.ts
│   │   ├── agent-translate.prompt.ts
│   │   ├── scan-menu.prompt.ts
│   │   └── scan-grocery.prompt.ts
│   ├── parsers/
│   │   ├── extract.parser.ts
│   │   ├── translate.parser.ts
│   │   ├── scan.parser.ts
│   │   └── grocery.parser.ts
│   ├── guardrail/
│   │   ├── thresholds.ts
│   │   ├── symptom-keywords.ts
│   │   └── special-populations.ts
│   ├── drive/
│   │   ├── client.ts
│   │   ├── sync.ts
│   │   └── wipe.ts
│   ├── offline/
│   │   ├── fallback-tree.ts
│   │   └── cache-builder.ts
│   ├── cultural/
│   │   ├── indian-foods.ts
│   │   ├── fasting-patterns.ts
│   │   └── seasonal-nudges.ts
│   ├── pdf.ts
│   └── utils.ts
├── store/
│   ├── gutcheck.store.ts
│   └── scan.store.ts
├── hooks/
│   ├── useAgentPipeline.ts
│   ├── useMenuScan.ts
│   ├── useGroceryScan.ts
│   ├── useDriveSync.ts
│   ├── useOfflineDetection.ts
│   └── useScanRateLimit.ts
├── types/index.ts
├── constants/
│   ├── markers.ts
│   ├── critical-thresholds.ts
│   └── regional-foods.ts
├── middleware.ts
├── next.config.js
├── public/manifest.json
└── .env.local
```

---

## BUILD ORDER — FOLLOW EXACTLY

Build in this sequence. Each phase must be fully complete before moving to the next.

### Phase 1 — Foundation (no UI, no API calls)

**1. `types/index.ts` — Define ALL types here first. Never define types inline anywhere.**

```typescript
export type MarkerStatus = 'OPTIMAL' | 'BORDERLINE' | 'ELEVATED' | 'CRITICAL' | 'LOW' | 'CRITICALLY_LOW';
export type TrafficLight = 'PRIORITIZE' | 'MODERATE' | 'AVOID';
export type AgentStatus = 'idle' | 'running' | 'done' | 'error' | 'blocked';
export type ScanMode = 'camera' | 'quick-query' | 'menu-text';
export type DriveSync = 'synced' | 'pending' | 'error' | 'offline';
export type SpecialPopulation = 'pregnant' | 'pediatric' | 'none';

export interface BloodMarker {
  id: string;
  name: string;
  value: string;
  unit: string | null;
  unitAmbiguous: boolean;
  numericValue: number;
  reportedRange: string | null;
  standardRange: string;
  status: MarkerStatus;
  implication: string;
  foodRules: MarkerFoodRules;
  movementRules: MarkerMovementRules;
  hydrationRules: string[];
}

export interface MarkerFoodRules {
  strictAvoid: string[];
  moderate: string[];
  prioritize: string[];
}

export interface MarkerMovementRules {
  recommended: string[];
  avoid: string[];
  breathworkSuggestions: string[];
}

export interface HealthProfile {
  id: string;
  schemaVersion: '1.0';
  createdAt: string;
  updatedAt: string;
  reportDate: string | null;
  reportLabName: string | null;
  specialPopulation: SpecialPopulation;
  markers: BloodMarker[];
  primaryConcerns: string[];
  overallSummary: string;
  consolidatedRules: ConsolidatedRules;
  chefCardContent: ChefCardContent;
  offlineFallbackTree: OfflineFallbackTree;
}

export interface ConsolidatedRules {
  strictAvoid: string[];
  moderate: string[];
  prioritize: string[];
  hydrationGuidance: string;
  movementGuidance: string[];
  cuisineGuidance: string;
}

export interface ChefCardContent {
  title: string;
  intro: string;
  strictAvoidList: string[];
  moderateList: string[];
  allergyNotes: string | null;
  additionalNote: string | null;
}

export interface OfflineFallbackTree {
  avoidKeywords: string[];
  moderateKeywords: string[];
  prioritizeKeywords: string[];
  lastBuiltAt: string;
}

export interface ReportHistoryEntry {
  id: string;
  uploadedAt: string;
  reportDate: string | null;
  profileSnapshot: HealthProfile;
  markerDeltas: MarkerDelta[];
}

export interface MarkerDelta {
  markerId: string;
  markerName: string;
  previousValue: number;
  currentValue: number;
  previousStatus: MarkerStatus;
  currentStatus: MarkerStatus;
  trend: 'IMPROVING' | 'WORSENING' | 'STABLE';
}

export interface GuardrailResult {
  passed: boolean;
  criticalMarkers: CriticalMarkerFlag[];
  emergencySymptomDetected: boolean;
  specialPopulationDetected: SpecialPopulation;
  redirectMessage: string | null;
}

export interface CriticalMarkerFlag {
  markerId: string;
  markerName: string;
  value: number;
  threshold: string;
  direction: 'above' | 'below';
}

export interface DishScanResult {
  dishName: string;
  classification: TrafficLight;
  score: number;
  primaryReason: string;
  hiddenIngredients: string[];
  modification: string | null;
  isOfflineResult: boolean;
}

export interface MenuScanResult {
  dishes: DishScanResult[];
  scanSummary: string;
  bestChoices: string[];
  timestamp: string;
}

export interface GroceryItem {
  name: string;
  classification: TrafficLight;
  reason: string;
  hiddenIngredients: string[];
  swap: GrocerySwap | null;
}

export interface GrocerySwap {
  suggestion: string;
  whereToFind: string;
  reason: string;
}

export interface GroceryAuditResult {
  items: GroceryItem[];
  summary: string;
  greatCount: number;
  moderateCount: number;
  reconsiderCount: number;
  timestamp: string;
}

export interface GutCheckStore {
  healthProfile: HealthProfile | null;
  isOnboarded: boolean;
  reportHistory: ReportHistoryEntry[];
  driveSync: DriveSync;
  lastSyncedAt: string | null;
  scanHistory: MenuScanResult[];
  groceryHistory: GroceryAuditResult[];
  scanCountToday: number;
  lastScanDate: string | null;
  setHealthProfile: (profile: HealthProfile) => void;
  addScanResult: (result: MenuScanResult) => void;
  addGroceryResult: (result: GroceryAuditResult) => void;
  incrementScanCount: () => void;
  setDriveSync: (status: DriveSync) => void;
  clearAll: () => void;
}

export interface UserContext {
  location?: string;
  dietaryPreferences?: string[];
  age?: number;
}

export interface IndianFoodEntry {
  aliases: string[];
  primaryIngredients: string[];
  cookingMethod: string;
  keyNutrientFlags: string[];
  region: string;
  notes: string;
}

export interface FastingInfo {
  pattern: string;
  windowDescription: string;
  breakingAdvice: string;
  suitableBreakingFoods: string[];
  avoidAtBreaking?: string[];
}

export interface ExtractedMarkers {
  markers: BloodMarker[];
  reportDate: string | null;
  labName: string | null;
  extractionFailed: boolean;
  unitAmbiguousMarkers: string[];
}
```

**2. `constants/critical-thresholds.ts`**

```typescript
export const CRITICAL_THRESHOLDS = {
  blood_glucose_fasting: { max: 300, unit: 'mg/dL' },
  hba1c:                 { max: 12.0, unit: '%' },
  total_cholesterol:     { max: 350, unit: 'mg/dL' },
  ldl:                   { max: 250, unit: 'mg/dL' },
  triglycerides:         { max: 500, unit: 'mg/dL' },
  uric_acid:             { max: 12.0, unit: 'mg/dL' },
  platelet_count:        { min: 20, unit: '×10³/μL' },
  hemoglobin:            { min: 5.0, unit: 'g/dL' },
  serum_creatinine:      { max: 8.0, unit: 'mg/dL' },
  sgot_ast:              { max: 500, unit: 'U/L' },
  sgpt_alt:              { max: 500, unit: 'U/L' },
  sodium:                { min: 120, max: 160, unit: 'mEq/L' },
  potassium:             { min: 2.5, max: 7.0, unit: 'mEq/L' },
  tsh:                   { max: 50, unit: 'mIU/L' },
} as const;

export const STANDARD_REDIRECT =
  "One or more values in your report require clinical evaluation before dietary guidance is appropriate. Please share this report with your healthcare provider.";

export const EMERGENCY_SYMPTOM_KEYWORDS: string[] = [
  'chest pain', 'chest tightness', 'left arm pain', 'jaw pain',
  'shortness of breath', "can't breathe", 'difficulty breathing',
  'severe pain', 'crushing pain', 'numbness in arm', 'stroke',
  'unconscious', 'fainted', 'heart attack', 'seizure', 'blood vomit',
  'coughing blood', 'passing blood', 'severe allergic', 'anaphylaxis',
];

export const EMERGENCY_RESPONSE =
  "This sounds like it may be a medical emergency. Please call emergency services (112 in India) immediately. GutCheck is not equipped to help with acute symptoms.";

export const PREGNANCY_KEYWORDS = [
  'pregnant', 'pregnancy', 'trimester', 'expecting', 'antenatal', 'prenatal', 'gestational',
];

export const PEDIATRIC_AGE_THRESHOLD = 18;

export const PREGNANCY_REDIRECT =
  "GutCheck's current guidance is calibrated for non-pregnant adults. For dietary advice during pregnancy, please consult your OB/GYN or a registered dietitian.";

export const PEDIATRIC_REDIRECT =
  "GutCheck's current guidance is calibrated for adults. For children's dietary guidance, please consult a pediatrician.";
```

**3. `lib/guardrail/thresholds.ts`**

This module MUST run deterministically without any AI call. It checks the extracted markers against `CRITICAL_THRESHOLDS` and returns a `GuardrailResult`. If any marker breaches a threshold, it returns `passed: false` and `redirectMessage: STANDARD_REDIRECT` immediately. The pipeline STOPS here — Agent 3 never runs.

**4. `lib/prompts/*.ts` — All five prompt files**

Implement these AI system prompts exactly:

**Agent 1 (Extract):** You are a clinical data extraction specialist. Extract every blood marker from the provided text. For each marker, identify: name, raw value, unit (flag as ambiguous if ng/mL vs nmol/L is unclear), numeric value, and reported reference range. If this is not a blood report, set `extractionFailed: true`. Return valid JSON only matching the `ExtractedMarkers` interface. Never invent values.

**Agent 2 (Guardrail):** You are a clinical safety reviewer. You receive extracted blood markers and check for: pregnancy/pediatric signals in the report text (lab notes, patient demographics), markers that appear to be from a special population. Return `{ passed: boolean, flags: string[], specialPopulationDetected: SpecialPopulation }`. Never give food advice. Return valid JSON only.

**Agent 3 (Translate):** Full prompt:
```
You are a clinical nutritionist and preventive wellness specialist. You receive safety-checked blood markers and translate them into holistic food, movement, and hydration guidance.

PHILOSOPHY: You are ADDITIVE, not restrictive. Lead with what the user CAN eat. Tone is grounded and warm. All food references are India-aware (dal, sabzi, roti, chaas, nimbu pani). Regional specificity matters: if context suggests Bengal, use posto, maacher jhol, shorshe, telebhaja. Movement suggestions are realistic: walks, pranayama, yoga — never gym routines.

CONSTRAINT HIERARCHY: 1. Allergies (absolute) → 2. CRITICAL/ELEVATED markers (strong rules) → 3. BORDERLINE (moderate) → 4. OPTIMAL (minimal rules).

CONFLICT RESOLUTION: High uric acid + protein goal → plant-based protein (moong, tofu). Diabetes + kidney disease → low-GI AND low-potassium, flag the intersection explicitly. High LDL + South Indian context → coconut in moderation, prefer sesame/groundnut oil.

FRAMING: Never more than 7 items per food rule category. For 3+ elevated markers: "Focus on finding ONE great addition today." No numeric scores in output. Use qualitative language only.

CHEF'S CARD: Generate a polite, concise, restaurant-ready restriction summary. Tone: kind, not demanding.

OUTPUT: Valid JSON only. No preamble. No markdown fences. Schema: full HealthProfile interface.
```

**Menu Scanner prompt:** Culturally intelligent India-aware food analyst. Deep knowledge of Bengali (phuchka, telebhaja, aloo posto, maacher jhol, shorshe ilish), Maharashtra, Tamil, Kerala cuisines. For every regional dish, reason about ACTUAL ingredients and cooking method. Score: PRIORITIZE (70–100), MODERATE (40–69), AVOID (0–39). For every AVOID, include a modification that makes it safer. Never just say "don't eat this." Return valid JSON matching `MenuScanResult`.

**Grocery Auditor prompt:** Analyzes grocery lists from Indian apps (Blinkit, Zepto, BigBasket). For each item: classify with traffic light, flag hidden ingredients from known brands (Maggi = high sodium + maida), and suggest locally available swaps. Swaps must be from kirana stores — not exotic. Examples: maida → whole wheat atta or jowar atta; refined oil → cold-pressed groundnut or mustard oil; white sugar → jaggery or dates; packaged biscuits → roasted makhana or til chikki.

**5. `lib/parsers/*.ts`** — Zod schemas for validating every AI response. Write unit tests for all parsers in `*.test.ts` files. Parsers are the safety net — if AI returns malformed JSON, the parser catches it and the route returns a 500 with "AI response could not be parsed."

**6. `store/gutcheck.store.ts`** — Full Zustand implementation:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';

const STORE_VERSION = 1;

export const useGutCheckStore = create<GutCheckStore>()(
  devtools(
    persist(
      (set, get) => ({
        healthProfile: null,
        isOnboarded: false,
        reportHistory: [],
        driveSync: 'offline',
        lastSyncedAt: null,
        scanHistory: [],
        groceryHistory: [],
        scanCountToday: 0,
        lastScanDate: null,

        setHealthProfile: (profile) => {
          const previous = get().healthProfile;
          if (previous) {
            const entry: ReportHistoryEntry = {
              id: crypto.randomUUID(),
              uploadedAt: new Date().toISOString(),
              reportDate: previous.reportDate,
              profileSnapshot: previous,
              markerDeltas: computeMarkerDeltas(previous.markers, profile.markers),
            };
            set((s) => ({ reportHistory: [entry, ...s.reportHistory] }));
          }
          set({ healthProfile: profile, isOnboarded: true });
        },
        addScanResult: (result) =>
          set((s) => ({ scanHistory: [result, ...s.scanHistory].slice(0, 50) })),
        addGroceryResult: (result) =>
          set((s) => ({ groceryHistory: [result, ...s.groceryHistory].slice(0, 20) })),
        incrementScanCount: () => {
          const todayStr = new Date().toISOString().split('T')[0];
          const { lastScanDate, scanCountToday } = get();
          if (lastScanDate !== todayStr) {
            set({ scanCountToday: 1, lastScanDate: todayStr });
          } else {
            set({ scanCountToday: scanCountToday + 1 });
          }
        },
        setDriveSync: (status) => set({ driveSync: status }),
        clearAll: () => set({
          healthProfile: null, isOnboarded: false, reportHistory: [],
          driveSync: 'offline', lastSyncedAt: null, scanHistory: [],
          groceryHistory: [], scanCountToday: 0, lastScanDate: null,
        }),
      }),
      {
        name: 'gutcheck-v1',
        storage: createJSONStorage(() => localStorage),
        version: STORE_VERSION,
        migrate: (persisted) => persisted as GutCheckStore,
      }
    ),
    { name: 'GutCheck Store' }
  )
);
```

**7. `lib/anthropic.ts`** — Export a single Anthropic client instance. Never instantiate inline in routes. Use `new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })`.

---

### Phase 2 — API Routes

All routes follow this pattern:
- Input validated with Zod (400 on failure)
- Anthropic errors return 500 with sanitized message  
- Parse failures return 500 with "AI response could not be parsed"
- Never log user health data — only errors and request metadata

**Streaming routes** (`/api/agents/extract`, `/api/agents/translate`, `/api/agents/scan-menu`, `/api/agents/scan-grocery`):
- Return `ReadableStream` with `text/event-stream` content type
- Event format: `data: ${JSON.stringify(payload)}\n\n`
- Final event: `data: ${JSON.stringify({ done: true, result })}\n\n`
- Use Anthropic's streaming SDK with `stream.on('text', ...)` pattern

**Non-streaming route** (`/api/agents/guardrail`):
- Returns `NextResponse.json()` — this agent is fast and doesn't need streaming

**`/api/pdf/extract/route.ts`:**
- Accepts multipart form data with a file field
- Uses `pdf-parse` server-side to extract raw text
- Returns `{ text: string }`
- Supports PDF, JPG, PNG, WEBP (images → convert to base64 for Claude vision)
- Max file size: 20MB

**`/api/drive/sync/route.ts` and `/api/drive/wipe/route.ts`:**
- Protected by middleware (require valid next-auth session)
- Drive AppData scope only: `https://www.googleapis.com/auth/drive.appdata`
- Files: `gutcheck_profile.json` and `gutcheck_history.json`
- The API route is a pure proxy — never stores health data

---

### Phase 3 — Core Hooks

**`hooks/useAgentPipeline.ts`** — The orchestration hook. Pipeline stages:

```typescript
type PipelineState =
  | { stage: 'idle' }
  | { stage: 'extracting' }
  | { stage: 'guardrail_checking' }
  | { stage: 'guardrail_blocked'; result: GuardrailResult }
  | { stage: 'unit_ambiguous'; markers: string[] }   // NEW: pause for clarification
  | { stage: 'translating'; streamedText: string }
  | { stage: 'complete'; profile: HealthProfile }
  | { stage: 'error'; message: string };
```

Order of operations:
1. POST `/api/pdf/extract` → raw text
2. POST `/api/agents/extract` (streaming) → `ExtractedMarkers`
3. **Deterministic guardrail** (`lib/guardrail/thresholds.ts`) — LOCAL, zero API call. If critical values found → `guardrail_blocked`. STOP.
4. If `unitAmbiguousMarkers.length > 0` → transition to `unit_ambiguous`. Wait for user input before continuing.
5. POST `/api/agents/guardrail` (AI layer) → `GuardrailResult`. If `!passed` → `guardrail_blocked`. STOP.
6. POST `/api/agents/translate` (streaming) → `HealthProfile`
7. Save to Zustand store → trigger Drive sync async

**`hooks/useMenuScan.ts`** — Handles menu scanning. Checks `useOfflineDetection()` before every call. If offline, uses `lib/offline/fallback-tree.ts` keyword matching instead of API.

**`hooks/useGroceryScan.ts`** — Handles grocery list auditing with streaming.

**`hooks/useOfflineDetection.ts`** — Listens to `window.addEventListener('online'/'offline')`. Returns `{ isOnline: boolean }`.

**`hooks/useScanRateLimit.ts`:**
```typescript
const DAILY_SCAN_SOFT_LIMIT = 8;

// After 8 scans/day: show MindfulNudge — NEVER hard-block.
// Rotate through messages:
const mindfulMessages = [
  "You've been scanning a lot today! Remember, one meal won't define your health journey.",
  "Your profile is a guide, not a rulebook. Enjoy your meal — flexibility is part of wellness.",
  "Great awareness! Give yourself credit for making conscious choices.",
];
```

---

### Phase 4 — Cultural & Offline Modules

**`lib/cultural/indian-foods.ts`** — Minimum 20 entries (but design for 100+). Must include:
- `phuchka` / `pani puri` / `golgappa` — deep-fried shell, flag for LDL
- `telebhaja` — generic Bengali deep-fry, always flag cardiac profiles
- `aloo_posto` — potato + poppy seeds, caution diabetic profiles
- `macher_jhol` — light fish curry, high omega-3, actively benefits LDL
- `shorshe_ilish` — hilsa in mustard, highest omega-3 Bengali dish
- `daab` / `coconut water` — excellent electrolytes, caution kidney disease
- `lebu_jol` — lemon water, no sugar for diabetic profiles
- `kochuri` / `luchi` — deep-fried bread, high refined carbs
- `dal` (all variants) — generally beneficial, high plant protein
- `chaas` / `buttermilk` — probiotic, excellent digestive
- `sabudana` / `tapioca` — high GI, caution diabetic
- `makhana` / `fox nuts` — excellent low-GI snack
- `vada_pav` — deep-fried + refined bread, flag LDL/cardiac
- `idli` — fermented, low GI, generally safe
- `dosa` (plain) — fermented, moderate GI, safe with coconut chutney in moderation
- `biryani` — high sodium, high GI rice, large portion flag
- `rajma` — excellent plant protein, moderate kidney disease flag (potassium)
- `chole` — high fiber, moderate GI, generally safe
- `paneer` — good protein, caution high saturated fat for LDL
- `nimbu_pani` — excellent hydration, see lebu_jol

**`lib/cultural/fasting-patterns.ts`** — Implement for Ekadashi, Ramadan Iftar, Navratri, and Karva Chauth. Each entry includes: pattern description, window, breaking advice, suitable breaking foods, and foods to avoid at breaking.

**`lib/cultural/seasonal-nudges.ts`** — Date + location aware. April–June in Bengal: suggest Daab or Lebu Jol (skip coconut water if kidney markers elevated). November–January in Bengal: nolen gur context. Add support for: North India winter (sarson ka saag season), Kerala monsoon (avoid raw street food), summer across India (hydration nudges).

**`lib/offline/cache-builder.ts`** — After every profile update, compress the `HealthProfile` into `OfflineFallbackTree`. Deduplicate and lowercase all terms. Add regional synonyms (maida → also matches "refined flour", "all-purpose flour", "plain flour"). Result must be under 5KB.

**`lib/offline/fallback-tree.ts`** — Keyword matching function. Returns `classification`, `primaryReason`, `isOfflineResult: true`. No API calls.

---

### Phase 5 — Auth & Drive (defer post-demo if needed)

- next-auth with Google provider using `drive.appdata` scope
- `middleware.ts` protects only `/api/drive/*`
- All `/api/agents/*` routes are unauthenticated (privacy-first: Drive sync is opt-in)
- Drive sync: always write local Zustand first (instant), then async Drive write (non-blocking)
- On app load: compare local `updatedAt` vs Drive `updatedAt`, take newer
- Clean Slate Protocol: `clearAll()` in Zustand SYNCHRONOUSLY first → UI shows clean state immediately → THEN async Drive delete → retry 3 times with exponential backoff on failure → show subtle "Sync issue — data cleared locally" notice only if all retries fail

---

### Phase 6 — UI

#### GLOBAL DESIGN SYSTEM

**`app/globals.css`** — CSS variables (these are canonical, use them everywhere):

```css
:root {
  --bg-primary:         #FAF8F4;   /* Warm off-white — never pure white */
  --bg-secondary:       #F3EFE8;   /* Warm sand */
  --bg-elevated:        #FFFFFF;
  --text-primary:       #1C1A17;   /* Deep charcoal */
  --text-secondary:     #5C5752;   /* Warm gray */
  --text-muted:         #9C9690;
  --tl-prioritize:      #3D7A5A;   /* Sage green */
  --tl-prioritize-bg:   #EAF4EE;
  --tl-moderate:        #8B6914;   /* Warm amber */
  --tl-moderate-bg:     #FDF5E0;
  --tl-avoid:           #6B3A2E;   /* Muted terracotta — NEVER harsh red */
  --tl-avoid-bg:        #F5EDEA;
  --status-optimal:     #3D7A5A;
  --status-borderline:  #8B6914;
  --status-elevated:    #B55A2A;
  --status-critical:    #8B1A1A;   /* Dark, not neon */
  --status-low:         #2A5A8B;
  --accent:             #5A7A5A;   /* Primary CTA — sage green */
  --accent-hover:       #3D6040;
  --border:             rgba(28, 26, 23, 0.10);
  --border-strong:      rgba(28, 26, 23, 0.20);
}
```

**Fonts (import in `app/layout.tsx`):**
- `Cormorant Garamond` (400, 500, 600) — Display/Hero text
- `DM Sans` (400, 500, 600) — Body text
- `DM Mono` (400) — Lab values, marker numbers

**Typography rules:**
- Hero/display: `font-[Cormorant_Garamond] text-5xl font-medium tracking-wide`
- Section headers: `font-[DM_Sans] text-xl font-semibold tracking-tight`
- Body: `font-[DM_Sans] text-base leading-relaxed`
- Lab data: `font-[DM_Mono] text-sm`
- Use weight and color contrast for hierarchy — NOT size

**Animation principles (Framer Motion):**
- Page transitions: `initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}`
- Cards cascade: stagger each by `0.05s`
- Streaming text: smooth word appearance, no typewriter cursor
- Loading: organic "breathing" orb — `animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}`
- Error shake: `animate={{ x: [0, -8, 8, -4, 4, 0] }} transition={{ duration: 0.4 }}`
- MindfulNudge: slide in from bottom, auto-dismiss after 6s
- Traffic light state changes: elegant fade, not flash

**Card styling (apply everywhere):**
- `rounded-2xl bg-white shadow-sm border border-[var(--border)]`
- Hover: subtle `shadow-md` transition
- Never use harsh drop shadows

#### COMPONENT SPECS

**`components/shared/TrafficLight.tsx`**
```typescript
// Labels — never show "AVOID" or "DANGER" to user
PRIORITIZE → "Great Choice"   (sage green badge)
MODERATE   → "Have Mindfully" (warm amber badge)
AVOID      → "Skip Today"     (muted terracotta, opacity-75)
// Never use red. Never show numeric scores.
```

**`components/shared/LoadingOrb.tsx`** — Framer Motion animated circle, soft sage green, breathing pulse. Accompanied by rotating contextual messages (fade in/out every 2.5s):
- "Reading your markers..."
- "Aligning with your profile..."
- "Consulting regional cuisine knowledge..."
- "Building your personalized guide..."

**`components/shared/StreamingText.tsx`** — Renders streaming tokens smoothly. No typewriter cursor. Words appear with gentle opacity fade-in.

**`components/onboard/AgentProgressStepper.tsx`** — 3-step visual stepper:
- Step 1: "Reading your report" → animated while Agent 1 runs
- Step 2: "Checking safety" → animated while Agent 2 runs
- Step 3: "Building your profile" → shows `StreamingText` while Agent 3 streams
- Each step: icon (not checkmark until done), label, status
- Staggered reveal: each step appears after previous completes

**`components/onboard/GuardrailAlert.tsx`** — Non-alarming modal. Warm background. Calm icon (not ⚠️ red triangle). Shows `redirectMessage` in readable prose. CTA: "I understand — speak to my doctor." Dismissible.

**`components/dashboard/MarkerCard.tsx`** — Each blood marker as a card:
- Marker name (DM Sans semibold)
- Value in `DM Mono` large
- Status chip (color from CSS vars, never harsh)
- Implication text (1 sentence, warm tone)
- Expand chevron → reveals food rules (PRIORITIZE/MODERATE/AVOID lists)

**`components/chef-card/ChefCardView.tsx`** — Print-ready design:
- No GutCheck branding/logo (designed to show to restaurant staff)
- Large, scannable typography
- Intro: polite 1-sentence framing ("I have some dietary preferences I'd appreciate your help with:")
- Clean lists: Strictly Avoid | Have in Moderation | Allergy Notes
- CTAs: [Print] [Share as PDF] [Copy to clipboard]
- `@media print` CSS: hide nav, full-width, clean margins

**`components/layout/OfflineBanner.tsx`** — Subtle top banner when offline. Warm amber background. "You're offline — GutCheck is using your cached profile for quick checks." Auto-hides on reconnect.

#### PAGE SPECS

**`app/page.tsx` (Landing)**
- Full-viewport hero. Warm off-white background.
- Headline (Cormorant Garamond, large): *"Know your body. Trust your meals."*
- Sub-headline (DM Sans): *"GutCheck translates your blood report into everyday food wisdom."*
- Single CTA button (sage green): *"Get started — it's private"*
- Footer note (small, muted): *"Your health data never leaves your device."*
- Subtle food imagery: muted, high-quality natural textures (use CSS gradients or curated free images, NOT clip art or stethoscopes)
- If `isOnboarded === true` in store → redirect to `/dashboard` on mount

**`app/onboard/page.tsx`**
- Full-page dropzone: drag-and-drop + tap-to-upload. Accept: `.pdf, .jpg, .jpeg, .png, .webp`. Max: 20MB.
- On file selection: render `PDFPreview` (pdfjs-dist canvas render of first page) or image thumbnail
- Below preview: "Looks good — analyze my report" CTA
- On click: `useAgentPipeline().run(file)` → transitions to `AgentProgressStepper`
- **Unit ambiguity:** If `stage === 'unit_ambiguous'`, show inline modal: "We noticed [marker] is listed as '[value]' without a clear unit. Is this ng/mL or nmol/L?" — two large buttons
- **Wrong report:** If `extractionFailed: true` → gentle message: *"This doesn't look like a blood report. Please upload a lab report PDF or photo."* Reset to dropzone.
- **Guardrail blocked:** `GuardrailAlert` modal
- On complete: `ProfileConfirmation` component → "Save my profile" button → save + redirect to `/dashboard`

**`app/dashboard/page.tsx`**
- `ProfileSnapshot` at top: overall health summary, 1–2 sentence intro
- `DailyNudge`: changes each day. Rotates between movement, hydration, and food tips.
- `SeasonalTip`: only renders if `getSeasonalNudge()` returns non-null for user's location + date
- `MarkerGrid`: responsive grid of `MarkerCard` components
- `TrendSparkline`: only shows if `reportHistory.length >= 2`. Small Recharts sparkline per marker.
- Quick access row: [Scan a menu →] [Audit groceries →] [Show Chef's Card →]

**`app/scan/page.tsx`**
- `ScanModeToggle`: three modes — Camera / Type a Dish / Paste Menu Text
- **Camera mode:** `getUserMedia()`, show live preview, capture frame on button press, convert to base64, send to `scan-menu` route as vision input
- **Quick-Query mode:** Single-line `QuickQueryInput`. CLIENT-SIDE emergency keyword check BEFORE any API call. If emergency keyword found → show `EMERGENCY_RESPONSE`, block submission.
- **Menu text mode:** Large textarea. "Example menu" demo buttons for testing.
- `OfflineBanner` when offline
- `OfflineScanBadge` on individual results when `isOfflineResult: true`
- Results: `DishResultCard` cascade, sorted by score descending
- After 8th scan: `MindfulNudge` slides up from bottom, auto-dismisses after 6s
- "Save analysis" → persist to `scanHistory` in Zustand

**`app/grocery/page.tsx`**
- Large, clean textarea: *"Paste your grocery list here — from Blinkit, Zepto, or anywhere"*
- Input supports: newline-separated, CSV, or free text
- Submit → streaming results
- `GroceryItemRow`: item name + traffic light badge + reason (expandable)
- `SwapSuggestion`: swap suggestion + where to find + why it's better
- Summary bar: "X items look great · Y to moderate · Z to reconsider"

**`app/chef-card/page.tsx`**
- Renders `ChefCardView` if `healthProfile` exists
- If no profile → prompt: "Upload your blood report first to generate your Chef's Card."

**`app/profile/page.tsx`**
- Full `MarkerCard` list (all markers, expanded view)
- Each card: marker name, value, status, implication, food rules
- Inline notes: user can add custom notes (stored in Zustand, never sent to server)
- "Update with new report" → navigate to `/onboard`
- "Wipe all data" → confirmation modal (2-step confirmation: "Are you sure?" + "Yes, delete everything") → `executeCleanSlate()`

**`app/history/page.tsx`**
- Empty state if `reportHistory.length === 0`: gentle prompt to upload first report
- Chronological list of `ReportHistoryEntry`
- Each entry: date, lab name, `MarkerDelta` chips (↑ IMPROVING green / ↓ WORSENING terracotta / → STABLE gray)
- `TrendSparkline` per marker across all reports (Recharts `LineChart`)

---

## PWA CONFIGURATION

**`next.config.js`:**
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: 'CacheFirst',
    },
    {
      urlPattern: /^\/(?!api\/).*/,
      handler: 'NetworkFirst',
      options: { cacheName: 'pages-cache', networkTimeoutSeconds: 3 },
    },
    // Never cache API routes — they must always be live
  ],
});

module.exports = withPWA({
  // your next config
});
```

**`public/manifest.json`:**
```json
{
  "name": "GutCheck",
  "short_name": "GutCheck",
  "description": "Your personal wellness guide from your blood report",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAF8F4",
  "theme_color": "#5A7A5A",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## TSCONFIG — STRICT MODE (no changes)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  }
}
```

---

## ENVIRONMENT VARIABLES

Create `.env.local`:
```bash
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## MANDATORY EDGE CASES — ALL MUST BE IMPLEMENTED

| Edge Case | Implementation |
|-----------|----------------|
| Critical blood values (glucose > 300, etc.) | `lib/guardrail/thresholds.ts` runs FIRST, before any AI. Return `STANDARD_REDIRECT`. Block pipeline. |
| Emergency symptom keywords in Quick-Query | Client-side instant check before API call. Show `EMERGENCY_RESPONSE`. Block submission. |
| Pregnancy/pediatric detected | Agent 2 detects keywords. Return `PREGNANCY_REDIRECT` or `PEDIATRIC_REDIRECT`. Block Agent 3. |
| Ambiguous units (ng/mL vs nmol/L) | If `unitAmbiguous: true` on any marker, pause pipeline at `unit_ambiguous` stage. Show clarification modal. |
| Wrong document (not a blood report) | Agent 1 returns `extractionFailed: true`. Show gentle message. Reset to dropzone. |
| 3+ elevated markers | Agent 3 uses "Focus on ONE great addition today" framing. Max 7 items per category. |
| Rapid-fire scanning (8+ scans/day) | After 8: show `MindfulNudge`. NEVER hard-block. Rotate through 3 messages. |
| Offline at restaurant | Switch to `lib/offline/fallback-tree.ts`. Show `OfflineBanner`. Mark results `isOfflineResult: true`. |
| Google Drive token expiry | Silently cache locally. Prompt re-auth. On re-auth: merge (take newer), never overwrite blindly. |
| Clean Slate Drive lag | `clearAll()` in Zustand FIRST (synchronous). UI shows clean state immediately. Drive delete is async background. Retry 3x on failure. |
| Fasting input (Ekadashi, Ramadan, Navratri) | Detect in Quick-Query input. Apply appropriate breaking-fast advice from `lib/cultural/fasting-patterns.ts`. |
| Regional food names (phuchka, telebhaja, etc.) | Map via `INDIAN_FOOD_MAP` before sending to AI. Supplement AI reasoning with known local ingredient data. |
| Seasonal nudges | `lib/cultural/seasonal-nudges.ts` reads date + location. Summer Bengal → Daab/Lebu Jol. Kidney restriction respected. |
| Multiple conflicting marker rules | Agent 3 prompt has explicit conflict resolution hierarchy. Flag intersections explicitly in output. |

---

## QUALITY CHECKLIST — EVALUATE BEFORE MARKING COMPLETE

Before considering any phase done, verify:

- [ ] `strict: true` TypeScript — zero `any`, zero implicit types
- [ ] Zod validation at every API boundary (input AND output)
- [ ] Deterministic guardrail runs WITHOUT calling AI
- [ ] All heavy AI routes use SSE streaming, not awaited JSON
- [ ] No health data stored server-side (only relayed in memory)
- [ ] PWA manifest + service worker configured
- [ ] Offline keyword fallback tree implemented and tested
- [ ] `INDIAN_FOOD_MAP` has ≥ 20 entries with correct nutritional flags
- [ ] Fasting patterns implemented for Ekadashi, Ramadan, Navratri
- [ ] Seasonal nudges respond correctly to date + location
- [ ] No numeric scores shown to users anywhere in UI
- [ ] TrafficLight uses "Great Choice / Have Mindfully / Skip Today" — NOT "PRIORITIZE / AVOID"
- [ ] `AVOID` items use muted terracotta, never harsh red
- [ ] MindfulNudge appears after 8 scans, never hard-blocks
- [ ] Chef's Card is print-ready and hides GutCheck branding
- [ ] Clean Slate clears Zustand first, Drive second
- [ ] Zustand store has `version` + `migrate` handler
- [ ] Emergency symptom keywords checked client-side before API
- [ ] Unit ambiguity pauses pipeline and prompts user
- [ ] `AgentProgressStepper` shows all 3 stages with streaming text in Stage 3
- [ ] `TrendSparkline` only renders when `reportHistory.length >= 2`
- [ ] All Framer Motion animations use the specified easing and timing
- [ ] No pure `#FFFFFF` backgrounds or `#000000` text anywhere
- [ ] Fonts: Cormorant Garamond (display), DM Sans (body), DM Mono (data)
- [ ] Vitest unit tests for all Zod parsers

---

## DEMO-READINESS NOTE

If running as a demo without real Google OAuth credentials, the app must still be fully functional. Drive sync should gracefully degrade to local-only mode. Add a subtle UI note: "Sign in with Google to sync across devices (optional)." The core onboarding → dashboard → scan → chef-card flow must work completely without auth.

---

*This is the complete specification. Build it in the exact order defined above. Ask no clarifying questions — every decision is documented here. Begin with Phase 1, Step 1: `types/index.ts`.*
