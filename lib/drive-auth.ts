// lib/drive-auth.ts — Google access token from JWT only (never exposed on Session)

import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function getDriveAccessToken(req: NextRequest): Promise<string | null> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;
  const token = await getToken({ req, secret });
  const access = token?.accessToken;
  return typeof access === 'string' && access.length > 0 ? access : null;
}
