'use client';

import { useState, useCallback } from 'react';
import { useGutCheckStore } from '@/store/gutcheck.store';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { offlineQuickCheck, withAllergyAvoids } from '@/lib/offline/fallback-tree';
import { useScanRateLimit } from '@/hooks/useScanRateLimit';
import { toast } from '@/store/ui.store';
import type { MenuScanResult, DishScanResult } from '@/types';

/** Reads a non-OK response (e.g. 429 rate limit) into a friendly message. */
async function messageForBadResponse(res: Response, fallback: string): Promise<string> {
  if (res.status === 429) {
    const body = await res.json().catch(() => null) as { error?: string } | null;
    return body?.error ?? 'You are scanning very fast — take a breath and try again in a moment.';
  }
  const body = await res.json().catch(() => null) as { error?: string } | null;
  return body?.error ?? fallback;
}

type ScanState =
  | { status: 'idle' }
  | { status: 'scanning'; discovered: number }
  | { status: 'complete'; result: MenuScanResult }
  | { status: 'error'; message: string };

export function useMenuScan() {
  const [scanState, setScanState] = useState<ScanState>({ status: 'idle' });
  const { isOnline } = useOfflineDetection();
  const { recordScan } = useScanRateLimit();
  const healthProfile = useGutCheckStore((s) => s.healthProfile);
  const dietaryPreferences = useGutCheckStore((s) => s.dietaryPreferences);
  const allergies = useGutCheckStore((s) => s.allergies);
  // NOTE: results are NOT auto-saved to history here. The Scan page exposes an
  // explicit "Save this analysis" action, which is the single path into history.
  // Auto-saving here as well caused every scan to be stored twice.

  const buildProfilePayload = useCallback(() => {
    if (!healthProfile) return '{}';
    return JSON.stringify({
      ...healthProfile.consolidatedRules,
      ...(dietaryPreferences.length ? { dietaryPreferences } : {}),
      ...(allergies.length ? { allergies } : {}),
    });
  }, [healthProfile, dietaryPreferences, allergies]);

  const scanText = useCallback(async (menuText: string) => {
    if (!healthProfile) {
      setScanState({ status: 'error', message: 'Please upload your blood report first.' });
      return;
    }

    setScanState({ status: 'scanning', discovered: 0 });

    if (!isOnline) {
      const tree = withAllergyAvoids(healthProfile.offlineFallbackTree, allergies);
      const lines = menuText.split('\n').filter((l) => l.trim().length > 0);
      const bestChoices: string[] = [];
      const dishes: DishScanResult[] = lines.map((line) => {
        const check = offlineQuickCheck(line, tree);
        const dishName = line.trim();

        if (check.classification === 'PRIORITIZE' && bestChoices.length < 3) {
          bestChoices.push(dishName);
        }

        return {
          dishName,
          score: check.classification === 'PRIORITIZE' ? 75 : check.classification === 'MODERATE' ? 50 : 20,
          hiddenIngredients: [],
          modification: null,
          ...check,
        };
      });

      const result: MenuScanResult = {
        dishes,
        scanSummary: 'You are offline — results based on your cached profile keyword matching.',
        bestChoices,
        timestamp: new Date().toISOString(),
      };

      recordScan();
      setScanState({ status: 'complete', result });
      return;
    }

    try {
      const res = await fetch('/api/agents/scan-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuText,
          profileJson: buildProfilePayload(),
        }),
      });

      if (!res.body) throw new Error('No response body');
      if (!res.ok) throw new Error(await messageForBadResponse(res, 'Scan failed. Please try again.'));

      const result = await consumeSSEStream<MenuScanResult>(res, (count) =>
        setScanState((cur) => (cur.status === 'scanning' ? { status: 'scanning', discovered: count } : cur))
      );
      if (!result) throw new Error('No result returned');

      recordScan();
      setScanState({ status: 'complete', result });
    } catch (err) {
      const message = (err as Error).message ?? 'Scan failed.';
      setScanState({ status: 'error', message });
      toast.error(message);
    }
  }, [healthProfile, isOnline, recordScan, buildProfilePayload, allergies]);

  const scanImage = useCallback(async (base64: string, mimeType: string) => {
    if (!healthProfile) {
      setScanState({ status: 'error', message: 'Please upload your blood report first.' });
      return;
    }

    if (!isOnline) {
      setScanState({ status: 'error', message: 'Camera scan requires an internet connection.' });
      return;
    }

    setScanState({ status: 'scanning', discovered: 0 });

    try {
      const res = await fetch('/api/agents/scan-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64,
          mimeType,
          profileJson: buildProfilePayload(),
        }),
      });

      const result = await consumeSSEStream<MenuScanResult>(res, (count) =>
        setScanState((cur) => (cur.status === 'scanning' ? { status: 'scanning', discovered: count } : cur))
      );
      if (!res.ok) throw new Error(await messageForBadResponse(res, 'Camera scan failed.'));
      if (!result) throw new Error('No result returned');

      recordScan();
      setScanState({ status: 'complete', result });
    } catch (err) {
      const message = (err as Error).message ?? 'Camera scan failed.';
      setScanState({ status: 'error', message });
      toast.error(message);
    }
  }, [healthProfile, isOnline, recordScan, buildProfilePayload]);

  return {
    scanState,
    scanText,
    scanImage,
    isOnline,
    reset: () => setScanState({ status: 'idle' }),
  };
}

async function consumeSSEStream<T>(
  res: Response,
  onCount?: (discovered: number) => void
): Promise<T | null> {
  if (!res.body) return null;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let result: T | null = null;
  let buffer = '';
  let streamed = ''; // accumulated chunk text, for progress counting

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const payload = JSON.parse(line.slice(6)) as Record<string, unknown>;
          if (typeof payload.chunk === 'string' && onCount) {
            streamed += payload.chunk;
            // Count dishes discovered so far (strict-JSON output → count keys).
            const matches = streamed.match(/"dishName"\s*:/g);
            if (matches) onCount(matches.length);
          }
          if (payload.done && payload.result) result = payload.result as T;
          if (payload.error) throw new Error(payload.error as string);
        } catch {
          // Skip malformed SSE lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return result;
}
