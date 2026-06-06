'use client';

// store/ui.store.ts
// Ephemeral UI state (toasts). NOT persisted.

import { create } from 'zustand';

export type ToastVariant = 'success' | 'info' | 'error';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  variant: ToastVariant;
  message: string;
  /** Optional single action (e.g. "Undo"). */
  action?: ToastAction;
  /** ms before auto-dismiss; 0 = sticky until dismissed. */
  duration: number;
}

interface UiStore {
  toasts: Toast[];
  pushToast: (toast: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => string;
  dismissToast: (id: string) => void;
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `t_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export const useUiStore = create<UiStore>()((set) => ({
  toasts: [],
  pushToast: ({ variant, message, action, duration }) => {
    const id = makeId();
    const toast: Toast = {
      id,
      variant,
      message,
      action,
      duration: duration ?? 3500,
    };
    set((s) => ({ toasts: [...s.toasts, toast] }));
    return id;
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Convenience helpers usable from anywhere (components, hooks). */
export const toast = {
  success: (message: string, opts?: { action?: ToastAction; duration?: number }) =>
    useUiStore.getState().pushToast({ variant: 'success', message, ...opts }),
  info: (message: string, opts?: { action?: ToastAction; duration?: number }) =>
    useUiStore.getState().pushToast({ variant: 'info', message, ...opts }),
  error: (message: string, opts?: { action?: ToastAction; duration?: number }) =>
    useUiStore.getState().pushToast({ variant: 'error', message, ...opts }),
};
