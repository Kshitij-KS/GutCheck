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
 * Centralized logging seam. All logs funnel through `report()`, which writes to
 * the console and (optionally) a server sink. NEVER pass health payloads here —
 * log shapes, counts, codes, and messages only.
 */
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

function report(level: LogLevel, component: string, message: string, meta?: unknown): void {
  const tag = `[${component}] ${message}`;
  if (level === 'debug' && process.env.NODE_ENV !== 'development') return;

  // Console sink (always)
  if (level === 'error') console.error(tag, meta ?? '');
  else if (level === 'warn') console.warn(tag);
  else if (level === 'info') console.info(tag);
  else console.debug(tag);

  // Optional server sink (no-op unless configured). Best-effort, never throws.
  const sink = process.env.LOG_SINK_URL;
  if (sink && typeof fetch === 'function' && level !== 'debug') {
    try {
      void fetch(sink, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, component, message, at: new Date().toISOString() }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // never let logging break a request
    }
  }
}

export const logger = {
  error: (component: string, message: string, error?: unknown) => report('error', component, message, error),
  warn: (component: string, message: string) => report('warn', component, message),
  info: (component: string, message: string) => report('info', component, message),
  debug: (component: string, message: string) => report('debug', component, message),
};

/**
 * Standardized API-route error log. `code` is a short stable tag (e.g.
 * 'parse_error', 'rate_limited', 'drive_load_failed') for observability/metrics.
 */
export function logRouteError(component: string, code: string, error?: unknown): void {
  report('error', component, `route_error code=${code}`, error);
}
