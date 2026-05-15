'use client';

// components/layout/AppShell.tsx

import { SessionProvider } from 'next-auth/react';
import { Navbar } from './Navbar';
import { OfflineBanner } from './OfflineBanner';
import { PageTransition } from './PageTransition';
import { PwaRegister } from './PwaRegister';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PwaRegister />
      <OfflineBanner />
      <Navbar />
      <PageTransition>
        <main
          className="min-h-[100dvh] min-h-screen pb-[max(0.5rem,env(safe-area-inset-bottom))]"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          {children}
        </main>
      </PageTransition>
    </SessionProvider>
  );
}
