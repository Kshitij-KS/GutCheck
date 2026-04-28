'use client';

// components/layout/AppShell.tsx

import { SessionProvider } from 'next-auth/react';
import { Navbar } from './Navbar';
import { OfflineBanner } from './OfflineBanner';
import { PageTransition } from './PageTransition';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <OfflineBanner />
      <Navbar />
      <PageTransition>
        <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
          {children}
        </main>
      </PageTransition>
    </SessionProvider>
  );
}
