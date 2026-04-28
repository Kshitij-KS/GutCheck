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

const RequestSchema = z.object({
  markersJson: z.string().min(2),
  reportText: z.string().default(''),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { markersJson, reportText } = parsed.data;

    const model = getAgentModel();
    const userPrompt = `Review these extracted blood markers for special population signals.\n\nMARKERS: ${markersJson}\n\nREPORT TEXT CONTEXT: ${reportText.slice(0, 500)}`;

    const response = await model.generateContent([
      { text: GUARDRAIL_SYSTEM_PROMPT },
      { text: userPrompt },
    ]);

    const rawText = response.response.text();
    const jsonMatch = rawText.match(/\{[\s\S]+\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : rawText;
    const aiResult: unknown = JSON.parse(jsonStr);

    // Validate and map AI response
    const guardrailResult = aiResult as {
      passed: boolean;
      flags: string[];
      specialPopulationDetected: string;
      redirectMessage: string | null;
    };

    const population = (guardrailResult.specialPopulationDetected as SpecialPopulation) ?? 'none';
    let redirectMessage = guardrailResult.redirectMessage;

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
    if (message.includes('JSON') || message.includes('parse')) {
      return NextResponse.json({ error: 'AI response could not be parsed' }, { status: 500 });
    }
    console.error('[guardrail] Error:', message);
    return NextResponse.json({ error: 'Guardrail check failed' }, { status: 500 });
  }
}
