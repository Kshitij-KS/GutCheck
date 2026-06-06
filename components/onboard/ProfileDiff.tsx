'use client';

// components/onboard/ProfileDiff.tsx
// Before/after review shown when replacing an existing profile.

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, PlusCircle, MinusCircle } from 'lucide-react';
import type { HealthProfile, BloodMarker } from '@/types';

interface ProfileDiffProps {
  previous: HealthProfile;
  next: HealthProfile;
  onConfirm: () => void;
  onCancel: () => void;
}

type Row = {
  id: string;
  name: string;
  prev: number;
  curr: number;
  direction: 'up' | 'down' | 'same';
};

function buildRows(previous: BloodMarker[], next: BloodMarker[]): Row[] {
  return next
    .map((curr) => {
      const prev = previous.find((p) => p.id === curr.id);
      if (!prev) return null;
      const direction =
        curr.numericValue > prev.numericValue ? 'up'
        : curr.numericValue < prev.numericValue ? 'down'
        : 'same';
      return { id: curr.id, name: curr.name, prev: prev.numericValue, curr: curr.numericValue, direction };
    })
    .filter((r): r is Row => r !== null);
}

export function ProfileDiff({ previous, next, onConfirm, onCancel }: ProfileDiffProps) {
  const rows = buildRows(previous.markers, next.markers);
  const added = next.markers.filter((n) => !previous.markers.some((p) => p.id === n.id));
  const removed = previous.markers.filter((p) => !next.markers.some((n) => n.id === p.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="gc-card p-8 max-w-lg mx-auto"
    >
      <h2
        className="text-2xl mb-1"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 500 }}
      >
        Review what changed
      </h2>
      <p className="mb-6 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>
        Compare your new report against your current profile before updating. Your previous profile is kept in history and can be restored.
      </p>

      {rows.length > 0 ? (
        <div className="space-y-2 mb-5">
          {rows.map((row) => {
            const Icon = row.direction === 'up' ? TrendingUp : row.direction === 'down' ? TrendingDown : Minus;
            const color = row.direction === 'same' ? 'var(--text-muted)' : 'var(--text-secondary)';
            return (
              <div key={row.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Icon size={14} style={{ color, flexShrink: 0 }} />
                  <span className="text-sm truncate" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>
                    {row.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{row.prev}</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>→</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{row.curr}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm mb-5" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}>
          No overlapping markers to compare — this report looks quite different from your last one.
        </p>
      )}

      {(added.length > 0 || removed.length > 0) && (
        <div className="mb-6 space-y-1.5">
          {added.length > 0 && (
            <p className="flex items-center gap-2 text-xs" style={{ color: 'var(--tl-prioritize)', fontFamily: 'var(--font-body)' }}>
              <PlusCircle size={13} /> New markers: {added.map((m) => m.name).join(', ')}
            </p>
          )}
          {removed.length > 0 && (
            <p className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              <MinusCircle size={13} /> No longer present: {removed.map((m) => m.name).join(', ')}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={onCancel} className="gc-btn-secondary min-h-12">
          Keep current
        </button>
        <button type="button" onClick={onConfirm} className="gc-btn-primary min-h-12">
          Update my profile
        </button>
      </div>
    </motion.div>
  );
}
