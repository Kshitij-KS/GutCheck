// lib/parsers/menu-analysis.parser.ts

import { z } from 'zod';
import type { MenuAnalysisResult } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const MarkerDishImpactSchema = z.object({
  markerId: z.string(),
  markerName: z.string(),
  impact: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']),
  reason: z.string().min(1),
});

const DishRecommendationSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  classification: z.enum(['RECOMMENDED', 'CAUTION', 'AVOID']),
  score: z.number().int().min(0).max(100),
  primaryReason: z.string().min(1),
  markerImpacts: z.array(MarkerDishImpactSchema),
  modification: z.string().nullable().optional(),
  portionAdvice: z.string().nullable().optional(),
});

const MenuAnalysisResponseSchema = z.object({
  cuisineType: z.string(),
  totalDishesAnalyzed: z.number().int().min(0),
  recommendations: z.array(DishRecommendationSchema).min(1),
  topPick: z.string(),
  worstPick: z.string(),
  summary: z.string().min(1),
});

export function parseMenuAnalysisResponse(
  rawText: string,
  menuSource: string,
  dishCount: number
): MenuAnalysisResult {
  const cleaned = rawText
    .replace(/^```json\s*/m, '')
    .replace(/^```\s*/m, '')
    .replace(/\s*```$/m, '')
    .trim();

  const json: unknown = JSON.parse(cleaned);

  if (typeof json === 'object' && json !== null && 'error' in json) {
    const errObj = json as { error: string; reason?: string };
    throw new Error(errObj.reason ?? errObj.error);
  }

  const validated = MenuAnalysisResponseSchema.parse(json);

  return {
    id: uuidv4(),
    analyzedAt: new Date().toISOString(),
    menuSource,
    totalDishesAnalyzed: validated.totalDishesAnalyzed || dishCount,
    recommendations: validated.recommendations,
    topPick: validated.topPick,
    worstPick: validated.worstPick,
    summary: validated.summary,
    cuisineType: validated.cuisineType,
  };
}
