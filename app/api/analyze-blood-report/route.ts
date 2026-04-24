// app/api/analyze-blood-report/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getGeminiModel, streamGeminiResponse } from '@/lib/gemini';
import { detectPromptInjection, sanitizeInput, isResponseSafe } from '@/lib/security';
import {
  BLOOD_REPORT_SYSTEM_PROMPT,
  buildBloodReportUserPrompt,
} from '@/lib/prompts/blood-report.prompt';
import { parseBloodReportResponse } from '@/lib/parsers/blood-report.parser';

const RequestSchema = z.object({
  extractedText: z.string().min(10, 'Report text too short'),
  imageBase64: z.string().optional(),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']).optional(),
});

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

    const { extractedText, imageBase64, mimeType } = parsed.data;

    // SECURITY: Sanitize and injection-check before any LLM call
    const sanitized = sanitizeInput(extractedText);
    const injectionCheck = detectPromptInjection(sanitized);
    if (!injectionCheck.isSafe) {
      return NextResponse.json(
        { error: 'Input validation failed', reason: injectionCheck.reason },
        { status: 422 }
      );
    }

    const model = getGeminiModel();
    const userPrompt = buildBloodReportUserPrompt(sanitized);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let fullText = '';

        try {
          if (imageBase64 && mimeType) {
            // Gemini supports inline image parts — build multimodal content
            const result = await model.generateContentStream({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      inlineData: {
                        mimeType,
                        data: imageBase64,
                      },
                    },
                    { text: userPrompt },
                  ],
                },
              ],
              systemInstruction: { role: 'system', parts: [{ text: BLOOD_REPORT_SYSTEM_PROMPT }] },
            });

            for await (const chunk of result.stream) {
              const text = chunk.text();
              fullText += text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ chunk: text })}\n\n`)
              );
            }
          } else {
            // Text-only path
            fullText = await streamGeminiResponse(
              model,
              userPrompt,
              BLOOD_REPORT_SYSTEM_PROMPT,
              (chunk) => {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`)
                );
              }
            );
          }

          // SECURITY: Validate that the response looks like JSON before parsing
          if (!isResponseSafe(fullText)) {
            throw new Error('AI response failed safety check — unexpected format');
          }

          const parsedResult = parseBloodReportResponse(fullText);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true, result: parsedResult })}\n\n`)
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Analysis failed';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
          );
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
    console.error('[analyze-blood-report]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
