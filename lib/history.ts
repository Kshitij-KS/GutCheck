// lib/history.ts
// Pure helpers for report-history trend/delta computation and Drive merge.
// Extracted from the store so they can be unit-tested in isolation.

import type { BloodMarker, MarkerDelta, MarkerStatus, ReportHistoryEntry } from '@/types';

export const MAX_REPORT_HISTORY = 50;

export function computeTrend(
  prev: BloodMarker,
  curr: BloodMarker
): 'IMPROVING' | 'WORSENING' | 'STABLE' {
  // LOW / CRITICALLY_LOW are deficiency markers (different axis from ELEVATED/CRITICAL).
  const isLowType =
    curr.status === 'LOW' ||
    curr.status === 'CRITICALLY_LOW' ||
    prev.status === 'LOW' ||
    prev.status === 'CRITICALLY_LOW';

  const highOrder: MarkerStatus[] = ['OPTIMAL', 'BORDERLINE', 'ELEVATED', 'CRITICAL'];
  const lowOrder: MarkerStatus[] = ['OPTIMAL', 'BORDERLINE', 'LOW', 'CRITICALLY_LOW'];

  const order = isLowType ? lowOrder : highOrder;
  const prevIdx = order.indexOf(prev.status);
  const currIdx = order.indexOf(curr.status);

  if (prevIdx !== -1 && currIdx !== -1) {
    if (currIdx < prevIdx) return 'IMPROVING';
    if (currIdx > prevIdx) return 'WORSENING';
  }

  if (isLowType) {
    if (curr.numericValue > prev.numericValue * 1.05) return 'IMPROVING';
    if (curr.numericValue < prev.numericValue * 0.95) return 'WORSENING';
  } else {
    if (curr.numericValue < prev.numericValue * 0.95) return 'IMPROVING';
    if (curr.numericValue > prev.numericValue * 1.05) return 'WORSENING';
  }

  return 'STABLE';
}

export function computeMarkerDeltas(
  previous: BloodMarker[],
  current: BloodMarker[]
): MarkerDelta[] {
  return current
    .map((curr) => {
      const prev = previous.find((p) => p.id === curr.id);
      if (!prev) return null;
      return {
        markerId: curr.id,
        markerName: curr.name,
        previousValue: prev.numericValue,
        currentValue: curr.numericValue,
        previousStatus: prev.status,
        currentStatus: curr.status,
        trend: computeTrend(prev, curr),
      } satisfies MarkerDelta;
    })
    .filter((d): d is MarkerDelta => d !== null);
}

export function mergeReportHistories(
  local: ReportHistoryEntry[],
  remote: ReportHistoryEntry[]
): ReportHistoryEntry[] {
  const byId = new Map<string, ReportHistoryEntry>();
  for (const e of [...local, ...remote]) {
    const existing = byId.get(e.id);
    if (!existing || e.uploadedAt > existing.uploadedAt) {
      byId.set(e.id, e);
    }
  }
  return [...byId.values()]
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
    .slice(0, MAX_REPORT_HISTORY);
}
