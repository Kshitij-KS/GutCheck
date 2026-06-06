// lib/parsers/translate.parser.ts
// Zod schema for Agent 3 (translate) output — validates full HealthProfile

import { z } from 'zod';
import { extractJson } from '@/lib/utils';

const MarkerStatusSchema = z.enum([
  'OPTIMAL', 'BORDERLINE', 'ELEVATED', 'CRITICAL', 'LOW', 'CRITICALLY_LOW',
]);

const SpecialPopulationSchema = z.enum(['pregnant', 'pediatric', 'none']);

const MarkerFoodRulesSchema = z.object({
  strictAvoid: z.array(z.string()).default([]),
  moderate: z.array(z.string()).default([]),
  prioritize: z.array(z.string()).default([]),
});

const MarkerMovementRulesSchema = z.object({
  recommended: z.array(z.string()).default([]),
  avoid: z.array(z.string()).default([]),
  breathworkSuggestions: z.array(z.string()).default([]),
});

const BloodMarkerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  value: z.string().default(''),
  unit: z.string().nullable().default(null),
  unitAmbiguous: z.boolean().default(false),
  numericValue: z.number().default(0),
  reportedRange: z.string().nullable().default(null),
  standardRange: z.string().default(''),
  status: MarkerStatusSchema.default('OPTIMAL'),
  implication: z.string().default(''),
  foodRules: MarkerFoodRulesSchema.default({ strictAvoid: [], moderate: [], prioritize: [] }),
  movementRules: MarkerMovementRulesSchema.default({ recommended: [], avoid: [], breathworkSuggestions: [] }),
  hydrationRules: z.array(z.string()).default([]),
});

const ConsolidatedRulesSchema = z.object({
  strictAvoid: z.array(z.string()).default([]),
  moderate: z.array(z.string()).default([]),
  prioritize: z.array(z.string()).default([]),
  hydrationGuidance: z.string().default(''),
  movementGuidance: z.array(z.string()).default([]),
  cuisineGuidance: z.string().default(''),
});

const ChefCardContentSchema = z.object({
  title: z.string().default('My Dietary Requirements'),
  intro: z.string().default(''),
  strictAvoidList: z.array(z.string()).default([]),
  moderateList: z.array(z.string()).default([]),
  allergyNotes: z.string().nullable().default(null),
  additionalNote: z.string().nullable().default(null),
});

const OfflineFallbackTreeSchema = z.object({
  avoidKeywords: z.array(z.string()).default([]),
  moderateKeywords: z.array(z.string()).default([]),
  prioritizeKeywords: z.array(z.string()).default([]),
  lastBuiltAt: z.string().default(() => new Date().toISOString()),
});

export const HealthProfileSchema = z.object({
  id: z.string().default(''),
  schemaVersion: z.literal('1.0').default('1.0'),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
  reportDate: z.string().nullable().default(null),
  reportLabName: z.string().nullable().default(null),
  specialPopulation: SpecialPopulationSchema.default('none'),
  markers: z.array(BloodMarkerSchema).default([]),
  primaryConcerns: z.array(z.string()).default([]),
  overallSummary: z.string().default(''),
  consolidatedRules: ConsolidatedRulesSchema.default({
    strictAvoid: [],
    moderate: [],
    prioritize: [],
    hydrationGuidance: '',
    movementGuidance: [],
    cuisineGuidance: '',
  }),
  chefCardContent: ChefCardContentSchema.default({
    title: 'My Dietary Requirements',
    intro: '',
    strictAvoidList: [],
    moderateList: [],
    allergyNotes: null,
    additionalNote: null,
  }),
  offlineFallbackTree: OfflineFallbackTreeSchema.default({
    avoidKeywords: [],
    moderateKeywords: [],
    prioritizeKeywords: [],
    lastBuiltAt: new Date().toISOString(),
  }),
});

export type HealthProfileOutput = z.infer<typeof HealthProfileSchema>;


/**
 * Parse and validate Agent 3 output.
 * Throws if AI returned malformed JSON — caller returns 500.
 */
export function parseHealthProfile(raw: string): HealthProfileOutput {
  const jsonStr = extractJson(raw);
  const parsed: unknown = JSON.parse(jsonStr);
  return HealthProfileSchema.parse(parsed);
}