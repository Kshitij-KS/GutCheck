# GutCheck — Master Architecture & Implementation Guide
## Reference Document for Claude Code

> **Purpose:** This document is the single source of truth for building GutCheck. Read every section before writing a single line of code. Every architectural decision, edge case, and UI rule is defined here. Deviate only with explicit justification.

---

## 0. PRODUCT NORTH STAR

**What GutCheck is:** A privacy-first, AI-powered wellness platform that translates clinical blood report data into personalized, everyday food and lifestyle guidance. It acts as a *lifestyle architect*, not a diagnostic tool.

**What GutCheck is NOT:** A medical application. It is never diagnostic. It never replaces a doctor. It never claims certainty about health outcomes.

**Vibe directive:** Grounded. Organic. Effortlessly classy. Think premium wellness journal meets intelligent nutritionist — not a hospital app, not a generic AI chatbot. Muted earth tones. Generous whitespace. Deliberate typography. Every interaction feels considered.

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           GUTCHECK CLIENT                               │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    NEXT.JS 14 (App Router)                      │   │
│  │                                                                 │   │
│  │  Pages:                                                         │   │
│  │  / (landing)  /onboard  /dashboard  /scan  /chef-card          │   │
│  │  /profile     /history  /grocery                               │   │
│  │                                                                 │   │
│  │  ┌─────────────────┐    ┌──────────────────────────────────┐  │   │
│  │  │  Zustand Store   │    │     Service Worker (PWA)         │  │   │
│  │  │  (persisted)     │◄──►│     Offline fallback engine      │  │   │
│  │  │                  │    │     Cached keyword rules tree    │  │   │
│  │  └────────┬─────────┘    └──────────────────────────────────┘  │   │
│  │           │                                                     │   │
│  └───────────┼─────────────────────────────────────────────────────┘   │
│              │                                                          │
│  ┌───────────▼─────────────────────────────────────────────────────┐   │
│  │                   DRIVE SYNC LAYER                              │   │
│  │   Google Drive AppData API ←→ Local Zustand Cache              │   │
│  │   gutcheck_profile.json · gutcheck_history.json                │   │
│  └───────────┬─────────────────────────────────────────────────────┘   │
│              │                                                          │
└──────────────┼──────────────────────────────────────────────────────────┘
               │ Server API calls (streaming SSE)
┌──────────────▼──────────────────────────────────────────────────────────┐
│                      NEXT.JS API ROUTES (Server)                        │
│                                                                         │
│  /api/agents/extract          → Agent 1: Extraction                    │
│  /api/agents/guardrail        → Agent 2: Clinical Guardrail            │
│  /api/agents/translate        → Agent 3: Translation                   │
│  /api/agents/scan-menu        → Menu / Quick-Query Scanner             │
│  /api/agents/scan-grocery     → Grocery Auditor                        │
│  /api/pdf/extract             → PDF text extraction (server-side)      │
│  /api/drive/sync              → Drive read/write proxy                 │
│  /api/drive/wipe              → Clean Slate Protocol                   │
│                                                                         │
└──────────────┬──────────────────────────────────────────────────────────┘
               │
   ┌───────────┴──────────────┐
   │    Anthropic Claude API   │
   │    (claude-sonnet-4-5-   │
   │    20251001, streaming)   │
   └──────────────────────────┘
```

---

## 2. TECH STACK — EXACT VERSIONS, NO SUBSTITUTIONS

```
Framework:         Next.js 14.2+ (App Router ONLY — no Pages Router)
Language:          TypeScript 5.4+ (strict: true, noImplicitAny: true, NO any)
Styling:           Tailwind CSS 3.4 + shadcn/ui components
State:             Zustand 4.5 (persist middleware + devtools)
AI:                @anthropic-ai/sdk 0.24+ (streaming)
PDF (server):      pdf-parse 1.1.1
PDF (client):      pdfjs-dist 4.x (canvas render for preview)
Forms:             React Hook Form 7.5 + Zod 3.23 (all inputs validated)
Animations:        Framer Motion 11
Icons:             Lucide React
Auth:              next-auth 4.24 (Google OAuth provider)
Drive API:         googleapis 140+ (server-side only)
PWA:               next-pwa 5.6 (service worker + offline support)
Testing:           Vitest 1.x (unit tests for all agents/parsers)
Linting:           ESLint + Prettier (enforced on commit)
```

---

## 3. FOLDER STRUCTURE — COMPLETE

```
gutcheck/
│
├── app/
│   ├── layout.tsx                          # Root layout + font + providers
│   ├── page.tsx                            # Landing page
│   ├── onboard/
│   │   └── page.tsx                        # Upload blood report flow
│   ├── dashboard/
│   │   └── page.tsx                        # Main hub post-onboard
│   ├── scan/
│   │   └── page.tsx                        # Omnivore Scanner (menu + quick query)
│   ├── grocery/
│   │   └── page.tsx                        # Grocery Auditor
│   ├── chef-card/
│   │   └── page.tsx                        # Chef's Card printable view
│   ├── profile/
│   │   └── page.tsx                        # Health profile + marker details
│   ├── history/
│   │   └── page.tsx                        # Report history + trend sparklines
│   └── api/
│       ├── agents/
│       │   ├── extract/route.ts            # Agent 1
│       │   ├── guardrail/route.ts          # Agent 2
│       │   ├── translate/route.ts          # Agent 3
│       │   ├── scan-menu/route.ts          # Menu scanner
│       │   └── scan-grocery/route.ts       # Grocery auditor
│       ├── pdf/
│       │   └── extract/route.ts            # PDF → text (server)
│       └── drive/
│           ├── sync/route.ts               # Read/write Drive AppData
│           └── wipe/route.ts               # Clean Slate Protocol
│
├── components/
│   ├── ui/                                 # shadcn auto-generated
│   ├── layout/
│   │   ├── AppShell.tsx                    # Sidebar + nav wrapper
│   │   ├── Navbar.tsx
│   │   ├── OfflineBanner.tsx              # Appears when SW detects offline
│   │   └── PageTransition.tsx             # Framer Motion page wrapper
│   ├── onboard/
│   │   ├── FileDropzone.tsx               # PDF + image upload (drag + tap)
│   │   ├── PDFPreview.tsx                 # Canvas render of first page
│   │   ├── AgentProgressStepper.tsx       # 3-step agent pipeline UI
│   │   ├── GuardrailAlert.tsx             # Medical override modal
│   │   └── ProfileConfirmation.tsx        # Review before saving
│   ├── dashboard/
│   │   ├── ProfileSnapshot.tsx            # Top-level health summary card
│   │   ├── MarkerGrid.tsx                 # All markers in grid
│   │   ├── MarkerCard.tsx                 # Single marker (status-colored)
│   │   ├── DailyNudge.tsx                 # Context-aware lifestyle nudge
│   │   ├── TrendSparkline.tsx             # Historical marker trend chart
│   │   └── SeasonalTip.tsx                # Date+location-aware tip
│   ├── scan/
│   │   ├── ScanModeToggle.tsx             # Camera / Quick-Query toggle
│   │   ├── CameraCapture.tsx              # Menu photo capture
│   │   ├── QuickQueryInput.tsx            # Text input for dish/ingredient
│   │   ├── DishResultCard.tsx             # Single dish result
│   │   ├── OfflineScanBadge.tsx           # "Offline Mode" indicator
│   │   └── MindfulNudge.tsx               # Shown after rapid-fire scanning
│   ├── grocery/
│   │   ├── CartPasteInput.tsx             # Paste grocery cart text
│   │   ├── GroceryItemRow.tsx             # Item with traffic light
│   │   └── SwapSuggestion.tsx             # Healthier local alternative
│   ├── chef-card/
│   │   └── ChefCardView.tsx               # Printable/shareable summary
│   └── shared/
│       ├── TrafficLight.tsx               # Prioritize/Moderate/Avoid badge
│       ├── StreamingText.tsx              # Token-by-token text reveal
│       └── LoadingOrb.tsx                 # Organic loading animation
│
├── lib/
│   ├── anthropic.ts                        # Anthropic client singleton
│   ├── prompts/
│   │   ├── agent-extract.prompt.ts        # Agent 1 prompt
│   │   ├── agent-guardrail.prompt.ts      # Agent 2 prompt
│   │   ├── agent-translate.prompt.ts      # Agent 3 prompt
│   │   ├── scan-menu.prompt.ts            # Menu scanner prompt
│   │   └── scan-grocery.prompt.ts         # Grocery auditor prompt
│   ├── parsers/
│   │   ├── extract.parser.ts              # Zod validation for Agent 1
│   │   ├── translate.parser.ts            # Zod validation for Agent 3
│   │   ├── scan.parser.ts                 # Zod validation for scan results
│   │   └── grocery.parser.ts              # Zod validation for grocery results
│   ├── guardrail/
│   │   ├── thresholds.ts                  # CRITICAL value hardcoded limits
│   │   ├── symptom-keywords.ts            # Emergency symptom keyword list
│   │   └── special-populations.ts         # Pregnancy / pediatric detection
│   ├── drive/
│   │   ├── client.ts                      # Google Drive API client (server)
│   │   ├── sync.ts                        # Sync logic: local ↔ Drive
│   │   └── wipe.ts                        # Clean Slate implementation
│   ├── offline/
│   │   ├── fallback-tree.ts               # Keyword matching rule tree
│   │   └── cache-builder.ts               # Compresses profile into offline rules
│   ├── pdf.ts                             # PDF extraction utilities
│   ├── cultural/
│   │   ├── indian-foods.ts                # Regional food → ingredient mapping
│   │   ├── fasting-patterns.ts            # Religious/cultural fasting recognition
│   │   └── seasonal-nudges.ts             # Date+location → seasonal suggestions
│   └── utils.ts                           # cn(), formatters, uuid, etc.
│
├── store/
│   ├── gutcheck.store.ts                  # Main Zustand store
│   └── scan.store.ts                      # Ephemeral scan session store
│
├── hooks/
│   ├── useAgentPipeline.ts                # Orchestrates all 3 agents
│   ├── useMenuScan.ts                     # Menu scan streaming hook
│   ├── useGroceryScan.ts                  # Grocery auditor hook
│   ├── useDriveSync.ts                    # Drive sync hook
│   ├── useOfflineDetection.ts             # Online/offline state
│   └── useScanRateLimit.ts                # Mindful friction: scan rate limiting
│
├── types/
│   └── index.ts                           # ALL TypeScript interfaces
│
├── constants/
│   ├── markers.ts                         # Blood marker definitions + normal ranges
│   ├── critical-thresholds.ts             # Non-negotiable medical override limits
│   └── regional-foods.ts                  # Indian/Bengali cuisine mappings
│
└── public/
    ├── sw.js                              # Service Worker (auto-generated by next-pwa)
    └── manifest.json                      # PWA manifest
