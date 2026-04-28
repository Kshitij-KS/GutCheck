'use client';

// hooks/useAgentPipeline.ts
// Orchestrates the 3-agent pipeline with full edge-case handling
// Stage order: idle → extracting → guardrail_checking → [unit_ambiguous] → translating → complete

import { useState, useCallback } from 'react';
import { runDeterministicGuardrail } from '@/lib/guardrail/thresholds';
import { parseExtractedMarkers } from '@/lib/parsers/extract.parser';
import type { HealthProfile, GuardrailResult, BloodMarker } from '@/types';
import { useGutCheckStore } from '@/store/gutcheck.store';

type PipelineState =
  | { stage: 'idle' }
  | { stage: 'extracting' }
  | { stage: 'guardrail_checking' }
  | { stage: 'guardrail_blocked'; result: GuardrailResult }
  | { stage: 'unit_ambiguous'; markers: string[] }
  | { stage: 'translating'; streamedText: string }
  | { stage: 'complete'; profile: HealthProfile }
  | { stage: 'error'; message: string };

export function useAgentPipeline() {
  const [state, setState] = useState<PipelineState>({ stage: 'idle' });
  const setHealthProfile = useGutCheckStore((s) => s.setHealthProfile);

  const run = useCallback(async (file: File) => {
    setState({ stage: 'extracting' });

    try {
      // ── Step 1: PDF/Image text extraction ──────────────────────────────────
      const formData = new FormData();
      formData.append('file', file);

      const pdfRes = await fetch('/api/pdf/extract', { method: 'POST', body: formData });
      if (!pdfRes.ok) throw new Error('File extraction failed');

      const pdfData = await pdfRes.json() as { text: string; base64?: string; mimeType?: string; source?: string };

      // ── Step 2: Agent 1 — Marker extraction (streaming) ───────────────────
      const extractBody = pdfData.source === 'image'
        ? { text: '', base64: pdfData.base64, mimeType: pdfData.mimeType, source: 'image' }
        : { text: pdfData.text, source: 'pdf' };

      const extractRes = await fetch('/api/agents/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extractBody),
      });

      const extractedResult = await consumeSSEStream(extractRes);
      if (!extractedResult) throw new Error('Extraction produced no result');

      const extracted = parseExtractedMarkers(JSON.stringify(extractedResult));

      // Check for wrong document
      if (extracted.extractionFailed) {
        setState({ stage: 'error', message: "This doesn't look like a blood report. Please upload a lab report PDF or photo." });
        return;
      }

      // ── Step 3: Deterministic Guardrail (LOCAL, zero API call) ────────────
      setState({ stage: 'guardrail_checking' });
      const deterministicResult = runDeterministicGuardrail(extracted.markers);

      if (!deterministicResult.passed) {
        setState({ stage: 'guardrail_blocked', result: deterministicResult });
        return;
      }

      // ── Step 4: Unit ambiguity check ──────────────────────────────────────
      if (extracted.unitAmbiguousMarkers.length > 0) {
        setState({ stage: 'unit_ambiguous', markers: extracted.unitAmbiguousMarkers });
        // Pipeline pauses here — resumed by resolveUnitAmbiguity()
        return;
      }

      // ── Step 5 + 6: AI Guardrail + Translation ────────────────────────────
      await runGuardrailAndTranslate(extracted.markers, pdfData.text, extracted);
    } catch (err) {
      setState({ stage: 'error', message: (err as Error).message ?? 'Something went wrong. Please try again.' });
    }
  }, []);

  const resolveUnitAmbiguity = useCallback(async (
    markers: BloodMarker[],
    reportText: string
  ) => {
    try {
      const extracted = { markers, reportDate: null, labName: null, extractionFailed: false, unitAmbiguousMarkers: [] };
      await runGuardrailAndTranslate(markers, reportText, extracted);
    } catch (err) {
      setState({ stage: 'error', message: (err as Error).message ?? 'Something went wrong.' });
    }
  }, []);

  async function runGuardrailAndTranslate(
    markers: BloodMarker[],
    reportText: string,
    extracted: { reportDate: string | null; labName: string | null; markers: BloodMarker[] }
  ) {
    // Step 5: Agent 2 — AI Guardrail (non-streaming)
    const guardrailRes = await fetch('/api/agents/guardrail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        markersJson: JSON.stringify(markers),
        reportText: reportText.slice(0, 500),
      }),
    });

    const guardrailResult = await guardrailRes.json() as GuardrailResult;

    if (!guardrailResult.passed) {
      setState({ stage: 'guardrail_blocked', result: guardrailResult });
      return;
    }

    // Step 6: Agent 3 — Translation (streaming)
    setState({ stage: 'translating', streamedText: '' });

    const translateRes = await fetch('/api/agents/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        markersJson: JSON.stringify(markers),
        reportText: reportText.slice(0, 500),
      }),
    });

    const profile = await consumeSSEStreamWithUpdates<HealthProfile>(
      translateRes,
      (chunk) => setState((s) => s.stage === 'translating'
        ? { stage: 'translating', streamedText: s.streamedText + chunk }
        : s
      )
    );

    if (!profile) throw new Error('Translation produced no result');

    // Step 7: Save to Zustand + trigger Drive sync async
    setHealthProfile(profile);
    setState({ stage: 'complete', profile });

    // Async Drive sync (non-blocking, no await)
    triggerDriveSync(profile).catch(() => {
      // Drive sync failure is silent — local data is already saved
    });
  }

  return {
    state,
    run,
    resolveUnitAmbiguity,
    reset: () => setState({ stage: 'idle' }),
  };
}

// ── SSE stream consumers ────────────────────────────────────────────────────────

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
      if (payload.done && payload.result) {
        result = payload.result as T;
      }
      if (payload.error) {
        throw new Error(payload.error as string);
      }
    }
  }

  return result;
}

async function consumeSSEStreamWithUpdates<T>(
  res: Response,
  onChunk: (chunk: string) => void
): Promise<T | null> {
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
      if (payload.chunk) onChunk(payload.chunk as string);
      if (payload.done && payload.result) {
        result = payload.result as T;
      }
      if (payload.error) {
        throw new Error(payload.error as string);
      }
    }
  }

  return result;
}

async function triggerDriveSync(profile: HealthProfile): Promise<void> {
  await fetch('/api/drive/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile,
      history: [],
      syncedAt: new Date().toISOString(),
    }),
  });
}
