// lib/parsers/scan.parser.ts
// Zod schema for menu scan results (Agent: scan-menu)

import { z } from 'zod';
import { extractJson } from '@/lib/utils';

const TrafficLightSchema = z.enum(['PRIORITIZE', 'MODERATE', 'AVOID']);

const DishScanResultSchema = z.object({
  dishName: z.string().min(1),
  classification: TrafficLightSchema,
  score: z.number().min(0).max(100).default(50),
  primaryReason: z.string().default(''),
  hiddenIngredients: z.array(z.string()).default([]),
  modification: z.string().nullable().default(null),
  isOfflineResult: z.boolean().default(false),
});

export const MenuScanResultSchema = z.object({
  dishes: z.array(DishScanResultSchema).default([]),
  scanSummary: z.string().default(''),
  bestChoices: z.array(z.string()).default([]),
  timestamp: z.string().default(() => new Date().toISOString()),
});

export type MenuScanResultOutput = z.infer<typeof MenuScanResultSchema>;


/**
 * Parse and validate menu scan result.
 * Throws if AI returned malformed JSON — caller returns 500.
 */
export function parseMenuScanResult(raw: string): MenuScanResultOutput {
  const jsonStr = extractJson(raw);
  const parsed: unknown = JSON.parse(jsonStr);
  return MenuScanResultSchema.parse(parsed);
}