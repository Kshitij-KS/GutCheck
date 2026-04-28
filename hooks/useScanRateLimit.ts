'use client';

// hooks/useScanRateLimit.ts
// Soft limit at 8 scans/day — NEVER hard-blocks, shows MindfulNudge

import { useMemo } from 'react';
import { useGutCheckStore } from '@/store/gutcheck.store';

export const DAILY_SCAN_SOFT_LIMIT = 8;

const MINDFUL_MESSAGES = [
  "You've been scanning a lot today! Remember, one meal won't define your health journey.",
  "Your profile is a guide, not a rulebook. Enjoy your meal — flexibility is part of wellness.",
  "Great awareness! Give yourself credit for making conscious choices.",
];

export function useScanRateLimit() {
  const scanCountToday = useGutCheckStore((s) => s.scanCountToday);
  const incrementScanCount = useGutCheckStore((s) => s.incrementScanCount);

  const isOverLimit = scanCountToday >= DAILY_SCAN_SOFT_LIMIT;

  const mindfulMessage = useMemo(() => {
    if (!isOverLimit) return null;
    const idx = scanCountToday % MINDFUL_MESSAGES.length;
    return MINDFUL_MESSAGES[idx] ?? MINDFUL_MESSAGES[0] ?? null;
  }, [scanCountToday, isOverLimit]);

  return {
    scanCountToday,
    isOverLimit,
    mindfulMessage,
    /** Call this AFTER a scan completes — never before */
    recordScan: incrementScanCount,
  };
}
