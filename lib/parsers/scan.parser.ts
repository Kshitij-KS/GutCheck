// lib/parsers/scan.parser.ts
// Zod schema for menu scan results (Agent: scan-menu)

import { z } from 'zod';

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
 * Parse and validate menu scan result.
 * Throws if AI returned malformed JSON — caller returns 500.
 */
export function parseMenuScanResult(raw: string): MenuScanResultOutput {
  const jsonStr = extractJson(raw);
  const parsed: unknown = JSON.parse(jsonStr);
  return MenuScanResultSchema.parse(parsed);
}
