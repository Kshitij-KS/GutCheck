// types/index.ts

export type MarkerStatus = 'OPTIMAL' | 'BORDERLINE' | 'ELEVATED' | 'CRITICAL' | 'LOW';

export type DishClassification = 'RECOMMENDED' | 'CAUTION' | 'AVOID';

export type MarkerImpact = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export interface BloodMarker {
  id: string;
  name: string;                        // "HbA1c"
  value: string;                       // "5.9%"
  unit: string;                        // "%"
  numericValue: number;                // 5.9
  normalRange: string;                 // "Below 5.7%"
  status: MarkerStatus;
  implication: string;                 // "Pre-diabetic range — reduced insulin sensitivity"
  foodRules: MarkerFoodRules;
}

export interface MarkerFoodRules {
  strictAvoid: string[];               // ["white rice", "maida", "sugary drinks"]
  moderate: string[];                  // ["fruit", "whole grain bread"]
  prioritize: string[];                // ["legumes", "leafy greens", "omega-3 fish"]
}

export interface HealthProfile {
  id: string;
  createdAt: string;
  updatedAt: string;
  reportDate?: string;
  markers: BloodMarker[];
  primaryConcerns: string[];           // ["Pre-diabetes", "High LDL"]
  overallSummary: string;
  consolidatedRules: ConsolidatedRules;
}

export interface ConsolidatedRules {
  strictAvoid: string[];
  moderate: string[];
  prioritize: string[];
  cuisineGuidance?: string;
}

// Lightweight version sent to Pass 2 — only non-OPTIMAL markers
export interface FilteredHealthContext {
  primaryConcerns: string[];
  elevatedMarkers: Array<{
    id: string;
    name: string;
    status: MarkerStatus;
    implication: string;
  }>;
  consolidatedRules: ConsolidatedRules;
}

// Output of Pass 1 — compressed dish list
export interface ExtractedDish {
  name: string;
  briefDescription: string;           // "Grilled fish marinated in spices, served with chutney"
}

export interface ExtractedMenu {
  cuisineType: string;
  dishes: ExtractedDish[];
}

export interface MarkerDishImpact {
  markerId: string;
  markerName: string;
  impact: MarkerImpact;
  reason: string;
}

export interface DishRecommendation {
  id: string;
  name: string;
  classification: DishClassification;
  score: number;                       // 0–100
  primaryReason: string;
  markerImpacts: MarkerDishImpact[];
  modification?: string | null;
  portionAdvice?: string | null;
}

export interface MenuAnalysisResult {
  id: string;
  analyzedAt: string;
  menuSource: string;
  totalDishesAnalyzed: number;
  recommendations: DishRecommendation[];
  topPick: string;
  worstPick: string;
  summary: string;
  cuisineType: string;
}

export interface GutCheckStore {
  healthProfile: HealthProfile | null;
  isOnboarded: boolean;
  analysisHistory: MenuAnalysisResult[];
  setHealthProfile: (profile: HealthProfile) => void;
  addAnalysisResult: (result: MenuAnalysisResult) => void;
  clearProfile: () => void;
}

// Security utility types
export interface InjectionCheckResult {
  isSafe: boolean;
  reason?: string;
}
