'use client';

// components/shared/Toast.tsx
// Quiet, auto-dismissing toasts. Uses existing design tokens. Mounted once in AppShell.

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useUiStore, type Toast as ToastType, type ToastVariant } from '@/store/ui.store';

const VARIANT_STYLE: Record<ToastVariant, { bar: string; icon: typeof Info; iconColor: string }> = {
  success: { bar: 'var(--tl-prioritize)', icon: CheckCircle2, iconColor: 'var(--tl-prioritize)' },
  info: { bar: 'var(--tl-moderate)', icon: Info, iconColor: 'var(--tl-moderate)' },
  error: { bar: 'var(--tl-avoid)', icon: AlertTriangle, iconColor: 'var(--tl-avoid)' },
};

function ToastItem({ toast }: { toast: ToastType }) {
  const dismiss = useUiStore((s) => s.dismissToast);
  const { bar, icon: Icon, iconColor } = VARIANT_STYLE[toast.variant];

  useEffect(() => {
    if (toast.duration <= 0) return;
    const t = setTimeout(() => dismiss(toast.id), toast.duration);
    return () => clearTimeout(t);
  }, [toast.id, toast.duration, dismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      role="status"
      aria-live="polite"
      className="gc-card pointer-events-auto relative flex items-start gap-3 overflow-hidden p-3 pr-2"
      style={{ backgroundColor: 'var(--bg-elevated)', minWidth: 260, maxWidth: 380 }}
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ backgroundColor: bar }}
      />
      <Icon size={18} style={{ color: iconColor, flexShrink: 0, marginTop: 1 }} />
      <p
        className="flex-1 text-sm leading-snug"
        style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}
      >
        {toast.message}
      </p>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            dismiss(toast.id);
          }}
          className="text-sm font-medium underline underline-offset-4 px-1"
          style={{ color: 'var(--accent)', fontFamily: 'var(--font-body)' }}
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss notification"
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ color: 'var(--text-muted)' }}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function ToastViewport() {
  const toasts = useUiStore((s) => s.toasts);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:right-4 sm:items-end"
      aria-label="Notifications"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
