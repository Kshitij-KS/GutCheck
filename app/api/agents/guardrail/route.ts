// app/api/agents/guardrail/route.ts
// Agent 2: Clinical safety reviewer (AI layer)
// Non-streaming — fast response, returns JSON directly
// Called AFTER deterministic guardrail passes

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAgentModel } from '@/lib/gemini';
import { GUARDRAIL_SYSTEM_PROMPT } from '@/lib/prompts/agent-guardrail.prompt';
import type { GuardrailResult, SpecialPopulation } from '@/types';
import { PREGNANCY_REDIRECT, PEDIATRIC_REDIRECT } from '@/constants/critical-thresholds';
import { API_INPUT_LIMITS, detectPromptInjection, isResponseSafe, sanitizeInput } from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';

const RequestSchema = z.object({
  markersJson: z.string().min(2).max(API_INPUT_LIMITS.markersJson),
  reportText: z.string().max(API_INPUT_LIMITS.reportText).default(''),
});

function normalizeSpecialPopulation(value: string | undefined): SpecialPopulation {
  const t = (value ?? 'none').toLowerCase().trim();
  if (t === 'pregnant') return 'pregnant';
  if (t === 'pediatric') return 'pediatric';
  return 'none';
}

const GuardrailAiResponseSchema = z.object({
  passed: z.boolean(),
  flags: z.array(z.string()).optional().default([]),
  specialPopulationDetected: z.string().optional().default('none'),
  redirectMessage: z.string().nullable().optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const limited = await checkRateLimit(req, 'agents', 'guardrail');
  if (limited) return limited;

  try {
    const body: unknown = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { markersJson, reportText: rawReport } = parsed.data;
    const markersJsonClean = sanitizeInput(markersJson);
    const reportText = sanitizeInput(rawReport);

    const inj = detectPromptInjection(reportText);
    if (!inj.isSafe) {
      return NextResponse.json({ error: inj.reason ?? 'Report text was rejected for safety.' }, { status: 400 });
    }

    const model = getAgentModel();
    const userPrompt = `Review these extracted blood markers for special population signals.\n\nMARKERS: ${markersJsonClean}\n\nREPORT TEXT CONTEXT: ${reportText.slice(0, 500)}`;

    const response = await model.generateContent([
      { text: GUARDRAIL_SYSTEM_PROMPT },
      { text: userPrompt },
    ]);

    const rawText = response.response.text();
    if (!isResponseSafe(rawText)) {
      return NextResponse.json({ error: 'AI response could not be parsed' }, { status: 500 });
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : rawText.trim();
    let unknownJson: unknown;
    try {
      unknownJson = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ error: 'AI response could not be parsed' }, { status: 500 });
    }

    const aiParsed = GuardrailAiResponseSchema.safeParse(unknownJson);
    if (!aiParsed.success) {
      return NextResponse.json({ error: 'AI response could not be parsed' }, { status: 500 });
    }

    const guardrailResult = aiParsed.data;
    const population = normalizeSpecialPopulation(guardrailResult.specialPopulationDetected);
    let redirectMessage = guardrailResult.redirectMessage ?? null;

    if (!guardrailResult.passed && !redirectMessage) {
      if (population === 'pregnant') redirectMessage = PREGNANCY_REDIRECT;
      else if (population === 'pediatric') redirectMessage = PEDIATRIC_REDIRECT;
    }

    const result: GuardrailResult = {
      passed: guardrailResult.passed,
      criticalMarkers: [],
      emergencySymptomDetected: false,
      specialPopulationDetected: population,
      redirectMessage,
    };

    return NextResponse.json(result);
  } catch (err) {
    const message = (err as Error).message ?? '';
    if (message.includes('JSON') || message.includes('parse') || message.includes('ZodError')) {
      return NextResponse.json({ error: 'AI response could not be parsed' }, { status: 500 });
    }
    console.error('[guardrail] Error:', message);
    return NextResponse.json({ error: 'Guardrail check failed' }, { status: 500 });
  }
}
