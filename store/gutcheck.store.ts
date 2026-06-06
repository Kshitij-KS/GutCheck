'use client';

// store/gutcheck.store.ts
// Main Zustand store with persist middleware + devtools
// Increment STORE_VERSION when schema changes — triggers migration

import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import {
  computeMarkerDeltas,
  mergeReportHistories,
} from '@/lib/history';
import type {
  GutCheckStore,
  HealthProfile,
  ReportHistoryEntry,
  MenuScanResult,
  GroceryAuditResult,
  DriveSync,
  DriveSyncPayload,
} from '@/types';

const STORE_VERSION = 2;

export const useGutCheckStore = create<GutCheckStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        healthProfile: null,
        isOnboarded: false,
        reportHistory: [],
        location: undefined,
        dietaryPreferences: [],
        allergies: [],
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
             set((s) => ({ reportHistory: [entry, ...(s.reportHistory ?? [])] }));
           }

          set({ healthProfile: profile, isOnboarded: true });
        },

        setLocation: (location: string) => set({ location }),

        setDietaryPreferences: (prefs: string[]) => set({ dietaryPreferences: prefs }),

        setAllergies: (allergies: string[]) => set({ allergies }),

        mergeFromDrive: (payload: DriveSyncPayload) => {
          const { healthProfile: localProfile, reportHistory: localHistory } = get();
          const driveProfile = payload.profile;
          const driveHistory = payload.history ?? [];

          if (!driveProfile) return 'no-remote';

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
            return 'restored';
          }

          set({ reportHistory: mergedHistory, lastSyncedAt: payload.syncedAt });
          return driveUpdated === localUpdated ? 'up-to-date' : 'local-newer';
        },

        restorePreviousProfile: () => {
          const { reportHistory } = get();
          const latest = reportHistory[0];
          if (!latest) return false;
          set({
            healthProfile: latest.profileSnapshot,
            isOnboarded: true,
            reportHistory: reportHistory.slice(1),
          });
          return true;
        },

        addScanResult: (result: MenuScanResult) =>
          set((s) => ({ scanHistory: [result, ...s.scanHistory].slice(0, 50) })),

        addGroceryResult: (result: GroceryAuditResult) =>
          set((s) => ({ groceryHistory: [result, ...s.groceryHistory].slice(0, 20) })),

        removeScanResult: (timestamp: string) =>
          set((s) => ({ scanHistory: s.scanHistory.filter((r) => r.timestamp !== timestamp) })),

        clearScanHistory: () => set({ scanHistory: [] }),

        removeGroceryResult: (timestamp: string) =>
          set((s) => ({ groceryHistory: s.groceryHistory.filter((r) => r.timestamp !== timestamp) })),

        clearGroceryHistory: () => set({ groceryHistory: [] }),

        incrementScanCount: () => {
          const now = new Date();
          // Use the LOCAL calendar date, not UTC — otherwise the daily counter
          // rolls over at UTC midnight instead of the user's midnight.
          const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
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
            location: undefined,
            dietaryPreferences: [],
            allergies: [],
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
          // Defensive, idempotent migration. Backfill fields added in v2 so that
          // stores persisted under v1 load without runtime errors.
          const s = (persisted ?? {}) as Partial<GutCheckStore>;
          return {
            ...s,
            reportHistory: s.reportHistory ?? [],
            scanHistory: s.scanHistory ?? [],
            groceryHistory: s.groceryHistory ?? [],
            dietaryPreferences: s.dietaryPreferences ?? [],
            allergies: s.allergies ?? [],
          } as GutCheckStore;
        },
      }
    ),
    { name: 'GutCheck Store' }
  )
);
