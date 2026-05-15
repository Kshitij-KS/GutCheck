// app/api/agents/extract/route.ts
// Agent 1: Blood marker extraction via Gemini
// Streaming SSE — event format: data: ${JSON.stringify(payload)}\n\n
// Final event: data: ${JSON.stringify({ done: true, result })}\n\n

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAgentModel } from '@/lib/gemini';
import { EXTRACT_SYSTEM_PROMPT } from '@/lib/prompts/agent-extract.prompt';
import { parseExtractedMarkers } from '@/lib/parsers/extract.parser';
import {
  API_INPUT_LIMITS,
  detectPromptInjection,
  isResponseSafe,
  sanitizeInput,
} from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';

const RequestSchema = z.object({
  text: z.string().max(API_INPUT_LIMITS.extractText).optional().default(''),
  base64: z.string().max(API_INPUT_LIMITS.base64Chars).optional(),
  mimeType: z.string().max(128).optional(),
  source: z.enum(['pdf', 'image']).default('pdf'),
});

export async function POST(req: NextRequest): Promise<Response> {
  const limited = await checkRateLimit(req, 'agents', 'extract');
  if (limited) return limited;

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
          emit({ error: 'Invalid request', details: parsed.error.flatten(), done: true });
          return;
        }

        let { text, base64, mimeType, source } = parsed.data;
        text = sanitizeInput(text);

        if (source === 'image' && base64 && mimeType) {
          // vision — skip text injection path
        } else {
          const inj = detectPromptInjection(text);
          if (!inj.isSafe) {
            emit({
              error:
                inj.reason ??
                'Input contains content that appears to override AI instructions. Paste only lab report text.',
              done: true,
            });
            return;
          }
        }

        emit({ status: 'extracting', message: 'Reading your report...' });

        const model = getAgentModel();

        let result;

        if (source === 'image' && base64 && mimeType) {
          const promptForImage = EXTRACT_SYSTEM_PROMPT.replace(
            'from the provided text',
            'from the provided lab report image'
          );
          const response = await model.generateContent([
            { text: promptForImage + '\n\nExtract all blood markers from this lab report image.' },
            { inlineData: { data: base64, mimeType } },
          ]);
          const rawText = response.response.text();
          if (!isResponseSafe(rawText)) {
            emit({ error: 'AI response could not be parsed', done: true });
            return;
          }
          result = parseExtractedMarkers(rawText);
        } else {
          const userPrompt = `Extract all blood markers from this lab report text:\n\n${text}`;
          const response = await model.generateContent([
            { text: EXTRACT_SYSTEM_PROMPT },
            { text: userPrompt },
          ]);
          const rawText = response.response.text();
          if (!isResponseSafe(rawText)) {
            emit({ error: 'AI response could not be parsed', done: true });
            return;
          }
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
