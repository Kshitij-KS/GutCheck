'use client';

// hooks/useMenuScan.ts
// Menu scanning hook — checks offline status before every call

import { useState, useCallback } from 'react';
import { useGutCheckStore } from '@/store/gutcheck.store';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { offlineQuickCheck } from '@/lib/offline/fallback-tree';
import { useScanRateLimit } from '@/hooks/useScanRateLimit';
import type { MenuScanResult, DishScanResult } from '@/types';

type ScanState =
  | { status: 'idle' }
  | { status: 'scanning' }
  | { status: 'complete'; result: MenuScanResult }
  | { status: 'error'; message: string };

export function useMenuScan() {
  const [scanState, setScanState] = useState<ScanState>({ status: 'idle' });
  const { isOnline } = useOfflineDetection();
  const { recordScan } = useScanRateLimit();
  const healthProfile = useGutCheckStore((s) => s.healthProfile);
  const addScanResult = useGutCheckStore((s) => s.addScanResult);

  const scanText = useCallback(async (menuText: string) => {
    if (!healthProfile) {
      setScanState({ status: 'error', message: 'Please upload your blood report first.' });
      return;
    }

    setScanState({ status: 'scanning' });

    // Offline fallback
    if (!isOnline) {
      const tree = healthProfile.offlineFallbackTree;
      const lines = menuText.split('\n').filter((l) => l.trim().length > 0);
      const dishes: DishScanResult[] = lines.map((line) => {
        const check = offlineQuickCheck(line, tree);
        return {
          dishName: line.trim(),
          score: check.classification === 'PRIORITIZE' ? 75 : check.classification === 'MODERATE' ? 50 : 20,
          hiddenIngredients: [],
          modification: null,
          ...check,
        };
      });

      const result: MenuScanResult = {
        dishes,
        scanSummary: 'You are offline — results based on your cached profile keyword matching.',
        bestChoices: dishes.filter((d) => d.classification === 'PRIORITIZE').map((d) => d.dishName).slice(0, 3),
        timestamp: new Date().toISOString(),
      };

      addScanResult(result);
      recordScan();
      setScanState({ status: 'complete', result });
      return;
    }

    // Online — call API
    try {
      const res = await fetch('/api/agents/scan-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuText,
          profileJson: JSON.stringify(healthProfile.consolidatedRules),
        }),
      });

      if (!res.body) throw new Error('No response body');

      const result = await consumeSSEStream<MenuScanResult>(res);
      if (!result) throw new Error('No result returned');

      addScanResult(result);
      recordScan();
      setScanState({ status: 'complete', result });
    } catch (err) {
      setScanState({ status: 'error', message: (err as Error).message ?? 'Scan failed.' });
    }
  }, [healthProfile, isOnline, addScanResult, recordScan]);

  const scanImage = useCallback(async (base64: string, mimeType: string) => {
    if (!healthProfile) {
      setScanState({ status: 'error', message: 'Please upload your blood report first.' });
      return;
    }

    if (!isOnline) {
      setScanState({ status: 'error', message: 'Camera scan requires an internet connection.' });
      return;
    }

    setScanState({ status: 'scanning' });

    try {
      const res = await fetch('/api/agents/scan-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64,
          mimeType,
          profileJson: JSON.stringify(healthProfile.consolidatedRules),
        }),
      });

      const result = await consumeSSEStream<MenuScanResult>(res);
      if (!result) throw new Error('No result returned');

      addScanResult(result);
      recordScan();
      setScanState({ status: 'complete', result });
    } catch (err) {
      setScanState({ status: 'error', message: (err as Error).message ?? 'Camera scan failed.' });
    }
  }, [healthProfile, isOnline, addScanResult, recordScan]);

  return {
    scanState,
    scanText,
    scanImage,
    isOnline,
    reset: () => setScanState({ status: 'idle' }),
  };
}

async function consumeSSEStream<T>(res: Response): Promise<T | null> {
  if (!res.body) return null;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let result: T | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const lines = decoder.decode(value).split('\n');
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = JSON.parse(line.slice(6)) as Record<string, unknown>;
      if (payload.done && payload.result) result = payload.result as T;
      if (payload.error) throw new Error(payload.error as string);
    }
  }

  return result;
}
