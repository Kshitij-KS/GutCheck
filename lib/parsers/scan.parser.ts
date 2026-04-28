// lib/parsers/scan.parser.ts
// Zod schema for menu scan results (Agent: scan-menu)

import { z } from 'zod';

const TrafficLightSchema = z.enum(['PRIORITIZE', 'MODERATE', 'AVOID']);

const DishScanResultSchema = z.object({
  dishName: z.string().min(1),
  classification: TrafficLightSchema,
  score: z.number().min(0).max(100),
  primaryReason: z.string(),
  hiddenIngredients: z.array(z.string()).default([]),
  modification: z.string().nullable(),
  isOfflineResult: z.boolean().default(false),
});

export const MenuScanResultSchema = z.object({
  dishes: z.array(DishScanResultSchema),
  scanSummary: z.string(),
  bestChoices: z.array(z.string()),
  timestamp: z.string(),
});

export type MenuScanResultOutput = z.infer<typeof MenuScanResultSchema>;

/**
 * Parse and validate menu scan result.
 * Throws if AI returned malformed JSON — caller returns 500.
 */
export function parseMenuScanResult(raw: string): MenuScanResultOutput {
  const jsonMatch = raw.match(/\{[\s\S]+\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : raw;
  const parsed: unknown = JSON.parse(jsonStr);
  return MenuScanResultSchema.parse(parsed);
}
