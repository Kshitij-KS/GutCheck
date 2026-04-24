// store/gutcheck.store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GutCheckStore, HealthProfile, MenuAnalysisResult } from '@/types';

export const useGutCheckStore = create<GutCheckStore>()(
  persist(
    (set) => ({
      healthProfile: null,
      isOnboarded: false,
      analysisHistory: [],

      setHealthProfile: (profile: HealthProfile) =>
        set({ healthProfile: profile, isOnboarded: true }),

      addAnalysisResult: (result: MenuAnalysisResult) =>
        set((state) => ({
          analysisHistory: [result, ...state.analysisHistory].slice(0, 20),
        })),

      clearProfile: () =>
        set({ healthProfile: null, isOnboarded: false, analysisHistory: [] }),
    }),
    {
      name: 'gutcheck-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        healthProfile: state.healthProfile,
        isOnboarded: state.isOnboarded,
        analysisHistory: state.analysisHistory,
      }),
    }
  )
);
