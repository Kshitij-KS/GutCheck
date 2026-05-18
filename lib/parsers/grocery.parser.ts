// lib/parsers/grocery.parser.ts
// Zod schema for grocery audit results (Agent: scan-grocery)

import { z } from 'zod';
import type { GroceryAuditResult } from '@/types';

const TrafficLightSchema = z.enum(['PRIORITIZE', 'MODERATE', 'AVOID']);

const GroceryItemSchema = z.object({
  name: z.string().min(1),
  classification: TrafficLightSchema,
  reason: z.string().default(''),
  hiddenIngredients: z.array(z.string()).default([]),
  // Supports both object form {suggestion, whereToFind, reason} and plain string form
  swap: z.union([
    z.string().nullable(),
    z.object({
      suggestion: z.string().default(''),
      whereToFind: z.string().optional().default(''),
      reason: z.string().optional().default(''),
    }).nullable(),
  ]).transform((s) => {
    if (!s) return null;
    if (typeof s === 'string') return s;
    return s.suggestion ?? null;
  }).nullable().default(null),
});

export const GroceryAuditResultSchema = z.object({
  items: z.array(GroceryItemSchema).default([]),
  overallGuidance: z.string().optional().default(''),
  summary: z.string().default(''),
  greatCount: z.number().int().min(0).default(0),
  moderateCount: z.number().int().min(0).default(0),
  reconsiderCount: z.number().int().min(0).default(0),
  avoidCount: z.number().int().min(0).default(0),
  prioritizeCount: z.number().int().min(0).default(0),
  timestamp: z.string().default(() => new Date().toISOString()),
});

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
 * Parse and validate grocery audit result.
 * Throws if AI returned malformed JSON — caller returns 500.
 */
export function parseGroceryAuditResult(raw: string): GroceryAuditResult {
  const jsonStr = extractJson(raw);
  const parsed: unknown = JSON.parse(jsonStr);
  return GroceryAuditResultSchema.parse(parsed) as GroceryAuditResult;
}
