'use client';

// hooks/useMenuAnalysis.ts

import { useState, useCallback } from 'react';
import type { MenuAnalysisResult } from '@/types';
import { useGutCheckStore } from '@/store/gutcheck.store';

type MenuAnalysisState =
  | { status: 'idle' }
  | { status: 'extracting'; message: string }
  | { status: 'analyzing'; message: string; dishCount?: number }
  | { status: 'done'; result: MenuAnalysisResult }
  | { status: 'error'; message: string };

export function useMenuAnalysis() {
  const [state, setState] = useState<MenuAnalysisState>({ status: 'idle' });
  const healthProfile = useGutCheckStore((s) => s.healthProfile);
  const addAnalysisResult = useGutCheckStore((s) => s.addAnalysisResult);

  const analyze = useCallback(
    async (menuText: string, menuSource = 'Scanned menu') => {
      if (!healthProfile) {
        setState({ status: 'error', message: 'No health profile found. Please upload your blood report first.' });
        return;
      }

      setState({ status: 'extracting', message: 'Reading the menu...' });

      try {
        const response = await fetch('/api/analyze-menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ menuText, healthProfile, menuSource }),
        });

        if (!response.ok) {
          const errorData = await response.json() as { error?: string; reason?: string };
          throw new Error(errorData.reason ?? errorData.error ?? 'Request failed');
        }

        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = JSON.parse(line.slice(6)) as Record<string, unknown>;

            if (data['status'] === 'extracting') {
              setState({ status: 'extracting', message: String(data['message'] ?? '') });
            } else if (data['status'] === 'analyzing') {
              setState({
                status: 'analyzing',
                message: String(data['message'] ?? ''),
                dishCount: typeof data['dishCount'] === 'number' ? data['dishCount'] : undefined,
              });
            } else if (data['done'] && data['result']) {
              const result = data['result'] as MenuAnalysisResult;
              addAnalysisResult(result);
              setState({ status: 'done', result });
            } else if (data['error']) {
              throw new Error(String(data['error']));
            }
          }
        }
      } catch (err) {
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Analysis failed. Please try again.',
        });
      }
    },
    [healthProfile, addAnalysisResult]
  );

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, analyze, reset };
}
