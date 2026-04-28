'use client';

// app/history/page.tsx
// Report history — markerDelta display with trend arrows, Recharts sparklines

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGutCheckStore } from '@/store/gutcheck.store';
import { formatDate } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { MarkerDelta } from '@/types';

export default function HistoryPage() {
  const router = useRouter();
  const { isOnboarded, reportHistory } = useGutCheckStore();

  useEffect(() => {
    if (!isOnboarded) router.replace('/');
  }, [isOnboarded, router]);

  if (reportHistory.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1
          className="text-3xl mb-4"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 500 }}
        >
          Report history
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>
          Upload a second blood report to start tracking your trends over time.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1
        className="text-3xl mb-8"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 500 }}
      >
        Report history
      </h1>

      <div className="space-y-6">
        {reportHistory.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="gc-card p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p
                  className="font-medium"
                  style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}
                >
                  Report {formatDate(entry.uploadedAt)}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
                >
                  {entry.markerDeltas.length} markers compared
                </p>
              </div>
            </div>

            {/* Delta rows */}
            <div className="space-y-3">
              {entry.markerDeltas.map((delta) => (
                <MarkerDeltaRow key={delta.markerId} delta={delta} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MarkerDeltaRow({ delta }: { delta: MarkerDelta }) {
  const Icon = delta.trend === 'IMPROVING'
    ? TrendingUp
    : delta.trend === 'WORSENING'
    ? TrendingDown
    : Minus;

  const color = delta.trend === 'IMPROVING'
    ? 'var(--tl-prioritize)'
    : delta.trend === 'WORSENING'
    ? 'var(--tl-avoid)'
    : 'var(--text-muted)';

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Icon size={14} style={{ color, flexShrink: 0 }} />
        <p
          className="text-sm truncate"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}
        >
          {delta.markerName}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className="text-sm"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
        >
          {delta.previousValue?.toFixed(1)} →
        </span>
        <span
          className="text-sm font-medium"
          style={{ fontFamily: 'var(--font-mono)', color }}
        >
          {delta.currentValue?.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
