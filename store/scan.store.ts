'use client';

// store/scan.store.ts
// Ephemeral scan session store — NOT persisted, cleared on page reload

import { create } from 'zustand';
import type { MenuScanResult, ScanMode } from '@/types';

interface ScanStore {
  // Current session
  currentMode: ScanMode;
  isScanning: boolean;
  currentResult: MenuScanResult | null;
  streamingText: string;
  error: string | null;

  // Camera state
  cameraStream: MediaStream | null;
  capturedImage: string | null; // base64

  // Actions
  setMode: (mode: ScanMode) => void;
  setScanning: (scanning: boolean) => void;
  setResult: (result: MenuScanResult) => void;
  appendStreamingText: (text: string) => void;
  clearStreamingText: () => void;
  setCameraStream: (stream: MediaStream | null) => void;
  setCapturedImage: (image: string | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useScanStore = create<ScanStore>()((set) => ({
  currentMode: 'quick-query',
  isScanning: false,
  currentResult: null,
  streamingText: '',
  error: null,
  cameraStream: null,
  capturedImage: null,

  setMode: (mode) => set({ currentMode: mode, currentResult: null, error: null }),
  setScanning: (scanning) => set({ isScanning: scanning }),
  setResult: (result) => set({ currentResult: result, isScanning: false }),
  appendStreamingText: (text) => set((s) => ({ streamingText: s.streamingText + text })),
  clearStreamingText: () => set({ streamingText: '' }),
  setCameraStream: (stream) => set({ cameraStream: stream }),
  setCapturedImage: (image) => set({ capturedImage: image }),
  setError: (error) => set({ error, isScanning: false }),
  reset: () =>
    set({
      isScanning: false,
      currentResult: null,
      streamingText: '',
      error: null,
      capturedImage: null,
    }),
}));
