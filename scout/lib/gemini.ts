// lib/gemini.ts

import { GoogleGenerativeAI, type GenerativeModel, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Returns a configured Gemini 2.5 Pro model instance.
 * Safety settings are set to block harmful content at the source —
 * this is an additional layer on top of our prompt-level guardrails.
 */
export function getGeminiModel(): GenerativeModel {
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-pro',
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
    ],
    generationConfig: {
      temperature: 0.1,       // Low temperature — we want deterministic JSON, not creativity
      topP: 0.8,
      responseMimeType: 'application/json',  // Force JSON output mode
    },
  });
}

/**
 * Helper: stream a Gemini response and call onChunk for each text delta.
 * Returns the full accumulated text when done.
 */
export async function streamGeminiResponse(
  model: GenerativeModel,
  prompt: string,
  systemInstruction: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  const result = await model.generateContentStream({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
  });

  let fullText = '';
  for await (const chunk of result.stream) {
    const text = chunk.text();
    fullText += text;
    onChunk(text);
  }

  return fullText;
}
