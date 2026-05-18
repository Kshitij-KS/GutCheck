'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
  | { stage: 'error'; message: string; stageFailed: string; canRetry: boolean };

const MAX_RETRIES = 2;
const RETRY_DELAYS_MS = [2000, 4000];
const EXTRACT_TIMEOUT_MS = 45_000;
const GUARDRAIL_TIMEOUT_MS = 20_000;
const TRANSLATE_TIMEOUT_MS = 90_000;

function isRetryableError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('parse') ||
    lower.includes('json') ||
    lower.includes('network') ||
    lower.includes('timeout') ||
    lower.includes('failed to fetch') ||
    lower.includes('ai response could not be parsed') ||
    lower.includes('no result') ||
    lower.includes('no response body') ||
    lower.includes('extraction failed') ||
    lower.includes('profile translation failed')
  );
}

function classifyError(err: unknown): { message: string; canRetry: boolean } {
  if ((err as Error)?.name === 'AbortError') {
    return { message: 'Request was cancelled.', canRetry: false };
  }
  const msg = (err as Error)?.message || 'Something went wrong. Please try again.';
  return { message: msg, canRetry: isRetryableError(msg) };
}

export function useAgentPipeline() {
  const [state, setState] = useState<PipelineState>({ stage: 'idle' });
  const abortRef = useRef<AbortController | null>(null);
  const isRunningRef = useRef(false);
  const pendingFileRef = useRef<File | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    isRunningRef.current = false;
    pendingFileRef.current = null;
    setState({ stage: 'idle' });
  }, []);

  const runGuardrailAndTranslate = useCallback(async (
    markers: BloodMarker[],
    reportText: string,
    signal: AbortSignal
  ): Promise<HealthProfile> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

      if (attempt > 0) {
        setState({
          stage: 'error',
          message: `Retrying... (attempt ${attempt + 1} of ${MAX_RETRIES + 1})`,
          stageFailed: 'translate',
          canRetry: false,
        });
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt - 1] ?? 5000));
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
        setState({ stage: 'translating', streamedText: '' });
      }

      try {
        let guardrailResult: GuardrailResult = {
          passed: true,
          criticalMarkers: [],
          emergencySymptomDetected: false,
          specialPopulationDetected: 'none',
          redirectMessage: null,
        };

        try {
          const gc = new AbortController();
          const tid = setTimeout(() => gc.abort(), GUARDRAIL_TIMEOUT_MS);
          const onAbort = () => gc.abort();
          signal.addEventListener('abort', onAbort);

          const guardrailRes = await fetch('/api/agents/guardrail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              markersJson: JSON.stringify(markers),
              reportText: reportText.slice(0, 500),
            }),
            signal: gc.signal,
          });
          clearTimeout(tid);
          signal.removeEventListener('abort', onAbort);

          if (guardrailRes.ok) {
            const parsed = (await guardrailRes.json()) as GuardrailResult;
            guardrailResult = parsed;
          }
        } catch {
          // Guardrail AI failure is non-fatal — deterministic check is the real safety net
        }

        if (!guardrailResult.passed) {
          setState({ stage: 'guardrail_blocked', result: guardrailResult });
          throw new Error('Guardrail blocked');
        }

        const tc = new AbortController();
        const tid2 = setTimeout(() => tc.abort(), TRANSLATE_TIMEOUT_MS);
        const onAbort2 = () => tc.abort();
        signal.addEventListener('abort', onAbort2);

        const translateRes = await fetch('/api/agents/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            markersJson: JSON.stringify(markers),
            reportText: reportText.slice(0, 500),
          }),
          signal: tc.signal,
        });
        clearTimeout(tid2);
        signal.removeEventListener('abort', onAbort2);

        if (!translateRes.ok) {
          throw new Error(await readErrorMessage(translateRes, 'Profile translation failed'));
        }

        const profile = await consumeSSEStreamWithUpdates<HealthProfile>(
          translateRes,
          (chunk) => setState((current) => current.stage === 'translating'
            ? { stage: 'translating', streamedText: current.streamedText + chunk }
            : current
          ),
          signal
        );

        if (!profile) throw new Error('Translation produced no result');
        return profile;
      } catch (err) {
        lastError = err as Error;
        if (lastError.message === 'Guardrail blocked') throw lastError;
        if (!isRetryableError(lastError.message) || attempt === MAX_RETRIES) {
          throw lastError;
        }
      }
    }

    throw lastError ?? new Error('Unknown error');
  }, []);

  const run = useCallback(async (file: File) => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    pendingFileRef.current = file;

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    setState({ stage: 'extracting' });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const pc = new AbortController();
      const ptid = setTimeout(() => pc.abort(), 30_000);
      const onAbortP = () => pc.abort();
      signal.addEventListener('abort', onAbortP);

      const pdfRes = await fetch('/api/pdf/extract', {
        method: 'POST',
        body: formData,
        signal: pc.signal,
      });
      clearTimeout(ptid);
      signal.removeEventListener('abort', onAbortP);

      if (!pdfRes.ok) {
        throw new Error(await readErrorMessage(pdfRes, 'File extraction failed'));
      }

      const pdfData = (await pdfRes.json()) as {
        text: string;
        base64?: string;
        mimeType?: string;
        source?: string;
      };

      const reportText = pdfData.text ?? '';

      const extractBody = pdfData.source === 'image'
        ? { text: '', base64: pdfData.base64, mimeType: pdfData.mimeType, source: 'image' }
        : { text: reportText, source: 'pdf' };

      let extractedResult: Record<string, unknown> | null = null;
      let extractLastErr: Error | null = null;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
        if (attempt > 0) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt - 1] ?? 5000));
          if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
        }

        try {
          const ec = new AbortController();
          const etid = setTimeout(() => ec.abort(), EXTRACT_TIMEOUT_MS);
          const onAbortE = () => ec.abort();
          signal.addEventListener('abort', onAbortE);

          const extractRes = await fetch('/api/agents/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(extractBody),
            signal: ec.signal,
          });
          clearTimeout(etid);
          signal.removeEventListener('abort', onAbortE);

          if (!extractRes.ok) {
            throw new Error(await readErrorMessage(extractRes, 'Extraction failed'));
          }

          extractedResult = await consumeSSEStream(extractRes, signal);
          if (!extractedResult) throw new Error('Extraction produced no result');
          break;
        } catch (err) {
          extractLastErr = err as Error;
          if (!isRetryableError(extractLastErr.message) || attempt === MAX_RETRIES) {
            throw extractLastErr;
          }
        }
      }

      if (!extractedResult) throw extractLastErr ?? new Error('Extraction failed');

      const extracted = parseExtractedMarkers(JSON.stringify(extractedResult));

      if (extracted.extractionFailed) {
        setState({
          stage: 'error',
          message: "This doesn't look like a blood report. Please upload a lab report PDF or photo.",
          stageFailed: 'extract',
          canRetry: false,
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

      const profile = await runGuardrailAndTranslate(extracted.markers, reportText, signal);
      setState({ stage: 'complete', profile });
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      const { message, canRetry } = classifyError(err);
      setState({
        stage: 'error',
        message,
        stageFailed: 'extract',
        canRetry,
      });
    } finally {
      isRunningRef.current = false;
    }
  }, [runGuardrailAndTranslate]);

  const resolveUnitAmbiguity = useCallback(async (unit: UnitClarification) => {
    if (state.stage !== 'unit_ambiguous') return;
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

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

      const profile = await runGuardrailAndTranslate(markers, state.reportText, signal);
      setState({ stage: 'complete', profile });
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      const { message, canRetry } = classifyError(err);
      setState({
        stage: 'error',
        message,
        stageFailed: 'translate',
        canRetry,
      });
    } finally {
      isRunningRef.current = false;
    }
  }, [runGuardrailAndTranslate, state]);

  const retry = useCallback(async () => {
    if (state.stage !== 'error' || !state.canRetry) return;
    if (pendingFileRef.current) {
      void run(pendingFileRef.current);
    }
  }, [state, run]);

  return {
    state,
    run,
    resolveUnitAmbiguity,
    retry,
    reset,
  };
}

async function consumeSSEStream<T>(res: Response, signal?: AbortSignal): Promise<T | null> {
  if (!res.body) return null;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let result: T | null = null;
  let buffer = '';

  try {
    while (true) {
      if (signal?.aborted) break;
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
          if (payload.error) throw new Error(String(payload.error));
        } catch {
          // Skip malformed SSE lines — don't kill the stream
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return result;
}

async function consumeSSEStreamWithUpdates<T>(
  res: Response,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<T | null> {
  if (!res.body) return null;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let result: T | null = null;
  let buffer = '';

  try {
    while (true) {
      if (signal?.aborted) break;
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const payload = JSON.parse(line.slice(6)) as Record<string, unknown>;
          if (typeof payload.chunk === 'string') onChunk(payload.chunk);
          if (payload.done && payload.result) result = payload.result as T;
          if (payload.error) throw new Error(String(payload.error));
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

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { error?: unknown; message?: unknown };
    if (typeof body.error === 'string') return body.error;
    if (typeof body.message === 'string') return body.message;
    return fallback;
  } catch {
    return fallback;
  }
}
