// lib/parsers/extract.parser.ts
// Zod schema for Agent 1 (extraction) output — safety net for AI responses

import { z } from 'zod';

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

const MarkerStatusSchema = z.enum([
  'OPTIMAL', 'BORDERLINE', 'ELEVATED', 'CRITICAL', 'LOW', 'CRITICALLY_LOW',
]);

const BloodMarkerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  value: z.string(),
  numericValue: z.number(),
  unit: z.string().nullable(),
  unitAmbiguous: z.boolean().default(false),
  reportedRange: z.string().nullable(),
  standardRange: z.string().default(''),
  status: MarkerStatusSchema.default('OPTIMAL'),
  implication: z.string().default(''),
  foodRules: MarkerFoodRulesSchema.default({ strictAvoid: [], moderate: [], prioritize: [] }),
  movementRules: MarkerMovementRulesSchema.default({ recommended: [], avoid: [], breathworkSuggestions: [] }),
  hydrationRules: z.array(z.string()).default([]),
});

export const ExtractedMarkersSchema = z.object({
  extractionFailed: z.boolean(),
  failureReason: z.string().nullable().optional(),
  reportDate: z.string().nullable(),
  labName: z.string().nullable(),
  unitAmbiguousMarkers: z.array(z.string()).default([]),
  markers: z.array(BloodMarkerSchema),
});

export type ExtractedMarkersOutput = z.infer<typeof ExtractedMarkersSchema>;

/**
 * Parse and validate Agent 1 output.
 * Throws if AI returned malformed JSON — caller returns 500.
 */
export function parseExtractedMarkers(raw: string): ExtractedMarkersOutput {
  const jsonMatch = raw.match(/\{[\s\S]+\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : raw;
  const parsed: unknown = JSON.parse(jsonStr);
  return ExtractedMarkersSchema.parse(parsed);
}
