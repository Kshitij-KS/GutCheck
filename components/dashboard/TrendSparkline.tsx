'use client';

// components/dashboard/TrendSparkline.tsx
// Only shows if reportHistory.length >= 2
// Recharts LineChart per marker delta

import {
  LineChart, Line, ResponsiveContainer, Tooltip, XAxis,
} from 'recharts';
import type { ReportHistoryEntry } from '@/types';
import { formatDate } from '@/lib/utils';

interface TrendSparklineProps {
  markerName: string;
  markerId: string;
  history: ReportHistoryEntry[];
}

export function TrendSparkline({ markerName, markerId, history }: TrendSparklineProps) {
  if (history.length < 2) return null;

  // Build data points from history
  const data = history
    .slice()
    .reverse()
    .map((entry) => {
      const marker = entry.profileSnapshot.markers.find((m) => m.id === markerId);
      return {
        date: formatDate(entry.uploadedAt),
        value: marker?.numericValue ?? null,
      };
    })
    .filter((d) => d.value !== null);

  if (data.length < 2) return null;

  return (
    <div className="mt-3">
      <p
        className="text-xs mb-2"
        style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}
      >
        {markerName} trend
      </p>
      <ResponsiveContainer width="100%" height={56}>
        <LineChart data={data}>
          <XAxis dataKey="date" hide />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-primary)',
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--accent)"
            strokeWidth={2}
            dot={{ r: 3, fill: 'var(--accent)' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
