'use client';

// components/layout/AppShell.tsx

import { SessionProvider } from 'next-auth/react';
import { Navbar } from './Navbar';
import { OfflineBanner } from './OfflineBanner';
import { PageTransition } from './PageTransition';
import { PwaRegister } from './PwaRegister';
import { ToastViewport } from '@/components/shared/Toast';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PwaRegister />
      <OfflineBanner />
      <Navbar />
      <PageTransition>
        {/* Mobile gets extra bottom padding so the fixed `md:hidden` bottom nav
            bar (~56–64px + safe-area inset) never occludes content. At `md` the
            bar is gone, so the offset drops back to the small safe-area pad to
            avoid dead space on tablet/desktop. */}
        <main
          className="min-h-[100dvh] min-h-screen pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-[max(0.5rem,env(safe-area-inset-bottom))]"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          {children}
        </main>
      </PageTransition>
      <ToastViewport />
    </SessionProvider>
  );
}
