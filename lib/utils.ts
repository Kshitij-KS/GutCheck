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

/**
 * Sanitize prompt input — remove potential injection attempts.
 * Simple check: truncate to 1000 chars, strip markdown fences.
 */
export function sanitizeInput(input: string): string {
  return input
    .slice(0, 1000)
    .replace(/```[\s\S]*?```/g, '[code block removed]')
    .trim();
}

/** Pluralize a word based on count */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}
