// app/api/auth/[...nextauth]/route.ts
// Google OAuth with drive.appdata scope

import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

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
      // Persist access token and refresh token to JWT on first sign-in
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose access token to server-side session (used in API routes)
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: '/profile', // Redirect to profile page for Drive sync sign-in
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
