'use client';

// components/layout/PageTransition.tsx
// Route entrance wrapper. Uses the CSS `.gc-enter` primitive (transform/opacity
// only, reduced-motion aware) instead of framer-motion so transitions run off
// the main thread and don't drop frames under Next.js navigation load.

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function PageTransition({ children }: { children: React.ReactNode }) {
  // Key the inner frame on the pathname so each route change mounts a fresh
  // element: that re-triggers @starting-style (native) and re-runs the
  // data-mounted effect (fallback), re-animating the wrapper per navigation.
  const pathname = usePathname();
  return <PageTransitionFrame key={pathname}>{children}</PageTransitionFrame>;
}

function PageTransitionFrame({ children }: { children: React.ReactNode }) {
  // Drives the `.gc-enter` fallback path: render hidden, then flip to mounted
  // after the first paint so the CSS transition runs even where
  // @starting-style is unsupported. Native engines use @starting-style.
  // The base `.gc-enter` rule is the settled (visible, final-position) state,
  // so content always ends at full opacity and never gets stuck hidden.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="gc-enter" data-mounted={mounted}>
      {children}
    </div>
  );
}