```

---

## 4. COMPLETE TYPESCRIPT TYPES

```typescript
// types/index.ts — Define ALL types here first. Never define types inline.

// ─── Core Enums ───────────────────────────────────────────────────────────────

export type MarkerStatus =
  | 'OPTIMAL'
  | 'BORDERLINE'
  | 'ELEVATED'
  | 'CRITICAL'
  | 'LOW'
  | 'CRITICALLY_LOW';

export type TrafficLight = 'PRIORITIZE' | 'MODERATE' | 'AVOID';

export type AgentStatus = 'idle' | 'running' | 'done' | 'error' | 'blocked';

export type ScanMode = 'camera' | 'quick-query' | 'menu-text';

export type DriveSync = 'synced' | 'pending' | 'error' | 'offline';

export type SpecialPopulation = 'pregnant' | 'pediatric' | 'none';

// ─── Blood Markers ─────────────────────────────────────────────────────────────

export interface BloodMarker {
  id: string;                            // snake_case unique id e.g. "hba1c"
  name: string;                          // "HbA1c"
  value: string;                         // "5.9%" — raw string from report
  unit: string | null;                   // "%" — null if ambiguous
  unitAmbiguous: boolean;                // true if ng/mL vs nmol/L unclear
  numericValue: number;
  reportedRange: string | null;          // Normal range from the report itself
  standardRange: string;                 // Canonical clinical range
  status: MarkerStatus;
  implication: string;                   // Plain English: "Pre-diabetic range..."
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
  recommended: string[];                  // e.g. "post-meal 15 min walk"
  avoid: string[];
  breathworkSuggestions: string[];        // e.g. "Nadi Shodhana for cortisol"
}

// ─── Health Profile ────────────────────────────────────────────────────────────

export interface HealthProfile {
  id: string;
  schemaVersion: '1.0';
  createdAt: string;                     // ISO 8601
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
  cuisineGuidance: string;               // India/Bengali-aware
}

// ─── Chef's Card ───────────────────────────────────────────────────────────────

export interface ChefCardContent {
  title: string;                          // "My Dietary Requirements"
  intro: string;                          // 1 sentence, polite framing
  strictAvoidList: string[];
  moderateList: string[];
  allergyNotes: string | null;
  additionalNote: string | null;
}

// ─── Offline Fallback ──────────────────────────────────────────────────────────

export interface OfflineFallbackTree {
  avoidKeywords: string[];               // Compressed list for keyword matching
  moderateKeywords: string[];
  prioritizeKeywords: string[];
  lastBuiltAt: string;
}

// ─── Report History ────────────────────────────────────────────────────────────

export interface ReportHistoryEntry {
  id: string;
  uploadedAt: string;
  reportDate: string | null;
  profileSnapshot: HealthProfile;        // Full snapshot at time of upload
  markerDeltas: MarkerDelta[];           // Changes from previous report
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

// ─── Guardrail ─────────────────────────────────────────────────────────────────

export interface GuardrailResult {
  passed: boolean;
  criticalMarkers: CriticalMarkerFlag[];
  emergencySymptomDetected: boolean;
  specialPopulationDetected: SpecialPopulation;
  redirectMessage: string | null;        // Non-alarmist message if blocked
}

export interface CriticalMarkerFlag {
  markerId: string;
  markerName: string;
  value: string;
  reason: string;
}

// ─── Scan Results ─────────────────────────────────────────────────────────────

export interface DishScanResult {
  id: string;
  dishName: string;
  classification: TrafficLight;
  score: number;                         // 0–100
  primaryReason: string;
  markerImpacts: DishMarkerImpact[];
  modification: string | null;
  portionAdvice: string | null;
  isOfflineResult: boolean;
}

export interface DishMarkerImpact {
  markerId: string;
  markerName: string;
  impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  reason: string;
}

export interface MenuScanResult {
  id: string;
  scannedAt: string;
  restaurantContext: string;
  cuisineType: string;
  dishes: DishScanResult[];
  topPick: string | null;
  worstPick: string | null;
  summary: string;
  isOfflineResult: boolean;
}

// ─── Grocery Audit ─────────────────────────────────────────────────────────────

export interface GroceryItem {
  id: string;
  name: string;                          // As-typed by user
  brand: string | null;
  classification: TrafficLight;
  reason: string;
  swap: GrocerySwap | null;
}

export interface GrocerySwap {
  name: string;
  reason: string;
  whereToFind: string;                   // "Available on Blinkit / local kirana"
}

export interface GroceryAuditResult {
  id: string;
  auditedAt: string;
  items: GroceryItem[];
  summary: string;
  avoidCount: number;
  moderateCount: number;
  prioritizeCount: number;
}

// ─── Zustand Store Shape ───────────────────────────────────────────────────────

export interface GutCheckStore {
  // Profile
  healthProfile: HealthProfile | null;
  isOnboarded: boolean;
  reportHistory: ReportHistoryEntry[];

