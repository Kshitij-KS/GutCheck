// types/index.ts — ALL types defined here. Never define types inline anywhere.

// ─── Core Enums ──────────────────────────────────────────────────────────────

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

// ─── Blood Markers ────────────────────────────────────────────────────────────

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

// ─── Health Profile ───────────────────────────────────────────────────────────

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

// ─── Chef's Card ──────────────────────────────────────────────────────────────

export interface ChefCardContent {
  title: string;
  intro: string;
  strictAvoidList: string[];
  moderateList: string[];
  allergyNotes: string | null;
  additionalNote: string | null;
}

// ─── Offline Fallback ─────────────────────────────────────────────────────────

export interface OfflineFallbackTree {
  avoidKeywords: string[];
  moderateKeywords: string[];
  prioritizeKeywords: string[];
  lastBuiltAt: string;
}

// ─── Report History ───────────────────────────────────────────────────────────

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

// ─── Guardrail ────────────────────────────────────────────────────────────────

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

// ─── Scan Results ─────────────────────────────────────────────────────────────

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

// ─── Grocery Audit ────────────────────────────────────────────────────────────

export interface GroceryItem {
  name: string;
  classification: TrafficLight;
  reason: string;
  hiddenIngredients: string[];
  /** Short plain-text swap suggestion, e.g. "Replace with cold-pressed mustard oil" */
  swap: string | null;
}

export interface GroceryAuditResult {
  items: GroceryItem[];
  overallGuidance: string;
  summary: string;
  greatCount: number;
  moderateCount: number;
  reconsiderCount: number;
  timestamp: string;
}

// ─── Zustand Store Shape ──────────────────────────────────────────────────────

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
  addScanResult: (result: MenuScanResult) => void;
  addGroceryResult: (result: GroceryAuditResult) => void;
  incrementScanCount: () => void;
  setDriveSync: (status: DriveSync) => void;
  clearAll: () => void;
}

// ─── User Context ─────────────────────────────────────────────────────────────

export interface UserContext {
  location?: string;
  dietaryPreferences?: string[];
  age?: number;
}

// ─── Cultural Types ───────────────────────────────────────────────────────────

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

// ─── Agent Pipeline ───────────────────────────────────────────────────────────

export interface ExtractedMarkers {
  markers: BloodMarker[];
  reportDate: string | null;
  labName: string | null;
  extractionFailed: boolean;
  unitAmbiguousMarkers: string[];
}

export interface DriveSyncPayload {
  profile: HealthProfile | null;
  history: ReportHistoryEntry[];
  syncedAt: string;
}

// ─── Security ─────────────────────────────────────────────────────────────────

export interface InjectionCheckResult {
  isSafe: boolean;
  reason?: string;
}
