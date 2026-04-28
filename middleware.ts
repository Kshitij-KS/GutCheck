// middleware.ts
// Protects /api/drive/* routes — requires valid next-auth session
// All /api/agents/* routes are unauthenticated (privacy-first)

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // Only protect Drive routes — agent routes are open (privacy-first architecture)
  matcher: ['/api/drive/:path*'],
};
