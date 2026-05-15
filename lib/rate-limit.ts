// lib/rate-limit.ts — optional IP sliding-window limits (Upstash). No-op when env unset.

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export type RateLimitKind = 'agents' | 'pdf';

function redisFromEnv(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const memo: { agents?: Ratelimit | null; pdf?: Ratelimit | null } = {};

function getAgentsLimiter(): Ratelimit | null {
  if (memo.agents !== undefined) return memo.agents;
  const redis = redisFromEnv();
  if (!redis) {
    memo.agents = null;
    return null;
  }
  const n = Number(process.env.RATE_LIMIT_AGENTS_PER_MINUTE ?? 45);
  const cap = Number.isFinite(n) && n > 0 ? n : 45;
  memo.agents = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(cap, '1 m'),
    prefix: 'gutcheck:agents',
  });
  return memo.agents;
}

function getPdfLimiter(): Ratelimit | null {
  if (memo.pdf !== undefined) return memo.pdf;
  const redis = redisFromEnv();
  if (!redis) {
    memo.pdf = null;
    return null;
  }
  const n = Number(process.env.RATE_LIMIT_PDF_PER_MINUTE ?? 20);
  const cap = Number.isFinite(n) && n > 0 ? n : 20;
  memo.pdf = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(cap, '1 m'),
    prefix: 'gutcheck:pdf',
  });
  return memo.pdf;
}

function clientIp(req: NextRequest): string {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) {
    const first = xf.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip') ?? 'unknown';
}

/**
 * @returns NextResponse 429 when over limit; null when allowed or rate limiting disabled.
 */
export async function checkRateLimit(
  req: NextRequest,
  kind: RateLimitKind,
  routeKey: string
): Promise<NextResponse | null> {
  const limiter = kind === 'pdf' ? getPdfLimiter() : getAgentsLimiter();
  if (!limiter) return null;

  const id = `${clientIp(req)}:${routeKey}`;
  const { success } = await limiter.limit(id);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      { status: 429 }
    );
  }
  return null;
}
