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

  if (!mounted) return null;
  if (isOnboarded) return null;

  return isStandalone ? <AppWelcome /> : <WebLanding />;
}
