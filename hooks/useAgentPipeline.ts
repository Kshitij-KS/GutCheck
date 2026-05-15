'use client';

import { useCallback, useState } from 'react';
import { runDeterministicGuardrail } from '@/lib/guardrail/thresholds';
import { parseExtractedMarkers } from '@/lib/parsers/extract.parser';
import type { BloodMarker, GuardrailResult, HealthProfile } from '@/types';

type UnitClarification = 'ng/mL' | 'nmol/L';

type PipelineState =
  | { stage: 'idle' }
  | { stage: 'extracting' }
  | { stage: 'guardrail_checking' }
  | { stage: 'guardrail_blocked'; result: GuardrailResult }
  | {
      stage: 'unit_ambiguous';
      markers: string[];
      pendingMarkers: BloodMarker[];
      reportText: string;
      reportDate: string | null;
      labName: string | null;
    }
  | { stage: 'translating'; streamedText: string }
  | { stage: 'complete'; profile: HealthProfile }
  | { stage: 'error'; message: string };

interface ExtractedForTranslation {
  reportDate: string | null;
  labName: string | null;
  markers: BloodMarker[];
}

export function useAgentPipeline() {
  const [state, setState] = useState<PipelineState>({ stage: 'idle' });

  const runGuardrailAndTranslate = useCallback(async (
    markers: BloodMarker[],
    reportText: string,
    _extracted: ExtractedForTranslation
  ) => {
    const guardrailRes = await fetch('/api/agents/guardrail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        markersJson: JSON.stringify(markers),
        reportText: reportText.slice(0, 500),
      }),
    });
    if (!guardrailRes.ok) {
      throw new Error(await readErrorMessage(guardrailRes, 'Guardrail check failed'));
    }

    const guardrailResult = await guardrailRes.json() as GuardrailResult;
    if (!guardrailResult.passed) {
      setState({ stage: 'guardrail_blocked', result: guardrailResult });
      return;
    }

    setState({ stage: 'translating', streamedText: '' });

    const translateRes = await fetch('/api/agents/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        markersJson: JSON.stringify(markers),
        reportText: reportText.slice(0, 500),
      }),
    });
    if (!translateRes.ok) {
      throw new Error(await readErrorMessage(translateRes, 'Profile translation failed'));
    }

    const profile = await consumeSSEStreamWithUpdates<HealthProfile>(
      translateRes,
      (chunk) => setState((current) => current.stage === 'translating'
        ? { stage: 'translating', streamedText: current.streamedText + chunk }
        : current
      )
    );

    if (!profile) throw new Error('Translation produced no result');
    setState({ stage: 'complete', profile });
  }, []);

  const run = useCallback(async (file: File) => {
    setState({ stage: 'extracting' });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const pdfRes = await fetch('/api/pdf/extract', { method: 'POST', body: formData });
      if (!pdfRes.ok) {
        throw new Error(await readErrorMessage(pdfRes, 'File extraction failed'));
      }

      const pdfData = await pdfRes.json() as {
        text: string;
        base64?: string;
        mimeType?: string;
        source?: string;
      };

      // FIX: pdfData.text is undefined for image sources — always coerce to string
      const reportText = pdfData.text ?? '';

      const extractBody = pdfData.source === 'image'
        ? { text: '', base64: pdfData.base64, mimeType: pdfData.mimeType, source: 'image' }
        : { text: reportText, source: 'pdf' };

      const extractRes = await fetch('/api/agents/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extractBody),
      });
      if (!extractRes.ok) {
        throw new Error(await readErrorMessage(extractRes, 'Extraction failed'));
      }

      const extractedResult = await consumeSSEStream(extractRes);
      if (!extractedResult) throw new Error('Extraction produced no result');

      const extracted = parseExtractedMarkers(JSON.stringify(extractedResult));

      if (extracted.extractionFailed) {
        setState({
          stage: 'error',
          message: "This doesn't look like a blood report. Please upload a lab report PDF or photo.",
        });
        return;
      }

      setState({ stage: 'guardrail_checking' });
      const deterministicResult = runDeterministicGuardrail(extracted.markers);
      if (!deterministicResult.passed) {
        setState({ stage: 'guardrail_blocked', result: deterministicResult });
        return;
      }

      if (extracted.unitAmbiguousMarkers.length > 0) {
        setState({
          stage: 'unit_ambiguous',
          markers: extracted.unitAmbiguousMarkers,
          pendingMarkers: extracted.markers,
          reportText,
          reportDate: extracted.reportDate,
          labName: extracted.labName,
        });
        return;
      }

      await runGuardrailAndTranslate(extracted.markers, reportText, extracted);
    } catch (err) {
      setState({
        stage: 'error',
        message: (err as Error).message || 'Something went wrong. Please try again.',
      });
    }
  }, [runGuardrailAndTranslate]);

  const resolveUnitAmbiguity = useCallback(async (unit: UnitClarification) => {
    if (state.stage !== 'unit_ambiguous') return;

    try {
      setState({ stage: 'guardrail_checking' });

      const markers = state.pendingMarkers.map((marker) => {
        const needsClarification =
          marker.unitAmbiguous ||
          state.markers.includes(marker.id) ||
          state.markers.includes(marker.name);

        if (!needsClarification) return marker;

        return {
          ...marker,
          unit,
          unitAmbiguous: false,
          value: marker.value.includes(unit) ? marker.value : `${marker.value} ${unit}`,
        };
      });

      const deterministicResult = runDeterministicGuardrail(markers);
      if (!deterministicResult.passed) {
        setState({ stage: 'guardrail_blocked', result: deterministicResult });
        return;
      }

      await runGuardrailAndTranslate(markers, state.reportText, {
        markers,
        reportDate: state.reportDate,
        labName: state.labName,
      });
    } catch (err) {
      setState({ stage: 'error', message: (err as Error).message || 'Something went wrong.' });
    }
  }, [runGuardrailAndTranslate, state]);

  return {
    state,
    run,
    resolveUnitAmbiguity,
    reset: () => setState({ stage: 'idle' }),
  };
}

async function consumeSSEStream<T>(res: Response): Promise<T | null> {
  if (!res.body) return null;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let result: T | null = null;
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = JSON.parse(line.slice(6)) as Record<string, unknown>;
      if (payload.done && payload.result) result = payload.result as T;
      if (payload.error) throw new Error(String(payload.error));
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
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = JSON.parse(line.slice(6)) as Record<string, unknown>;
      if (typeof payload.chunk === 'string') onChunk(payload.chunk);
      if (payload.done && payload.result) result = payload.result as T;
      if (payload.error) throw new Error(String(payload.error));
    }
  }

  return result;
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json() as { error?: unknown; message?: unknown };
    if (typeof body.error === 'string') return body.error;
    if (typeof body.message === 'string') return body.message;
    return fallback;
  } catch {
    return fallback;
  }
}
