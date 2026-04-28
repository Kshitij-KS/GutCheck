// lib/parsers/translate.parser.ts
// Zod schema for Agent 3 (translate) output — validates full HealthProfile

import { z } from 'zod';

const MarkerStatusSchema = z.enum([
  'OPTIMAL', 'BORDERLINE', 'ELEVATED', 'CRITICAL', 'LOW', 'CRITICALLY_LOW',
]);

const SpecialPopulationSchema = z.enum(['pregnant', 'pediatric', 'none']);

const MarkerFoodRulesSchema = z.object({
  strictAvoid: z.array(z.string()),
  moderate: z.array(z.string()),
  prioritize: z.array(z.string()),
});

const MarkerMovementRulesSchema = z.object({
  recommended: z.array(z.string()),
  avoid: z.array(z.string()),
  breathworkSuggestions: z.array(z.string()),
});

const BloodMarkerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  value: z.string(),
  unit: z.string().nullable(),
  unitAmbiguous: z.boolean(),
  numericValue: z.number(),
  reportedRange: z.string().nullable(),
  standardRange: z.string(),
  status: MarkerStatusSchema,
  implication: z.string(),
  foodRules: MarkerFoodRulesSchema,
  movementRules: MarkerMovementRulesSchema,
  hydrationRules: z.array(z.string()),
});

const ConsolidatedRulesSchema = z.object({
  strictAvoid: z.array(z.string()),
  moderate: z.array(z.string()),
  prioritize: z.array(z.string()),
  hydrationGuidance: z.string(),
  movementGuidance: z.array(z.string()),
  cuisineGuidance: z.string(),
});

const ChefCardContentSchema = z.object({
  title: z.string(),
  intro: z.string(),
  strictAvoidList: z.array(z.string()),
  moderateList: z.array(z.string()),
  allergyNotes: z.string().nullable(),
  additionalNote: z.string().nullable(),
});

const OfflineFallbackTreeSchema = z.object({
  avoidKeywords: z.array(z.string()),
  moderateKeywords: z.array(z.string()),
  prioritizeKeywords: z.array(z.string()),
  lastBuiltAt: z.string(),
});

export const HealthProfileSchema = z.object({
  id: z.string(),
  schemaVersion: z.literal('1.0'),
  createdAt: z.string(),
  updatedAt: z.string(),
  reportDate: z.string().nullable(),
  reportLabName: z.string().nullable(),
  specialPopulation: SpecialPopulationSchema,
  markers: z.array(BloodMarkerSchema),
  primaryConcerns: z.array(z.string()),
  overallSummary: z.string(),
  consolidatedRules: ConsolidatedRulesSchema,
  chefCardContent: ChefCardContentSchema,
  offlineFallbackTree: OfflineFallbackTreeSchema,
});

export type HealthProfileOutput = z.infer<typeof HealthProfileSchema>;

/**
 * Parse and validate Agent 3 output.
 * Throws if AI returned malformed JSON — caller returns 500.
 */
export function parseHealthProfile(raw: string): HealthProfileOutput {
  const jsonMatch = raw.match(/\{[\s\S]+\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : raw;
  const parsed: unknown = JSON.parse(jsonStr);
  return HealthProfileSchema.parse(parsed);
}
