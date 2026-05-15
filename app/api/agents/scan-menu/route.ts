// app/api/agents/scan-menu/route.ts
// Menu scanner via Gemini (streaming SSE)
// Accepts: text OR base64 image + health profile

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getStreamingModel } from '@/lib/gemini';
import { SCAN_MENU_SYSTEM_PROMPT, buildMenuScanUserPrompt } from '@/lib/prompts/scan-menu.prompt';
import { parseMenuScanResult } from '@/lib/parsers/scan.parser';
import {
  API_INPUT_LIMITS,
  detectPromptInjection,
  isResponseSafe,
  sanitizeInput,
} from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';

const RequestSchema = z.object({
  menuText: z.string().max(API_INPUT_LIMITS.menuText).optional().default(''),
  base64: z.string().max(API_INPUT_LIMITS.base64Chars).optional(),
  mimeType: z.string().max(128).optional(),
  profileJson: z.string().min(2).max(API_INPUT_LIMITS.profileJson),
  isOffline: z.boolean().default(false),
});

export async function POST(req: NextRequest): Promise<Response> {
  const limited = await checkRateLimit(req, 'agents', 'scan-menu');
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
          emit({ error: 'Invalid request', done: true });
          return;
        }

        let { menuText, base64, mimeType, profileJson, isOffline } = parsed.data;
        menuText = sanitizeInput(menuText);
        profileJson = sanitizeInput(profileJson);

        if (!(base64 && mimeType)) {
          const inj = detectPromptInjection(menuText);
          if (!inj.isSafe) {
            emit({ error: inj.reason ?? 'Input was rejected for safety.', done: true });
            return;
          }
        }

        emit({ status: 'scanning', message: 'Analyzing menu with your profile...' });

        const model = getStreamingModel(true); // Flash model for speed

        let streamResult;

        if (base64 && mimeType) {
          streamResult = await model.generateContentStream([
            { text: SCAN_MENU_SYSTEM_PROMPT },
            { text: `Analyze this menu photo for a user with this health profile: ${profileJson}` },
            { inlineData: { data: base64, mimeType } },
          ]);
        } else {
          const userPrompt = buildMenuScanUserPrompt(menuText, profileJson, isOffline);
          streamResult = await model.generateContentStream([
            { text: SCAN_MENU_SYSTEM_PROMPT },
            { text: userPrompt },
          ]);
        }

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
        const result = parseMenuScanResult(fullText);
        emit({ done: true, result });
      } catch (err) {
        const message = (err as Error).message ?? '';
        if (message.includes('JSON') || message.includes('parse') || message.includes('ZodError')) {
          emit({ error: 'AI response could not be parsed', done: true });
        } else {
          emit({ error: 'Menu scan failed. Please try again.', done: true });
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