  // Drive Sync
  driveSync: DriveSync;
  lastSyncedAt: string | null;

  // Scan Session
  scanHistory: MenuScanResult[];
  groceryHistory: GroceryAuditResult[];

  // Mindful Friction
  scanCountToday: number;
  lastScanDate: string | null;

  // Actions
  setHealthProfile: (profile: HealthProfile) => void;
  addReportHistory: (entry: ReportHistoryEntry) => void;
  addScanResult: (result: MenuScanResult) => void;
  addGroceryResult: (result: GroceryAuditResult) => void;
  incrementScanCount: () => void;
  setDriveSync: (status: DriveSync) => void;
  clearAll: () => void;                  // Clean Slate Protocol
}
```

---

## 5. THE THREE-AGENT PIPELINE

This is the intellectual core. Every blood report upload flows through ALL THREE agents in sequence. Never skip, never merge.

### Agent 1 — The Extraction Agent

```typescript
// lib/prompts/agent-extract.prompt.ts

export const EXTRACT_SYSTEM_PROMPT = `
You are a medical data extraction specialist. Your ONLY job is to read a blood test report and extract structured data from it. You do NOT interpret clinical significance. You do NOT give lifestyle advice. You extract facts.

EXTRACTION RULES:
- Extract every lab test result present in the document
- Standardize marker names to common medical terminology (e.g., "Blood Sugar Fasting" → "Fasting Glucose")
- Preserve the EXACT value and unit as printed in the report
- If a unit is missing or ambiguous (e.g., Vitamin D shows "20" with no unit), set unitAmbiguous: true and unit: null
- Extract the lab name and report date if present
- If the document is NOT a blood report (e.g., it's a dental record, prescription, or unrelated document), return extractionFailed: true

CRITICAL: Do NOT set clinical status. Do NOT add food rules. Do NOT interpret. That is Agent 2 and 3's job.

OUTPUT: Valid JSON only. No preamble. No markdown fences.

{
  "extractionFailed": false,
  "failureReason": null,
  "reportDate": "YYYY-MM-DD or null",
  "labName": "Lab name or null",
  "markers": [
    {
      "id": "snake_case_id",
      "name": "Standardized marker name",
      "rawName": "Exact name from report",
      "value": "Exact value string",
      "numericValue": 0.0,
      "unit": "Unit or null",
      "unitAmbiguous": false,
      "reportedRange": "Normal range from report or null"
    }
  ]
}
`;
```

### Agent 2 — The Clinical Guardrail Agent (Deterministic-First, AI-Second)

**CRITICAL IMPLEMENTATION NOTE:** The Guardrail Agent has TWO layers:

**Layer 1 (Deterministic — runs BEFORE any AI call):**
```typescript
// lib/guardrail/thresholds.ts

export const CRITICAL_THRESHOLDS: Record<string, { min?: number; max?: number; unit: string }> = {
  fasting_glucose:     { max: 300,  unit: 'mg/dL' },
  random_glucose:      { max: 400,  unit: 'mg/dL' },
  hba1c:               { max: 12.0, unit: '%' },
  platelet_count:      { min: 20,   unit: '×10³/μL' },
  hemoglobin:          { min: 5.0,  unit: 'g/dL' },
  serum_creatinine:    { max: 8.0,  unit: 'mg/dL' },
  sgot_ast:            { max: 500,  unit: 'U/L' },
  sgpt_alt:            { max: 500,  unit: 'U/L' },
  sodium:              { min: 120, max: 160, unit: 'mEq/L' },
  potassium:           { min: 2.5, max: 7.0, unit: 'mEq/L' },
  tsh:                 { max: 50,  unit: 'mIU/L' },
};

// If ANY marker breaches these — halt pipeline immediately.
// Do NOT call AI. Return redirect message directly.

export const STANDARD_REDIRECT =
  "One or more values in your report require clinical evaluation before dietary guidance is appropriate. Please share this report with your healthcare provider.";

// ─── Symptom Keywords (block Quick-Query input) ────────────────────────────────

export const EMERGENCY_SYMPTOM_KEYWORDS: string[] = [
  'chest pain', 'chest tightness', 'left arm pain', 'jaw pain',
  'shortness of breath', 'can\'t breathe', 'difficulty breathing',
  'severe pain', 'crushing pain', 'numbness in arm', 'stroke',
  'unconscious', 'fainted', 'heart attack', 'seizure', 'blood vomit',
  'coughing blood', 'passing blood', 'severe allergic', 'anaphylaxis',
];

export const EMERGENCY_RESPONSE = `This sounds like it may be a medical emergency. Please call emergency services (112 in India) immediately. GutCheck is not equipped to help with acute symptoms.`;

// ─── Special Populations ───────────────────────────────────────────────────────

export const PREGNANCY_KEYWORDS = [
  'pregnant', 'pregnancy', 'trimester', 'expecting', 'antenatal',
  'prenatal', 'gestational',
];

export const PEDIATRIC_AGE_THRESHOLD = 18;

export const PREGNANCY_REDIRECT =
  "GutCheck's current guidance is calibrated for non-pregnant adults. For dietary advice during pregnancy, please consult your OB/GYN or a registered dietitian.";

export const PEDIATRIC_REDIRECT =
  "GutCheck's current guidance is calibrated for adults. For children's dietary guidance, please consult a pediatrician.";
```

**Layer 2 (AI — only runs if Layer 1 passes):**
```typescript
// lib/prompts/agent-guardrail.prompt.ts
// This agent verifies contextual safety flags Layer 1 may have missed.
// It also checks for implicit pregnancy/pediatric signals in the report.
// Returns { passed: boolean, flags: string[] } — never gives food advice.
```

### Agent 3 — The Translation Agent

```typescript
// lib/prompts/agent-translate.prompt.ts

export const TRANSLATE_SYSTEM_PROMPT = `
You are a clinical nutritionist and preventive wellness specialist. You receive a list of blood markers that have already been safety-checked. Your job is to translate out-of-range markers into holistic, preventive lifestyle guidance across three dimensions: Food, Movement, and Hydration.

PHILOSOPHY — Read this carefully:
- You are ADDITIVE, not restrictive. Lead with what the user CAN eat, not what they cannot.
- Tone is grounded and warm, not clinical or alarming.
- All food references must be India-aware. Use dal, sabzi, roti, chawal, chaas, nimbu pani, etc.
- Regional specificity matters: if the report context suggests Bengal, use posto, maacher jhol, shorshe, telebhaja.
- Movement suggestions must be realistic for a non-athlete: walks, pranayama, yoga — not gym routines.

CONSTRAINT HIERARCHY (resolve conflicts in this order):
1. Allergies / severe restrictions (absolute — never override)
2. Medical markers (CRITICAL or ELEVATED — strong food rules)
3. BORDERLINE markers (moderate guidance)
4. OPTIMAL markers (minimal rules)

CONFLICT RESOLUTION:
- If high uric acid AND high protein goal coexist: recommend plant-based proteins (moong, tofu) that satisfy both
- If diabetes AND kidney disease coexist: low-GI AND low-potassium — explicitly note the intersection
- If high LDL AND South Indian cuisine context: emphasize coconut in moderation, prefer sesame/groundnut oil

FRAMING RULES:
- Never list more than 7 items in a single food rule category (overwhelm causes non-compliance)
- For users with 3+ elevated markers: use "Focus on finding ONE great addition today" framing
- Do NOT use numeric scores in translation output — use qualitative language only

CHEF'S CARD: Generate a polite, concise, restaurant-ready restriction summary. Tone: kind, not demanding. Designed to be shown to a chef or server.

OUTPUT: Valid JSON only. No preamble. No markdown fences.

Full schema matches the HealthProfile interface (markers[] with foodRules, movementRules, hydrationRules + consolidatedRules + chefCardContent + offlineFallbackTree).
`;
```

### Agent Orchestration Hook

```typescript
// hooks/useAgentPipeline.ts

type PipelineState =
  | { stage: 'idle' }
  | { stage: 'extracting' }
  | { stage: 'guardrail_checking' }
  | { stage: 'guardrail_blocked'; result: GuardrailResult }
  | { stage: 'translating'; streamedText: string }
  | { stage: 'complete'; profile: HealthProfile }
  | { stage: 'error'; message: string };

export function useAgentPipeline() {
  const [state, setState] = useState<PipelineState>({ stage: 'idle' });
  const setHealthProfile = useGutCheckStore((s) => s.setHealthProfile);
  const addReportHistory = useGutCheckStore((s) => s.addReportHistory);

  const run = useCallback(async (file: File, userContext?: UserContext) => {
    // Step 0: Check for emergency symptom keywords in filename or metadata
    // Step 1: Extract PDF text → POST /api/pdf/extract
    // Step 2: POST /api/agents/extract → ExtractedMarkers[]
    // Step 3: Deterministic guardrail check (thresholds.ts) — LOCAL, no API
    // Step 4: POST /api/agents/guardrail (AI layer) — only if Step 3 passes
    // Step 5: If guardrail blocked → setState blocked, return
    // Step 6: POST /api/agents/translate (streaming) → HealthProfile
    // Step 7: setHealthProfile + addReportHistory + trigger Drive sync
  }, []);

  return { state, run };
}
```

---

## 6. THE OMNIVORE SCANNER

### Menu Scanner System Prompt

```typescript
// lib/prompts/scan-menu.prompt.ts

export const SCAN_MENU_SYSTEM_PROMPT = `
You are GutCheck's Omnivore Scanner — a culturally intelligent, India-aware food analyst.

You receive a restaurant menu (as text or described from an image) and a user's health profile. You analyze every dish against their consolidated food rules and return a ranked, reasoned list.

CULTURAL INTELLIGENCE — Critical for India:
You have deep knowledge of:
- Bengali cuisine: phuchka (tamarind water + potato + spices), kachori (deep-fried, maida-based), telebhaja (any deep-fried item), aloo posto (potato in poppy seed paste with mustard oil), maacher jhol (fish curry — typically light), shorshe ilish (hilsa in mustard), chingri malaikari (prawns in coconut milk)
- Maharashtra, UP, Rajasthani, Tamil, Gujarati, Kerala cuisines
- Street food: pani puri, vada pav, chole bhature, kathi rolls, dosa variants
- Invisible ingredients: mustard oil in Bengali cooking, ghee in North Indian, coconut oil in South Indian, cream/butter in restaurant-style Punjabi, hidden sugar in restaurant sauces

When you encounter a regional dish name you know:
- Reason about its ACTUAL ingredients, not a generic Western approximation
- Account for the COOKING METHOD (telebhaja = deep fried = high saturated fat)
- Flag hidden ingredients that a user may not know about

SCORING LOGIC:
- PRIORITIZE (70–100): Actively contains the user's "prioritize" ingredients AND avoids all "strictAvoid"
- MODERATE (40–69): Safe but not optimal, or contains "moderate" items
- AVOID (0–39): Contains any "strictAvoid" ingredient for the user's elevated markers

ADDITIVE FRAMING: For every AVOID item, if there's a simple modification that makes it safe, include it in the "modification" field. Never just say "don't eat this" without an alternative.

MINDFUL LANGUAGE: Do not use clinical jargon. "This dish may spike blood sugar" not "This dish will cause hyperglycemia."

OUTPUT: Valid JSON only. No preamble.
Schema: MenuScanResult interface.
`;

export function buildMenuScanUserPrompt(
  menuText: string,
  profile: HealthProfile,
  isOffline: boolean
): string {
  if (isOffline) {
    // Offline mode: use keyword matching only, no full profile
    return `[OFFLINE MODE] Quick keyword check only.
Avoid keywords: ${profile.offlineFallbackTree.avoidKeywords.join(', ')}
Menu: ${menuText}
Return simplified results. Set isOfflineResult: true on all dishes.`;
  }

  return `Analyze this menu for a user with the following health profile.

PRIMARY CONCERNS: ${profile.primaryConcerns.join(', ')}
STRICTLY AVOID: ${profile.consolidatedRules.strictAvoid.join(', ')}
MODERATE: ${profile.consolidatedRules.moderate.join(', ')}
PRIORITIZE: ${profile.consolidatedRules.prioritize.join(', ')}
CUISINE GUIDANCE: ${profile.consolidatedRules.cuisineGuidance}

MENU:
---
${menuText}
---

Analyze every dish. Apply deep regional knowledge for Indian dishes. Flag hidden ingredients.`;
}
```

### Quick-Query Input Guardrail

```typescript
// This runs CLIENT-SIDE before any API call — instant, no latency

export function checkQuickQuerySafety(input: string): {
  safe: boolean;
  emergencyResponse?: string;
} {
  const lower = input.toLowerCase();
  const hasEmergencyKeyword = EMERGENCY_SYMPTOM_KEYWORDS.some(kw =>
    lower.includes(kw)
  );

  if (hasEmergencyKeyword) {
    return { safe: false, emergencyResponse: EMERGENCY_RESPONSE };
  }

  return { safe: true };
}
```

---

## 7. THE GROCERY AUDITOR

```typescript
// lib/prompts/scan-grocery.prompt.ts

export const GROCERY_SYSTEM_PROMPT = `
You are GutCheck's Grocery Auditor. You receive a pasted grocery cart (from Blinkit, Zepto, BigBasket, Swiggy Instamart, or any Indian grocery app) and a health profile.

For each item, classify it and suggest a healthier local swap if needed.

SWAP INTELLIGENCE:
- Swaps must be locally available in India — not "buy quinoa from Amazon" when a kirana store equivalent works
- Prefer swaps that are: cheaper, locally available, culturally familiar
- Examples: "Refined flour (maida) → Whole wheat atta or jowar atta (available at any kirana)"
- "Refined sunflower oil → Cold-pressed groundnut oil or mustard oil" 
- "White sugar → Jaggery (gud) or dates"
- "Packaged biscuits with trans fats → Roasted makhana or til chikki"

For each item, also flag hidden ingredients from brand names you recognize (e.g., Maggi noodles contain high sodium + maida).

OUTPUT: Valid JSON only. Schema: GroceryAuditResult interface.
`;
```

---

## 8. PRIVACY & DATA ARCHITECTURE

### Google Drive AppData Sync

```typescript
// lib/drive/sync.ts

// Drive AppData folder — completely hidden from user's main Drive
// Files: gutcheck_profile.json · gutcheck_history.json
// No data ever touches GutCheck servers — only relayed through Next.js API route
// The API route acts as an authenticated proxy — it never logs or stores data

export interface DriveSyncPayload {
  profile: HealthProfile | null;
  history: ReportHistoryEntry[];
  syncedAt: string;
}

// Sync strategy:
// 1. On profile update: write to local Zustand first (instant)
// 2. Then async write to Drive (non-blocking)
// 3. On app load: compare local updatedAt vs Drive updatedAt
// 4. Take the NEWER of the two — never blindly overwrite
// 5. On conflict: prefer the version with a MORE RECENT reportDate

export async function syncToDrive(
  accessToken: string,
  payload: DriveSyncPayload
): Promise<void> {
  // Uses Drive AppData scope: https://www.googleapis.com/auth/drive.appdata
  // File ID is stored in Zustand after first creation
}

export async function loadFromDrive(accessToken: string): Promise<DriveSyncPayload | null> {
  // On first login: loads existing profile from Drive if present
  // This enables cross-device sync
}
```

### Clean Slate Protocol

```typescript
// lib/drive/wipe.ts

// CRITICAL IMPLEMENTATION ORDER — Must be followed exactly:
// 1. clearAll() in Zustand — SYNCHRONOUS, happens IMMEDIATELY
// 2. UI re-renders to clean state — user sees empty state RIGHT NOW
// 3. THEN: fire async Drive delete request
// 4. THEN: await Drive delete confirmation
// The UI must NOT wait for Drive deletion before showing clean state.
// If Drive deletion fails: retry silently with exponential backoff (3 attempts)
// If all retries fail: show subtle "Sync issue — data cleared locally" notice

export async function executeCleanSlate(
  clearLocalStore: () => void,
  accessToken: string | null
): Promise<void> {
  // Step 1: Immediate local wipe
  clearLocalStore();

  // Step 2: Background Drive wipe (non-blocking)
  if (accessToken) {
    await wipeDriveData(accessToken).catch(() => {
      // Silent retry logic
      scheduleRetry(() => wipeDriveData(accessToken), 3);
    });
  }
}
```

---

## 9. OFFLINE RESILIENCE

### Service Worker Strategy

```typescript
// next.config.js — next-pwa configuration
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: 'CacheFirst',
    },
    {
      urlPattern: /^\/(?!api\/).*/,                   // Cache all pages
      handler: 'NetworkFirst',
      options: { cacheName: 'pages-cache', networkTimeoutSeconds: 3 },
    },
    // Never cache API routes — they must be live
  ],
});
```

### Offline Fallback Tree Builder

```typescript
// lib/offline/cache-builder.ts
// Runs after every profile update — compresses profile into a tiny keyword tree
// This tree is stored in Zustand (persisted to localStorage) — available offline

