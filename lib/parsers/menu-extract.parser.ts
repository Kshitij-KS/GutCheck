// lib/parsers/menu-extract.parser.ts

import { z } from 'zod';
import type { ExtractedMenu } from '@/types';

const ExtractedMenuSchema = z.object({
  cuisineType: z.string().min(1),
  dishes: z.array(
    z.object({
      name: z.string().min(1),
      briefDescription: z.string().min(1),
    })
  ).min(1),
});

export function parseMenuExtractResponse(rawText: string): ExtractedMenu {
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

  return ExtractedMenuSchema.parse(json);
}
