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
} from '@/types';

const STORE_VERSION = 1;

function computeTrend(prev: BloodMarker, curr: BloodMarker): 'IMPROVING' | 'WORSENING' | 'STABLE' {
  // Status improvement order (lower index = better)
  const statusOrder: MarkerStatus[] = ['OPTIMAL', 'BORDERLINE', 'ELEVATED', 'CRITICAL', 'LOW', 'CRITICALLY_LOW'];
  const prevIdx = statusOrder.indexOf(prev.status);
  const currIdx = statusOrder.indexOf(curr.status);

  if (currIdx < prevIdx) return 'IMPROVING';
  if (currIdx > prevIdx) return 'WORSENING';

  // Same status — check numeric value direction
  const isLowType = curr.status === 'LOW' || curr.status === 'CRITICALLY_LOW';
  if (isLowType) {
    // For low markers: going up is improving
    if (curr.numericValue > prev.numericValue * 1.05) return 'IMPROVING';
    if (curr.numericValue < prev.numericValue * 0.95) return 'WORSENING';
  } else {
    // For high markers: going down is improving
    if (curr.numericValue < prev.numericValue * 0.95) return 'IMPROVING';
    if (curr.numericValue > prev.numericValue * 1.05) return 'WORSENING';
  }

  return 'STABLE';
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
