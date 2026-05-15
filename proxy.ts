// proxy.ts (Next.js 16+) — protects /api/drive/* — requires valid next-auth session
// All /api/agents/* routes stay open (privacy-first)

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export const proxy = withAuth(
  function handleDriveProtection() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/api/drive/:path*'],
};
