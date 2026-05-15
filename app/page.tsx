'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGutCheckStore } from '@/store/gutcheck.store';
import { WebLanding } from '@/components/landing/WebLanding';
import { AppWelcome } from '@/components/landing/AppWelcome';

export default function HomePage() {
  const router = useRouter();
  const isOnboarded = useGutCheckStore((s) => s.isOnboarded);
  const [isStandalone, setIsStandalone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOnboarded) {
      router.replace('/dashboard');
      return;
    }
    
    // Check if running as installed PWA
    const mql = window.matchMedia('(display-mode: standalone)');
    setIsStandalone(mql.matches);
    
    const onChange = (e: MediaQueryListEvent) => setIsStandalone(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [isOnboarded, router]);

  if (!mounted) {
    return (
      <div
        className="min-h-[100dvh] min-h-screen flex flex-col items-center justify-center px-6"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <p
          className="text-2xl tracking-tight"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          GutCheck
        </p>
        <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
          Loading&hellip;
        </p>
      </div>
    );
  }
  if (isOnboarded) return null;

  return isStandalone ? <AppWelcome /> : <WebLanding />;
}
