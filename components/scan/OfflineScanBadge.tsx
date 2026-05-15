'use client';

// components/scan/OfflineScanBadge.tsx
// Shown on dish cards and scan results when isOfflineResult: true
// Architecture requirement: surface clearly that results came from keyword matching, not AI

import { WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface OfflineScanBadgeProps {
  /** 'card' = small inline badge. 'banner' = full-width strip above results. */
  variant?: 'card' | 'banner';
}

export function OfflineScanBadge({ variant = 'card' }: OfflineScanBadgeProps) {
  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 rounded-xl px-4 py-3"
        style={{
          backgroundColor: 'var(--tl-moderate-bg)',
          border: '1px solid var(--tl-moderate)',
        }}
      >
        <WifiOff size={14} style={{ color: 'var(--tl-moderate)', flexShrink: 0 }} />
        <p
          className="text-sm leading-snug"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--tl-moderate)' }}
        >
          You are offline — results are based on your cached keyword profile, not full AI analysis.
          Reconnect for complete dish ratings.
        </p>
      </motion.div>
    );
  }

  // card variant: compact inline badge
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs"
      style={{
        backgroundColor: 'var(--tl-moderate-bg)',
        color: 'var(--tl-moderate)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <WifiOff size={10} />
      Offline result
    </span>
  );
}
