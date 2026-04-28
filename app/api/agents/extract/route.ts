// app/api/agents/extract/route.ts
// Agent 1: Blood marker extraction via Gemini
// Streaming SSE — event format: data: ${JSON.stringify(payload)}\n\n
// Final event: data: ${JSON.stringify({ done: true, result })}\n\n

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAgentModel } from '@/lib/gemini';
import { EXTRACT_SYSTEM_PROMPT } from '@/lib/prompts/agent-extract.prompt';
import { parseExtractedMarkers } from '@/lib/parsers/extract.parser';

const RequestSchema = z.object({
  text: z.string().optional().default(''),
  base64: z.string().optional(),
  mimeType: z.string().optional(),
  source: z.enum(['pdf', 'image']).default('pdf'),
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
          emit({ error: 'Invalid request', details: parsed.error.flatten() });
          controller.close();
          return;
        }

        const { text, base64, mimeType, source } = parsed.data;

        emit({ status: 'extracting', message: 'Reading your report...' });

        const model = getAgentModel();

        let result;

        if (source === 'image' && base64 && mimeType) {
          // Vision mode for images
          const promptForImage = EXTRACT_SYSTEM_PROMPT.replace('from the provided text', 'from the provided lab report image');
          const response = await model.generateContent([
            { text: promptForImage + '\n\nExtract all blood markers from this lab report image.' },
            { inlineData: { data: base64, mimeType } },
          ]);
          const rawText = response.response.text();
          result = parseExtractedMarkers(rawText);
        } else {
          // Text mode for PDFs
          const userPrompt = `Extract all blood markers from this lab report text:\n\n${text}`;
          const response = await model.generateContent([
            { text: EXTRACT_SYSTEM_PROMPT },
            { text: userPrompt },
          ]);
          const rawText = response.response.text();
          result = parseExtractedMarkers(rawText);
        }

        emit({ done: true, result });
      } catch (err) {
        console.error('[Agent 1 Extract Error]', err);
        const message = (err as Error).message ?? 'Unknown error';
        if (message.includes('JSON') || message.includes('parse') || message.includes('ZodError')) {
          emit({ error: 'AI response could not be parsed', done: true });
        } else {
          emit({ error: 'Extraction failed. Please try again.', done: true });
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