export function buildOfflineFallbackTree(
  profile: HealthProfile
): OfflineFallbackTree {
  // Extracts: strictAvoid[] + moderate[] + prioritize[]
  // Deduplicates and lowercases all terms
  // Adds regional food synonyms (e.g., "maida" → also matches "refined flour", "all-purpose flour")
  // Returns compressed OfflineFallbackTree (< 5KB)

  return {
    avoidKeywords: [...],
    moderateKeywords: [...],
    prioritizeKeywords: [...],
    lastBuiltAt: new Date().toISOString(),
  };
}

// lib/offline/fallback-tree.ts
// Offline scan function — keyword matching only, no AI
export function offlineQuickCheck(
  dishName: string,
  tree: OfflineFallbackTree
): Pick<DishScanResult, 'classification' | 'primaryReason' | 'isOfflineResult'> {
  const lower = dishName.toLowerCase();
  const hasAvoid = tree.avoidKeywords.some(kw => lower.includes(kw));
  const hasModerate = tree.moderateKeywords.some(kw => lower.includes(kw));
  const hasPrioritize = tree.prioritizeKeywords.some(kw => lower.includes(kw));

  if (hasAvoid) return {
    classification: 'AVOID',
    primaryReason: 'Contains an ingredient on your avoid list (offline check)',
    isOfflineResult: true,
  };
  // ... etc
}
```

---

## 10. CULTURAL & REGIONAL INTELLIGENCE

```typescript
// lib/cultural/indian-foods.ts
// Comprehensive mapping: colloquial name → ingredients + cooking method + nutritional profile

