// lib/parsers/grocery.parser.ts
// Zod schema for grocery audit results (Agent: scan-grocery)

import { z } from 'zod';
import type { GroceryAuditResult } from '@/types';

const TrafficLightSchema = z.enum(['PRIORITIZE', 'MODERATE', 'AVOID']);

const GroceryItemSchema = z.object({
  name: z.string().min(1),
  classification: TrafficLightSchema,
  reason: z.string(),
  hiddenIngredients: z.array(z.string()).default([]),
  // Supports both old {suggestion, whereToFind, reason} object form and new string form
  swap: z.union([
    z.string().nullable(),
    z.object({ suggestion: z.string(), whereToFind: z.string().optional(), reason: z.string().optional() }).nullable(),
  ]).transform((s) => {
    if (!s) return null;
    if (typeof s === 'string') return s;
    return s.suggestion ?? null;
  }),
});

export const GroceryAuditResultSchema = z.object({
  items: z.array(GroceryItemSchema),
  overallGuidance: z.string().optional().default(''),
  summary: z.string().default(''),
  greatCount: z.number().int().min(0).default(0),
  moderateCount: z.number().int().min(0).default(0),
  reconsiderCount: z.number().int().min(0).default(0),
  timestamp: z.string().default(() => new Date().toISOString()),
});

/**
 * Parse and validate grocery audit result.
 * Throws if AI returned malformed JSON — caller returns 500.
 */
export function parseGroceryAuditResult(raw: string): GroceryAuditResult {
  // Extract JSON from raw text (handles markdown fences)
  const jsonMatch = raw.match(/\{[\s\S]+\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : raw;
  const parsed: unknown = JSON.parse(jsonStr);
  return GroceryAuditResultSchema.parse(parsed) as GroceryAuditResult;
}
