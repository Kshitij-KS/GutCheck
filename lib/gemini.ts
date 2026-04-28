// lib/gemini.ts
// Singleton Gemini client — import from here, never instantiate inline in routes

import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  console.warn('[GutCheck] GEMINI_API_KEY is not set. AI features will not work.');
}

export const geminiClient = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY ?? ''
);

// Standard model for all agents (supports JSON mode + streaming)
export const GEMINI_MODEL = 'gemini-2.5-flash';

// Flash model for quick-query and grocery (faster, cheaper)
export const GEMINI_FLASH_MODEL = 'gemini-2.5-flash';

/**
 * Get a Gemini model instance configured for JSON output.
 * Use for all agent routes.
 */
export function getAgentModel(flash = false) {
  return geminiClient.getGenerativeModel({
    model: flash ? GEMINI_FLASH_MODEL : GEMINI_MODEL,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
      topP: 0.8,
    },
  });
}

/**
 * Get a Gemini model instance configured for streaming text output.
 */
export function getStreamingModel(flash = false) {
  return geminiClient.getGenerativeModel({
    model: flash ? GEMINI_FLASH_MODEL : GEMINI_MODEL,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  });
}
