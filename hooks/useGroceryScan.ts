'use client';

import { useState, useCallback } from 'react';
import { useGutCheckStore } from '@/store/gutcheck.store';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { offlineQuickCheck } from '@/lib/offline/fallback-tree';
import type { GroceryAuditResult, GroceryItem } from '@/types';

type GroceryState =
  | { status: 'idle' }
  | { status: 'scanning' }
  | { status: 'complete'; result: GroceryAuditResult }
  | { status: 'error'; message: string };

export function useGroceryScan() {
  const [state, setState] = useState<GroceryState>({ status: 'idle' });
  const healthProfile = useGutCheckStore((s) => s.healthProfile);
  const addGroceryResult = useGutCheckStore((s) => s.addGroceryResult);
  const { isOnline } = useOfflineDetection();

  const audit = useCallback(async (groceryList: string) => {
    if (!healthProfile) {
      setState({ status: 'error', message: 'Please upload your blood report first.' });
      return;
    }

    setState({ status: 'scanning' });

    if (!isOnline) {
      const tree = healthProfile.offlineFallbackTree;
      const lines = groceryList.split('\n').filter((l) => l.trim().length > 0);
      const items: GroceryItem[] = lines.map((line) => {
        const check = offlineQuickCheck(line, tree);
        return {
          name: line.trim(),
          classification: check.classification,
          reason: check.primaryReason,
          hiddenIngredients: [],
          swap: null,
        };
      });

      const greatCount = items.filter((i) => i.classification === 'PRIORITIZE').length;
      const moderateCount = items.filter((i) => i.classification === 'MODERATE').length;
      const reconsiderCount = items.filter((i) => i.classification === 'AVOID').length;

      const result: GroceryAuditResult = {
        items,
        summary: 'You are offline — results based on your cached profile keyword matching.',
        overallGuidance: '',
        greatCount,
        moderateCount,
        reconsiderCount,
        timestamp: new Date().toISOString(),
      };

      addGroceryResult(result);
      setState({ status: 'complete', result });
      return;
    }

    try {
      const res = await fetch('/api/agents/scan-grocery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groceryList,
          profileJson: JSON.stringify(healthProfile.consolidatedRules),
        }),
      });

      if (!res.body) throw new Error('No response body');
      const result = await consumeSSEStream<GroceryAuditResult>(res);

      if (!result) throw new Error('No result returned');

      addGroceryResult(result);
      setState({ status: 'complete', result });
    } catch (err) {
      setState({ status: 'error', message: (err as Error).message ?? 'Audit failed.' });
    }
  }, [healthProfile, isOnline, addGroceryResult]);

  return { state, audit, reset: () => setState({ status: 'idle' }) };
}

async function consumeSSEStream<T>(res: Response): Promise<T | null> {
  if (!res.body) return null;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let result: T | null = null;
  let buffer = '';

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
