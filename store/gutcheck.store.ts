'use client';

// store/gutcheck.store.ts
// Main Zustand store with persist middleware + devtools
// Increment STORE_VERSION when schema changes — triggers migration

import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import type {
  GutCheckStore,
  HealthProfile,
  ReportHistoryEntry,
  MenuScanResult,
  GroceryAuditResult,
  DriveSync,
  BloodMarker,
  MarkerDelta,
  MarkerStatus,
  DriveSyncPayload,
} from '@/types';

const STORE_VERSION = 1;

function computeTrend(prev: BloodMarker, curr: BloodMarker): 'IMPROVING' | 'WORSENING' | 'STABLE' {
  // LOW / CRITICALLY_LOW are deficiency markers (different axis from ELEVATED/CRITICAL).
  // Use two separate orderings so that status-level comparison is always meaningful.
  const isLowType = curr.status === 'LOW' || curr.status === 'CRITICALLY_LOW'
    || prev.status === 'LOW' || prev.status === 'CRITICALLY_LOW';

  // For HIGH markers (too much of something): lower status index = better
  const highOrder: MarkerStatus[] = ['OPTIMAL', 'BORDERLINE', 'ELEVATED', 'CRITICAL'];
  // For LOW markers (too little of something): closer to OPTIMAL = better
  const lowOrder: MarkerStatus[] = ['OPTIMAL', 'BORDERLINE', 'LOW', 'CRITICALLY_LOW'];

  const order = isLowType ? lowOrder : highOrder;
  const prevIdx = order.indexOf(prev.status);
  const currIdx = order.indexOf(curr.status);

  // Status improved or worsened
  if (prevIdx !== -1 && currIdx !== -1) {
    if (currIdx < prevIdx) return 'IMPROVING';
    if (currIdx > prevIdx) return 'WORSENING';
  }

  // Same status level — check numeric direction
  if (isLowType) {
    // For deficiency markers: higher value = improving (e.g., hemoglobin rising)
    if (curr.numericValue > prev.numericValue * 1.05) return 'IMPROVING';
    if (curr.numericValue < prev.numericValue * 0.95) return 'WORSENING';
  } else {
    // For excess markers: lower value = improving (e.g., LDL falling)
    if (curr.numericValue < prev.numericValue * 0.95) return 'IMPROVING';
    if (curr.numericValue > prev.numericValue * 1.05) return 'WORSENING';
  }

  return 'STABLE';
}

const MAX_REPORT_HISTORY = 50;

function mergeReportHistories(
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

function computeMarkerDeltas(
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

export const useGutCheckStore = create<GutCheckStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        healthProfile: null,
        isOnboarded: false,
        reportHistory: [],
        driveSync: 'offline',
        lastSyncedAt: null,
        scanHistory: [],
        groceryHistory: [],
        scanCountToday: 0,
        lastScanDate: null,

        // Actions
        setHealthProfile: (profile: HealthProfile) => {
          const previous = get().healthProfile;

          if (previous) {
            const entry: ReportHistoryEntry = {
              id: crypto.randomUUID(),
              uploadedAt: new Date().toISOString(),
              reportDate: previous.reportDate,
              profileSnapshot: previous,
              markerDeltas: computeMarkerDeltas(previous.markers, profile.markers),
            };
            set((s) => ({ reportHistory: [entry, ...s.reportHistory] }));
          }

          set({ healthProfile: profile, isOnboarded: true });
        },

        mergeFromDrive: (payload: DriveSyncPayload) => {
          const { healthProfile: localProfile, reportHistory: localHistory } = get();
          const driveProfile = payload.profile;
          const driveHistory = payload.history ?? [];

          if (!driveProfile) return;

          const mergedHistory = mergeReportHistories(localHistory, driveHistory);
          const localUpdated = localProfile?.updatedAt ?? '';
          const driveUpdated = driveProfile.updatedAt ?? '';

          if (!localProfile || driveUpdated > localUpdated) {
            set({
              healthProfile: driveProfile,
              isOnboarded: true,
              reportHistory: mergedHistory,
              lastSyncedAt: payload.syncedAt,
            });
          } else {
            set({ reportHistory: mergedHistory, lastSyncedAt: payload.syncedAt });
          }
        },

        addScanResult: (result: MenuScanResult) =>
          set((s) => ({ scanHistory: [result, ...s.scanHistory].slice(0, 50) })),

        addGroceryResult: (result: GroceryAuditResult) =>
          set((s) => ({ groceryHistory: [result, ...s.groceryHistory].slice(0, 20) })),

        incrementScanCount: () => {
          const todayStr = new Date().toISOString().split('T')[0];
          const { lastScanDate, scanCountToday } = get();
          if (lastScanDate !== todayStr) {
            set({ scanCountToday: 1, lastScanDate: todayStr });
          } else {
            set({ scanCountToday: scanCountToday + 1 });
          }
        },

        setDriveSync: (status: DriveSync) => set({ driveSync: status }),

        clearAll: () =>
          set({
            healthProfile: null,
            isOnboarded: false,
            reportHistory: [],
            driveSync: 'offline',
            lastSyncedAt: null,
            scanHistory: [],
            groceryHistory: [],
            scanCountToday: 0,
            lastScanDate: null,
          }),
      }),
      {
        name: 'gutcheck-v1',
        storage: createJSONStorage(() => localStorage),
        version: STORE_VERSION,
        migrate: (persisted, _version) => {
          // Handle schema migrations here as STORE_VERSION increments
          // v1 → v1: no migration needed
          return persisted as GutCheckStore;
        },
      }
    ),
    { name: 'GutCheck Store' }
  )
);
