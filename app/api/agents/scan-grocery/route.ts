// app/api/agents/scan-grocery/route.ts
// Grocery auditor via Gemini (streaming SSE)

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getStreamingModel } from '@/lib/gemini';
import { GROCERY_SYSTEM_PROMPT, buildGroceryScanUserPrompt } from '@/lib/prompts/scan-grocery.prompt';
import { parseGroceryAuditResult } from '@/lib/parsers/grocery.parser';
import {
  API_INPUT_LIMITS,
  detectPromptInjection,
  isResponseSafe,
  sanitizeInput,
} from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';

const RequestSchema = z.object({
  groceryList: z.string().min(3, 'Grocery list cannot be empty').max(API_INPUT_LIMITS.groceryList),
  profileJson: z.string().min(2).max(API_INPUT_LIMITS.profileJson),
});

export async function POST(req: NextRequest): Promise<Response> {
  const limited = await checkRateLimit(req, 'agents', 'scan-grocery');
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
          emit({ error: parsed.error.issues[0]?.message ?? 'Invalid request', done: true });
          return;
        }

        let { groceryList, profileJson } = parsed.data;
        groceryList = sanitizeInput(groceryList);
        profileJson = sanitizeInput(profileJson);

        const inj = detectPromptInjection(groceryList);
        if (!inj.isSafe) {
          emit({
            error:
              inj.reason ??
              'Input contains content that appears to override AI instructions. Paste only your grocery list.',
            done: true,
          });
          return;
        }

        emit({ status: 'auditing', message: 'Auditing your grocery list...' });

        const model = getStreamingModel(true); // Flash for speed
        const userPrompt = buildGroceryScanUserPrompt(groceryList, profileJson);

        const streamResult = await model.generateContentStream([
          { text: GROCERY_SYSTEM_PROMPT },
          { text: userPrompt },
        ]);

        let fullText = '';
        for await (const chunk of streamResult.stream) {
          const chunkText = chunk.text();
          fullText += chunkText;
          emit({ chunk: chunkText });
        }

        if (!isResponseSafe(fullText)) {
          emit({ error: 'AI response could not be parsed', done: true });
          return;
        }
        const result = parseGroceryAuditResult(fullText);
        emit({ done: true, result });
      } catch (err) {
        const message = (err as Error).message ?? '';
        if (message.includes('JSON') || message.includes('parse') || message.includes('ZodError')) {
          emit({ error: 'AI response could not be parsed', done: true });
        } else {
          emit({ error: 'Grocery audit failed. Please try again.', done: true });
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
