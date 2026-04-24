'use client';

// hooks/useBloodAnalysis.ts

import { useState, useCallback } from 'react';
import type { HealthProfile } from '@/types';
import { useGutCheckStore } from '@/store/gutcheck.store';

type BloodAnalysisState =
  | { status: 'idle' }
  | { status: 'extracting'; message: string }
  | { status: 'analyzing'; message: string }
  | { status: 'done'; result: HealthProfile }
  | { status: 'error'; message: string };

export function useBloodAnalysis() {
  const [state, setState] = useState<BloodAnalysisState>({ status: 'idle' });
  const setHealthProfile = useGutCheckStore((s) => s.setHealthProfile);

  const analyze = useCallback(
    async (
      extractedText: string,
      imageBase64?: string,
      mimeType?: 'image/jpeg' | 'image/png' | 'image/webp'
    ) => {
      setState({ status: 'extracting', message: 'Sending report to analysis...' });

      try {
        const response = await fetch('/api/analyze-blood-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ extractedText, imageBase64, mimeType }),
        });

        if (!response.ok) {
          const errorData = await response.json() as { error?: string; reason?: string };
          throw new Error(errorData.reason ?? errorData.error ?? 'Request failed');
        }

        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        setState({ status: 'analyzing', message: 'Extracting health markers...' });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = JSON.parse(line.slice(6)) as Record<string, unknown>;

            if (data['done'] && data['result']) {
              const result = data['result'] as HealthProfile;
              setHealthProfile(result);
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
    [setHealthProfile]
  );

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, analyze, reset };
}
