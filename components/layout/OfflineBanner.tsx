'use client';

// components/layout/OfflineBanner.tsx
// Warm amber banner when offline. Auto-hides on reconnect.

import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const { isOnline } = useOfflineDetection();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -32 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm z-50"
          style={{
            backgroundColor: 'var(--tl-moderate-bg)',
            color: 'var(--tl-moderate)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <WifiOff size={14} />
          <span style={{ fontFamily: 'var(--font-body)' }}>
            You&apos;re offline — GutCheck is using your cached profile for quick checks.
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