export const INDIAN_FOOD_MAP: Record<string, IndianFoodEntry> = {
  phuchka: {
    aliases: ['pani puri', 'golgappa', 'puchka'],
    primaryIngredients: ['semolina shell (maida/rava)', 'tamarind water', 'potato', 'chickpea', 'spices'],
    cookingMethod: 'deep-fried shell',
    keyNutrientFlags: ['refined_carbs', 'high_gi', 'tamarind_ok_for_most'],
    region: 'pan-india',
    notes: 'Shell is deep-fried — flag for LDL/cardiac profiles. Filling is mostly vegetable — generally safe.',
  },
  telebhaja: {
    aliases: ['tel bhaja', 'telebhaja'],
    primaryIngredients: ['varies (vegetables, fish, etc.)', 'besan or maida batter', 'mustard oil (deep fried)'],
    cookingMethod: 'deep-fried',
    keyNutrientFlags: ['high_saturated_fat', 'refined_carbs', 'high_gi'],
    region: 'bengal',
    notes: 'Generic term for any Bengali deep-fried item. Always flag for LDL and cardiac profiles.',
  },
  aloo_posto: {
    aliases: ['alu posto', 'aloo posto'],
    primaryIngredients: ['potato', 'poppy seeds (posto)', 'mustard oil', 'green chili'],
    cookingMethod: 'sauteed',
    keyNutrientFlags: ['high_gi_potato', 'poppy_seeds_high_omega6', 'mustard_oil_moderate'],
    region: 'bengal',
    notes: 'Generally well-tolerated. High GI from potato — caution for diabetic profiles. Poppy seeds are nutritious.',
  },
  macher_jhol: {
    aliases: ['maacher jhol', 'fish curry bengali'],
    primaryIngredients: ['fresh river fish (rohu, katla, or hilsa)', 'mustard oil', 'turmeric', 'vegetables'],
    cookingMethod: 'light curry',
    keyNutrientFlags: ['high_omega3_hilsa', 'lean_protein', 'anti_inflammatory_turmeric'],
    region: 'bengal',
    notes: 'One of the most profile-friendly Bengali dishes. High omega-3 (especially hilsa/ilish). Actively benefits LDL.',
  },
  daab_coconut_water: {
    aliases: ['daab', 'coconut water', 'nariyal pani', 'dab'],
    primaryIngredients: ['coconut water'],
    cookingMethod: 'raw',
    keyNutrientFlags: ['natural_electrolytes', 'low_gi', 'potassium_source'],
    region: 'bengal',
    notes: 'Excellent seasonal hydration in Bengal heat. Flag for kidney disease (potassium) — otherwise strongly recommended.',
  },
  lebu_jol: {
    aliases: ['nimbu pani', 'lemon water', 'shikanji', 'lebu jol'],
    primaryIngredients: ['lemon', 'water', 'salt', 'sugar optional'],
    cookingMethod: 'mixed drink',
    keyNutrientFlags: ['vitamin_c', 'electrolytes', 'low_gi_if_no_sugar'],
    region: 'bengal',
    notes: 'Excellent summer hydration. Recommend without sugar for diabetic profiles. With black salt for digestive benefits.',
  },
  // ... extend with 100+ entries
};

