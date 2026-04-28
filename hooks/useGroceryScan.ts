'use client';

// hooks/useGroceryScan.ts

import { useState, useCallback } from 'react';
import { useGutCheckStore } from '@/store/gutcheck.store';
import type { GroceryAuditResult } from '@/types';

type GroceryState =
  | { status: 'idle' }
  | { status: 'scanning' }
  | { status: 'complete'; result: GroceryAuditResult }
  | { status: 'error'; message: string };

export function useGroceryScan() {
  const [state, setState] = useState<GroceryState>({ status: 'idle' });
  const healthProfile = useGutCheckStore((s) => s.healthProfile);
  const addGroceryResult = useGutCheckStore((s) => s.addGroceryResult);

  const audit = useCallback(async (groceryList: string) => {
    if (!healthProfile) {
      setState({ status: 'error', message: 'Please upload your blood report first.' });
      return;
    }

    setState({ status: 'scanning' });

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
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result: GroceryAuditResult | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = JSON.parse(line.slice(6)) as Record<string, unknown>;
          if (payload.done && payload.result) result = payload.result as GroceryAuditResult;
          if (payload.error) throw new Error(payload.error as string);
        }
      }

      if (!result) throw new Error('No result returned');

      addGroceryResult(result);
      setState({ status: 'complete', result });
    } catch (err) {
      setState({ status: 'error', message: (err as Error).message ?? 'Audit failed.' });
    }
  }, [healthProfile, addGroceryResult]);

  return { state, audit, reset: () => setState({ status: 'idle' }) };
}
