// app/api/agents/scan-menu/route.ts
// Menu scanner via Gemini (streaming SSE)
// Accepts: text OR base64 image + health profile

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getStreamingModel } from '@/lib/gemini';
import { SCAN_MENU_SYSTEM_PROMPT, buildMenuScanUserPrompt } from '@/lib/prompts/scan-menu.prompt';
import { parseMenuScanResult } from '@/lib/parsers/scan.parser';

const RequestSchema = z.object({
  menuText: z.string().optional().default(''),
  base64: z.string().optional(),
  mimeType: z.string().optional(),
  profileJson: z.string().min(2),
  isOffline: z.boolean().default(false),
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

        const { menuText, base64, mimeType, profileJson, isOffline } = parsed.data;

        emit({ status: 'scanning', message: 'Analyzing menu with your profile...' });

        const model = getStreamingModel(true); // Flash model for speed

        let streamResult;

        if (base64 && mimeType) {
          // Camera capture — vision mode
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
