// lib/auth-options.ts — shared NextAuth config (route file may only export HTTP handlers)
// OAuth access/refresh tokens live on JWT only — not on Session (client-visible).

import { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { refreshGoogleAccessToken } from '@/lib/google-token-refresh';

const REFRESH_BUFFER_SEC = 120;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/drive.appdata',
          ].join(' '),
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        return token;
      }

      const refreshToken = token.refreshToken as string | undefined;
      const expiresAt = token.expiresAt as number | undefined;
      if (!refreshToken || expiresAt == null) {
        return token;
      }

      const nowSec = Math.floor(Date.now() / 1000);
      if (nowSec < expiresAt - REFRESH_BUFFER_SEC) {
        return token;
      }

      try {
        const refreshed = await refreshGoogleAccessToken(refreshToken);
        token.accessToken = refreshed.accessToken;
        token.expiresAt = refreshed.expiresAtSec;
        if (refreshed.refreshToken) {
          token.refreshToken = refreshed.refreshToken;
        }
      } catch {
        // Keep existing token; Drive routes return 401 until re-auth
      }

      return token;
    },
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: '/profile',
  },
};
