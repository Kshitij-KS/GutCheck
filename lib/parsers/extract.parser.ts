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
 * Extract JSON from raw AI response using multiple strategies.
 */
function extractJson(raw: string): string {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch && fenceMatch[1]) return fenceMatch[1];

  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return raw.slice(firstBrace, lastBrace + 1);
  }

  return raw;
}

/**
 * Parse and validate Agent 1 output.
 * Throws if AI returned malformed JSON — caller returns 500.
 */
export function parseExtractedMarkers(raw: string): ExtractedMarkersOutput {
  const jsonStr = extractJson(raw);
  const parsed: unknown = JSON.parse(jsonStr);
  return ExtractedMarkersSchema.parse(parsed);
}