// lib/cultural/fasting-patterns.ts

export const FASTING_PATTERNS: Record<string, FastingInfo> = {
  ekadashi: {
    pattern: 'bi-monthly Hindu fast',
    windowDescription: 'Sunrise to next day sunrise — no grains',
    breakingAdvice: 'Break fast with protein + fat before sweets. Suggest: chaas, makhana, fruits before any sweet.',
    suitableBreakingFoods: ['chaas (buttermilk)', 'makhana', 'sabudana (moderate)', 'fresh fruit', 'dry fruits'],
    avoidAtBreaking: ['direct sugar', 'heavy fried items on empty stomach'],
  },
  ramadan_iftar: {
    pattern: 'month-long daily fast (Ramadan)',
    windowDescription: 'Sunrise to sunset — no food or water',
    breakingAdvice: 'Break fast with dates + water first (Sunnah and clinically sound). Then protein before carbs to prevent glucose spike.',
    suitableBreakingFoods: ['dates (2–3)', 'plain water', 'soup', 'grilled protein', 'then complex carbs'],
    avoidAtBreaking: ['fried items on empty stomach', 'sugary sherbet first', 'heavy biryani immediately'],
  },
  navratri: {
    pattern: '9-day Hindu fast',
    windowDescription: 'No grains, no onion/garlic — permitted: fruits, milk, sendha namak (rock salt), certain flours',
    breakingAdvice: 'Profile-dependent. For diabetic users: avoid excessive sabudana/potato which are high-GI during fasting.',
    suitableBreakingFoods: ['kuttu roti (buckwheat)', 'samak rice (barnyard millet)', 'fruits', 'milk', 'makhana'],
  },
};

// lib/cultural/seasonal-nudges.ts

export function getSeasonalNudge(
  date: Date,
  location: string,
  profile: HealthProfile
): string | null {
  const month = date.getMonth(); // 0-indexed
  const isBengal = location.toLowerCase().includes('bengal') ||
                   location.toLowerCase().includes('kolkata') ||
                   location.toLowerCase().includes('khardaha');

  // April–June: Bengali summer heat
  if (month >= 3 && month <= 5 && isBengal) {
    const hasKidneyIssue = profile.markers.some(
      m => m.id === 'creatinine' && m.status !== 'OPTIMAL'
    );

    if (hasKidneyIssue) {
      return 'The summer heat calls for extra hydration. Stick to plain water and low-potassium options — skip coconut water given your kidney markers.';
    }

    return 'It\'s peak summer in Bengal right now. A glass of Daab (coconut water) or Lebu Jol (lemon water with black salt) in the afternoon will replenish your electrolytes far better than plain water or cold drinks.';
  }

  // November–January: Winter in Bengal — heavier foods
  if (month >= 10 || month <= 1) {
    return 'Winter in Bengal means nolen gur and pithes — enjoy them mindfully. A small portion of date-palm jaggery is lower-GI than refined sugar.';
  }

  return null;
}
```

---

## 11. MINDFUL FRICTION SYSTEM

```typescript
// hooks/useScanRateLimit.ts

const DAILY_SCAN_SOFT_LIMIT = 8;
const RAPID_FIRE_THRESHOLD_SECONDS = 15; // Flag if scanning faster than this

export function useScanRateLimit() {
  const { scanCountToday, lastScanDate, incrementScanCount } = useGutCheckStore();

  // Reset count if it's a new day
  const todayStr = new Date().toISOString().split('T')[0];
  const isNewDay = lastScanDate !== todayStr;

  const shouldShowMindfulNudge =
    !isNewDay && scanCountToday >= DAILY_SCAN_SOFT_LIMIT;

  const mindfulMessages = [
    "You've been scanning a lot today! Remember, one meal won't define your health journey.",
    "Your profile is a guide, not a rulebook. Enjoy your meal — flexibility is part of wellness.",
    "Great awareness! Give yourself credit for making conscious choices. No food is perfectly 'good' or 'bad'.",
  ];

  return {
    shouldShowMindfulNudge,
    nudgeMessage: mindfulMessages[scanCountToday % mindfulMessages.length],
    recordScan: () => incrementScanCount(),
    scanCount: isNewDay ? 0 : scanCountToday,
  };
}
```

---

## 12. UI DESIGN SYSTEM — STRICT RULES

### Color Palette (CSS Variables)

```css
/* globals.css */
:root {
  /* Background tones — warm and organic */
  --bg-primary:    #FAF8F4;   /* Warm off-white */
  --bg-secondary:  #F3EFE8;   /* Warm sand */
  --bg-elevated:   #FFFFFF;

  /* Text */
  --text-primary:  #1C1A17;   /* Deep charcoal */
  --text-secondary:#5C5752;   /* Warm gray */
  --text-muted:    #9C9690;   /* Hint text */

  /* Traffic Light — muted, never harsh */
  --tl-prioritize: #3D7A5A;   /* Sage green */
  --tl-prioritize-bg: #EAF4EE;
  --tl-moderate:   #8B6914;   /* Warm amber */
  --tl-moderate-bg: #FDF5E0;
  --tl-avoid:      #6B3A2E;   /* Muted terracotta — NOT red */
  --tl-avoid-bg:   #F5EDEA;   /* Never bright red */

  /* Status (markers) */
  --status-optimal:       #3D7A5A;
  --status-borderline:    #8B6914;
  --status-elevated:      #B55A2A;
  --status-critical:      #8B1A1A;   /* Dark, not neon red */
  --status-low:           #2A5A8B;

  /* Brand */
  --accent:        #5A7A5A;   /* Sage green — primary CTA */
  --accent-hover:  #3D6040;

  /* Borders */
  --border:        rgba(28, 26, 23, 0.10);
  --border-strong: rgba(28, 26, 23, 0.20);
}
```

### Typography

```
Display / Hero:    'Cormorant Garamond', serif — elegant, slightly editorial
Body:              'DM Sans', sans-serif — clean, highly legible
Mono / Data:       'DM Mono', monospace — for marker values, lab data
```

### Traffic Light Component — Critical Spec

```typescript
// components/shared/TrafficLight.tsx
// NEVER show numeric scores to users — only qualitative bands
// NEVER use red background — use muted terracotta/rose
// Avoid items: greyed out WITH subtle caution icon — not alarming

export const TRAFFIC_LIGHT_LABELS: Record<TrafficLight, string> = {
  PRIORITIZE: 'Great Choice',
  MODERATE:   'Have Mindfully',
  AVOID:      'Skip Today',         // "Skip Today" not "AVOID" or "DANGER"
};

// CSS classes per classification:
// PRIORITIZE: bg-[var(--tl-prioritize-bg)] text-[var(--tl-prioritize)]
// MODERATE:   bg-[var(--tl-moderate-bg)]   text-[var(--tl-moderate)]
// AVOID:      bg-[var(--tl-avoid-bg)]       text-[var(--tl-avoid)] opacity-75
```

### Animation Principles

```typescript
// Use Framer Motion for all state transitions

