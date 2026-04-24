// app/api/analyze-menu/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getGeminiModel } from '@/lib/gemini';
import { detectPromptInjection, sanitizeInput, isResponseSafe } from '@/lib/security';
import {
  MENU_EXTRACT_SYSTEM_PROMPT,
  buildMenuExtractUserPrompt,
} from '@/lib/prompts/menu-extract.prompt';
import {
  MENU_ANALYSIS_SYSTEM_PROMPT,
  buildMenuAnalysisUserPrompt,
} from '@/lib/prompts/menu-analysis.prompt';
import { parseMenuExtractResponse } from '@/lib/parsers/menu-extract.parser';
import { parseMenuAnalysisResponse } from '@/lib/parsers/menu-analysis.parser';
import type { HealthProfile, FilteredHealthContext } from '@/types';

const HealthProfileSchema = z.object({
  id: z.string(),
  markers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    status: z.enum(['OPTIMAL', 'BORDERLINE', 'ELEVATED', 'CRITICAL', 'LOW']),
    implication: z.string(),
  })).min(1),
  primaryConcerns: z.array(z.string()),
  consolidatedRules: z.object({
    strictAvoid: z.array(z.string()),
    moderate: z.array(z.string()),
    prioritize: z.array(z.string()),
    cuisineGuidance: z.string().optional(),
  }),
});

const RequestSchema = z.object({
  menuText: z.string().min(20, 'Menu text too short').max(50000, 'Menu text too large'),
  healthProfile: HealthProfileSchema,
  menuSource: z.string().default('Scanned menu'),
});

/**
 * Builds a FilteredHealthContext from a full HealthProfile.
 * KEY OPTIMIZATION: Only non-OPTIMAL markers are sent to Pass 2.
 * This removes optimal markers from the prompt, cutting token count
 * significantly for users with mostly healthy blood panels.
 */
function buildFilteredContext(profile: HealthProfile): FilteredHealthContext {
  return {
    primaryConcerns: profile.primaryConcerns,
    elevatedMarkers: profile.markers
      .filter((m) => m.status !== 'OPTIMAL')
      .map((m) => ({
        id: m.id,
        name: m.name,
        status: m.status,
        implication: m.implication,
      })),
    consolidatedRules: profile.consolidatedRules,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as unknown;
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { menuText, healthProfile, menuSource } = parsed.data;

    // SECURITY: Sanitize + injection-check menu text before any LLM call
    const sanitizedMenu = sanitizeInput(menuText);
    const injectionCheck = detectPromptInjection(sanitizedMenu);
    if (!injectionCheck.isSafe) {
      return NextResponse.json(
        { error: 'Input validation failed', reason: injectionCheck.reason },
        { status: 422 }
      );
    }

    const model = getGeminiModel();

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const send = (data: object) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

        try {
          // ─── PASS 1: Extract and compress dish list ───────────────────────
          send({ status: 'extracting', message: 'Reading the menu...' });

          const extractResult = await model.generateContent({
            contents: [
              {
                role: 'user',
                parts: [{ text: buildMenuExtractUserPrompt(sanitizedMenu) }],
              },
            ],
            systemInstruction: { role: 'system', parts: [{ text: MENU_EXTRACT_SYSTEM_PROMPT }] },
          });

          const extractRaw = extractResult.response.text();

          if (!isResponseSafe(extractRaw)) {
            throw new Error('Menu extraction produced an unexpected response format');
          }

          const extractedMenu = parseMenuExtractResponse(extractRaw);

          send({
            status: 'analyzing',
            message: `Found ${extractedMenu.dishes.length} dishes — running clinical analysis...`,
            dishCount: extractedMenu.dishes.length,
          });

          // ─── PASS 2: Clinical scoring against filtered profile ────────────
          // Only non-OPTIMAL markers + consolidated rules are sent — not the full profile
          const filteredContext = buildFilteredContext(healthProfile as HealthProfile);
          const analysisPrompt = buildMenuAnalysisUserPrompt(extractedMenu, filteredContext);

          let fullAnalysisText = '';

          const analysisResult = await model.generateContentStream({
            contents: [{ role: 'user', parts: [{ text: analysisPrompt }] }],
            systemInstruction: { role: 'system', parts: [{ text: MENU_ANALYSIS_SYSTEM_PROMPT }] },
          });

          for await (const chunk of analysisResult.stream) {
            const text = chunk.text();
            fullAnalysisText += text;
            send({ chunk: text });
          }

          if (!isResponseSafe(fullAnalysisText)) {
            throw new Error('Menu analysis produced an unexpected response format');
          }

          const analysisData = parseMenuAnalysisResponse(
            fullAnalysisText,
            menuSource,
            extractedMenu.dishes.length
          );

          send({ done: true, result: analysisData });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Analysis failed';
          send({ error: message });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[analyze-menu]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
