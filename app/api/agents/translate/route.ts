// app/api/agents/translate/route.ts
// Agent 3: Full HealthProfile translation via Gemini (streaming SSE)

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getStreamingModel } from '@/lib/gemini';
import { TRANSLATE_SYSTEM_PROMPT, buildTranslateUserPrompt } from '@/lib/prompts/agent-translate.prompt';
import { parseHealthProfile } from '@/lib/parsers/translate.parser';
import { buildOfflineFallbackTree } from '@/lib/offline/cache-builder';
import { generateId } from '@/lib/utils';

const RequestSchema = z.object({
  markersJson: z.string().min(2),
  reportText: z.string().default(''),
  userContext: z.object({
    location: z.string().optional(),
    age: z.number().optional(),
  }).optional(),
});

export async function POST(req: NextRequest): Promise<Response> {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function emit(payload: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      }

      try {
        const body: unknown = await req.json();
        const parsed = RequestSchema.safeParse(body);

        if (!parsed.success) {
          emit({ error: 'Invalid request', done: true });
          controller.close();
          return;
        }

        const { markersJson, reportText, userContext } = parsed.data;

        emit({ status: 'translating', message: 'Building your personalized profile...' });

        const userPrompt = buildTranslateUserPrompt(markersJson, reportText, userContext);
        const model = getStreamingModel();

        const streamResult = await model.generateContentStream([
          { text: TRANSLATE_SYSTEM_PROMPT },
          { text: userPrompt },
        ]);

        let fullText = '';
        for await (const chunk of streamResult.stream) {
          const chunkText = chunk.text();
          fullText += chunkText;
          emit({ chunk: chunkText });
        }

        // Parse and validate the complete response
        const profile = parseHealthProfile(fullText);

        // Ensure required fields
        if (!profile.id) (profile as Record<string, unknown>).id = generateId();
        if (!profile.createdAt) (profile as Record<string, unknown>).createdAt = new Date().toISOString();
        if (!profile.updatedAt) (profile as Record<string, unknown>).updatedAt = new Date().toISOString();

        // Build offline fallback tree from the profile
        profile.offlineFallbackTree = buildOfflineFallbackTree(profile);

        emit({ done: true, result: profile });
      } catch (err) {
        const message = (err as Error).message ?? '';
        if (message.includes('JSON') || message.includes('parse') || message.includes('ZodError')) {
          emit({ error: 'AI response could not be parsed', done: true });
        } else {
          emit({ error: 'Profile translation failed. Please try again.', done: true });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
