// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function generateId(): string {
  return crypto.randomUUID();
}

/** Pluralize a word based on count */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

/**
 * Extract JSON from raw AI response using multiple strategies.
 * Used by parser functions to handle AI response formatting variations.
 */
export function extractJson(raw: string): string {
  // Strategy 1: Extract from markdown code fences
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch && fenceMatch[1]) return fenceMatch[1];

  // Strategy 2: First { to last }
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return raw.slice(firstBrace, lastBrace + 1);
  }

  // Strategy 3: Fall back to raw
  return raw;
}

/**
 * Logger utility for consistent error logging across the application
 */
export const logger = {
  error: (component: string, message: string, error?: unknown) => {
    console.error(`[${component}] ${message}`, error ?? '');
  },
  warn: (component: string, message: string) => {
    console.warn(`[${component}] ${message}`);
  },
  info: (component: string, message: string) => {
    console.info(`[${component}] ${message}`);
  },
  debug: (component: string, message: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${component}] ${message}`);
    }
  }
};