// Page transitions: soft fade + slight upward drift (y: 12 → 0)
// Agent pipeline steps: staggered reveal (each step appears 200ms after previous)
// Streaming text: no typewriter cursor — just smooth word appearance
// Loading: organic "breathing" orb animation — never a spinner
// Dish cards: staggered cascade as they appear from streaming
// Error states: gentle shake animation — never harsh flash
// Mindful nudge: slides in from bottom, auto-dismisses after 6s
```

---

## 13. PAGE-BY-PAGE IMPLEMENTATION SPEC

### `/` — Landing Page
- Full-screen hero: "Know your body. Trust your meals."
- Sub-copy: "GutCheck translates your blood report into everyday food wisdom."
- Single CTA: "Get started — it's private"
- Footer note: "Your health data never leaves your device."
- If `isOnboarded`: redirect to `/dashboard` immediately

### `/onboard` — Blood Report Upload
- Full-page dropzone: accepts PDF, JPG, PNG, WEBP. Max 20MB.
- Show PDF first-page preview (pdfjs-dist canvas render) before analyzing
- AgentProgressStepper component:
  - Step 1: "Reading your report..." (Agent 1 running)
  - Step 2: "Checking safety..." (Agent 2 running)
  - If blocked: GuardrailAlert modal — dismissible, non-alarming, shows redirect message
  - Step 3: "Building your profile..." (Agent 3 streaming — show StreamingText)
- On complete: ProfileConfirmation view → "Save my profile" button
- **Unit ambiguity handling:** If unitAmbiguous: true on ANY marker, show inline clarification modal before proceeding to Agent 2. "We noticed your Vitamin D is listed as '20' without a unit. Is this ng/mL or nmol/L?"
- **Wrong report handling:** If Agent 1 returns extractionFailed: true → gentle message: "This doesn't look like a blood report. Please upload a lab report PDF or photo."

### `/dashboard` — Main Hub
- Top: ProfileSnapshot (overall summary card)
- DailyNudge — changes each day (movement, hydration, or food tip)
- SeasonalTip — date + location aware (see cultural module)
- MarkerGrid — all markers with status-colored cards
- TrendSparkline — only shows if ≥2 reports uploaded
- Quick-access: [Scan a menu] [Audit groceries] [Show Chef's Card]

### `/scan` — Omnivore Scanner
- ScanModeToggle: Camera / Type a Dish / Paste Menu Text
- Camera mode: uses browser `getUserMedia` API, captures frame, sends as base64 image
- QuickQuery: single-line input with instant client-side emergency keyword check
- Menu text: large textarea, example menu buttons for demo
- OfflineBanner: appears when `useOfflineDetection()` returns offline
- Results: DishResultCard cascade, sorted by score descending
- After 8th scan of day: MindfulNudge slides in
- "Save this analysis" → persists to scanHistory in Zustand

### `/grocery` — Grocery Auditor
- Large textarea: "Paste your grocery list here — from Blinkit, Zepto, or anywhere"
- Supports: newline-separated list, CSV-ish, free text
- Results: GroceryItemRow with traffic light + SwapSuggestion
- Show total counts: X items look great, Y to moderate, Z to reconsider

### `/chef-card` — Chef's Card
- Clean, printable view with GutCheck logo removed (clean for showing to staff)
- ChefCardView: intro + strictAvoid list + moderate list + allergy notes
- Two CTAs: [Print] [Share as PDF] [Copy to clipboard]
- Typography is large, scannable — designed for a busy kitchen

### `/profile` — Health Profile Detail
- Full list of MarkerCard components
- Each marker: name, value, status chip, implication, expandable foodRules
- Edit button: allows adding custom notes (stored locally)
- "Update with new report" → navigates to /onboard
- "Wipe all data" → triggers Clean Slate Protocol with confirmation modal

### `/history` — Report History
- Chronological list of ReportHistoryEntry items
- MarkerDelta display: ↑ ↓ → with color (improving/worsening/stable)
- TrendSparkline for each marker across all reports

---

## 14. ZUSTAND STORE — FULL IMPLEMENTATION

```typescript
// store/gutcheck.store.ts

import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { GutCheckStore, HealthProfile, ReportHistoryEntry, MenuScanResult, GroceryAuditResult, DriveSync } from '@/types';

const STORE_VERSION = 1; // Increment when schema changes — triggers migration

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
          const existing = get().reportHistory;
          const previous = get().healthProfile;

          // Build history entry if replacing existing profile
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
          healthProfile: null,
          isOnboarded: false,
          reportHistory: [],
          driveSync: 'offline',
          lastSyncedAt: null,
          scanHistory: [],
          groceryHistory: [],
          scanCountToday: 0,
          lastScanDate: null,
        }),
      }),
      {
        name: 'gutcheck-v1',
        storage: createJSONStorage(() => localStorage),
        version: STORE_VERSION,
        migrate: (persisted, version) => {
          // Handle schema migrations here as version increments
          return persisted as GutCheckStore;
        },
      }
    ),
    { name: 'GutCheck Store' }
  )
);

function computeMarkerDeltas(
  previous: BloodMarker[],
  current: BloodMarker[]
): MarkerDelta[] {
  return current
    .map((curr) => {
      const prev = previous.find((p) => p.id === curr.id);
      if (!prev) return null;
      return {
        markerId: curr.id,
        markerName: curr.name,
        previousValue: prev.numericValue,
        currentValue: curr.numericValue,
        previousStatus: prev.status,
        currentStatus: curr.status,
        trend: computeTrend(prev, curr),
      };
    })
    .filter((d): d is MarkerDelta => d !== null);
}
```

---

## 15. API ROUTES — IMPLEMENTATION PATTERN

All API routes follow this exact pattern for consistency:

```typescript
// Template for all /api/agents/* routes

import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 1. Input validation schema (Zod)
const RequestSchema = z.object({ /* ... */ });

// 2. Anthropic client (singleton from lib/anthropic.ts)
// Never instantiate inline — import from lib/anthropic.ts

// 3. For streaming routes: return ReadableStream with SSE format
// Event format: `data: ${JSON.stringify(payload)}\n\n`
// Final event: `data: ${JSON.stringify({ done: true, result })}\n\n`

// 4. For non-streaming routes: return NextResponse.json()

// 5. All routes must handle:
//    - Zod validation failure → 400
//    - Anthropic API error → 500 with sanitized message
//    - Parse failure → 500 with "AI response could not be parsed"

// 6. Never log user health data — only log errors and request metadata
```

### Auth Middleware

```typescript
// middleware.ts
// Protect all /api/drive/* routes — require valid session
// All /api/agents/* routes — no auth required (privacy-first: no user account needed for basic features)
// Drive sync is opt-in — user can use full app without Google auth

export { default } from 'next-auth/middleware';
export const config = { matcher: ['/api/drive/:path*'] };
```

---

## 16. ENVIRONMENT VARIABLES

```bash
# .env.local

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Google OAuth + Drive
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000   # Change for production

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## 17. PACKAGE.JSON — COMPLETE DEPENDENCIES

