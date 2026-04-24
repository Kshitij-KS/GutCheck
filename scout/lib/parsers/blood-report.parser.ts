// lib/parsers/blood-report.parser.ts

import { z } from 'zod';
import type { HealthProfile } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const MarkerFoodRulesSchema = z.object({
  strictAvoid: z.array(z.string()),
  moderate: z.array(z.string()),
  prioritize: z.array(z.string()),
});

const BloodMarkerSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  value: z.string().min(1),
  unit: z.string(),
  numericValue: z.number(),
  normalRange: z.string(),
  status: z.enum(['OPTIMAL', 'BORDERLINE', 'ELEVATED', 'CRITICAL', 'LOW']),
  implication: z.string().min(1),
  foodRules: MarkerFoodRulesSchema,
});

const BloodReportResponseSchema = z.object({
  reportDate: z.string().nullable().optional(),
  markers: z.array(BloodMarkerSchema).min(1),
  primaryConcerns: z.array(z.string()).min(1),
  overallSummary: z.string().min(1),
  consolidatedRules: z.object({
    strictAvoid: z.array(z.string()),
    moderate: z.array(z.string()),
    prioritize: z.array(z.string()),
    cuisineGuidance: z.string().optional(),
  }),
});

export function parseBloodReportResponse(rawText: string): HealthProfile {
  const cleaned = rawText
    .replace(/^```json\s*/m, '')
    .replace(/^```\s*/m, '')
    .replace(/\s*```$/m, '')
    .trim();

  const json: unknown = JSON.parse(cleaned);

  // Check for model-returned error object
  if (
    typeof json === 'object' &&
    json !== null &&
    'error' in json
  ) {
    const errObj = json as { error: string; reason?: string };
    throw new Error(errObj.reason ?? errObj.error);
  }

  const validated = BloodReportResponseSchema.parse(json);

  return {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reportDate: validated.reportDate ?? undefined,
    markers: validated.markers,
    primaryConcerns: validated.primaryConcerns,
    overallSummary: validated.overallSummary,
    consolidatedRules: validated.consolidatedRules,
  };
}