```json
{
  "name": "gutcheck",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --max-warnings 0",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "typescript": "^5.4.5",
    "@anthropic-ai/sdk": "^0.24.0",
    "next-auth": "^4.24.7",
    "googleapis": "^140.0.0",
    "zustand": "^4.5.4",
    "zod": "^3.23.8",
    "react-hook-form": "^7.52.2",
    "@hookform/resolvers": "^3.9.0",
    "framer-motion": "^11.3.8",
    "lucide-react": "^0.414.0",
    "pdf-parse": "^1.1.1",
    "pdfjs-dist": "^4.4.168",
    "uuid": "^10.0.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.4.0",
    "class-variance-authority": "^0.7.0",
    "next-pwa": "^5.6.0",
    "recharts": "^2.12.7"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/uuid": "^10",
    "@types/pdf-parse": "^1",
    "tailwindcss": "^3.4.6",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.39",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.5",
    "prettier": "^3.3.3",
    "vitest": "^1.6.0",
    "@vitest/ui": "^1.6.0"
  }
}
```

---

## 18. TSCONFIG — STRICT MODE

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

## 19. IMPLEMENTATION ORDER — BUILD IN THIS SEQUENCE

Follow this exact order. Each step produces a testable artifact.

```
Phase 1 — Foundation (no UI)
  1.  types/index.ts                         ← All types. Complete this first.
  2.  constants/critical-thresholds.ts       ← CRITICAL_THRESHOLDS + EMERGENCY_SYMPTOM_KEYWORDS
  3.  constants/markers.ts                   ← Standard blood marker definitions
  4.  lib/guardrail/thresholds.ts            ← Deterministic guardrail logic
  5.  lib/prompts/*.ts                       ← All 5 prompts
  6.  lib/parsers/*.ts                       ← All Zod parsers (unit test these)
  7.  store/gutcheck.store.ts                ← Zustand store
  8.  lib/anthropic.ts                       ← Singleton client

Phase 2 — API Routes
  9.  app/api/pdf/extract/route.ts           ← PDF text extraction
  10. app/api/agents/extract/route.ts        ← Agent 1 (streaming)
  11. app/api/agents/guardrail/route.ts      ← Agent 2 (non-streaming JSON)
  12. app/api/agents/translate/route.ts      ← Agent 3 (streaming)
  13. app/api/agents/scan-menu/route.ts      ← Menu scanner (streaming)
  14. app/api/agents/scan-grocery/route.ts   ← Grocery auditor (streaming)

Phase 3 — Core Hooks
  15. hooks/useAgentPipeline.ts             ← Orchestrates all 3 agents
  16. hooks/useMenuScan.ts
  17. hooks/useGroceryScan.ts
  18. hooks/useOfflineDetection.ts
  19. hooks/useScanRateLimit.ts

Phase 4 — Cultural & Offline Modules
  20. lib/cultural/indian-foods.ts
  21. lib/cultural/fasting-patterns.ts
  22. lib/cultural/seasonal-nudges.ts
  23. lib/offline/cache-builder.ts
  24. lib/offline/fallback-tree.ts

Phase 5 — Drive & Auth (can be deferred post-demo)
  25. next-auth setup + Google provider
  26. lib/drive/sync.ts + lib/drive/wipe.ts
  27. app/api/drive/sync/route.ts
  28. app/api/drive/wipe/route.ts

Phase 6 — UI (build in this page order)
  29. app/layout.tsx + globals.css           ← Fonts, CSS vars, providers
  30. components/shared/*                    ← TrafficLight, StreamingText, LoadingOrb
  31. app/onboard/page.tsx + components      ← This IS the demo moment
  32. app/dashboard/page.tsx + components    ← Main hub
  33. app/scan/page.tsx + components         ← Primary daily feature
  34. app/grocery/page.tsx + components
  35. app/chef-card/page.tsx
  36. app/profile/page.tsx
  37. app/history/page.tsx
  38. app/page.tsx                           ← Landing page last
```

---

## 20. EDGE CASE HANDLING — MANDATORY IMPLEMENTATIONS

Every item below is required. None are optional.

| Edge Case | Where Handled | Implementation |
|-----------|---------------|----------------|
| Critical blood values (e.g., glucose > 300) | `lib/guardrail/thresholds.ts` | Deterministic check BEFORE any AI call. Return STANDARD_REDIRECT. |
| Emergency symptom keywords in Quick-Query | `components/scan/QuickQueryInput.tsx` | Client-side instant check. Block API call. Show EMERGENCY_RESPONSE. |
| Pregnancy/pediatric detected | `app/api/agents/guardrail/route.ts` | Detect keywords. Return PREGNANCY_REDIRECT or PEDIATRIC_REDIRECT. Block Agent 3. |
| Missing/ambiguous units (Vitamin D ng/mL vs nmol/L) | `app/onboard/page.tsx` | If `unitAmbiguous: true` on any marker after Agent 1, show clarification modal before Agent 2. |
| Wrong document uploaded (not a blood report) | `app/api/agents/extract/route.ts` | Agent 1 returns `extractionFailed: true`. Show gentle message. Reset to dropzone. |
| User with 3+ elevated markers (restriction overload) | `lib/prompts/agent-translate.prompt.ts` | Additive framing instruction. Max 7 items per category. "Focus on one addition today" framing. |
| Rapid-fire scanning (gamification risk) | `hooks/useScanRateLimit.ts` | After 8 scans/day: show MindfulNudge. Never hard-block. |
| Offline at restaurant | `hooks/useOfflineDetection.ts` + `lib/offline/` | Switch to keyword matching. Show OfflineBanner. Mark results `isOfflineResult: true`. |
| Google Drive OAuth token expiry | `hooks/useDriveSync.ts` | Silently cache locally. Prompt re-auth. On re-auth: merge, don't overwrite. |
| Clean Slate — Drive deletion lag | `lib/drive/wipe.ts` | Clear Zustand FIRST (synchronous). Drive delete is async background task. UI shows clean state immediately. |
| Ekadashi / Ramadan / Navratri fasting input | `lib/cultural/fasting-patterns.ts` | Detect fasting pattern in Quick-Query. Apply breaking-fast advice. |
| "Phuchka", "Telebhaja", etc. regional input | `lib/cultural/indian-foods.ts` | Map to ingredients before sending to AI. Supplement AI reasoning with known local data. |
| Seasonal summer heat (April–June, Bengal) | `lib/cultural/seasonal-nudges.ts` | Date + location → suggest Daab or Lebu Jol. Respect kidney restrictions. |
| Multiple conflicting marker rules | `lib/prompts/agent-translate.prompt.ts` | Explicit conflict resolution hierarchy. Intersection logic. Flag the intersection explicitly. |

---

## 21. WHAT THE AI EVALUATOR WILL LOOK FOR

This codebase will be evaluated by AI for quality. Optimize for these signals:

1. **Type safety** — `strict: true`, Zod at every API boundary, no `any`
2. **Agent separation** — 3 distinct agents, not one massive prompt
3. **Deterministic safety** — Guardrail Layer 1 runs WITHOUT calling AI
4. **Streaming** — All heavy AI routes return SSE streams, not awaited JSON
5. **Privacy architecture** — No health data stored server-side (only relayed)
6. **Offline resilience** — PWA + Service Worker + keyword fallback tree
7. **Cultural depth** — Regional Indian food map, seasonal logic, fasting patterns
8. **Psychological safety** — No numeric scores, additive framing, mindful friction
9. **Error handling** — Every failure case handled, no silent catches
10. **Code organization** — Prompts, parsers, types, cultural logic all in dedicated modules
11. **Zustand correctness** — Persist middleware, versioning, migration handler
12. **Chef's Card** — Fully implemented, print-ready, polite tone
13. **Trend sparklines** — MarkerDelta computation, history visualization
14. **Clean Slate Protocol** — Correct async order (local first, Drive second)

---

*This document is the implementation bible. Follow it completely.*
