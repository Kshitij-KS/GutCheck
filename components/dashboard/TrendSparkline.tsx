'use client';

// components/dashboard/TrendSparkline.tsx
// Only shows if reportHistory.length >= 2
// Recharts LineChart per marker delta

import {
  LineChart, Line, ResponsiveContainer, Tooltip, XAxis,
} from 'recharts';
import type { HealthProfile, ReportHistoryEntry } from '@/types';
import { formatDate } from '@/lib/utils';

interface TrendSparklineProps {
  markerName: string;
  markerId: string;
  history: ReportHistoryEntry[];
  /**
   * The current (latest) profile. Its value is appended as the newest point.
   * Report history only stores PREVIOUS snapshots, so without this the chart
   * would always be missing the most recent report.
   */
  current?: HealthProfile | null;
}

export function TrendSparkline({ markerName, markerId, history, current }: TrendSparklineProps) {
  // Build chronological data points (oldest → newest) from history snapshots.
  const data: { date: string; value: number }[] = [];

  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    if (!entry) continue;

    const marker = entry.profileSnapshot.markers.find((m) => m.id === markerId);
    if (marker?.numericValue != null) {
      data.push({
        date: formatDate(entry.uploadedAt),
        value: marker.numericValue,
      });
    }
  }

  // Append the current profile as the newest point — it is not part of history.
  const currentMarker = current?.markers.find((m) => m.id === markerId);
  if (currentMarker?.numericValue != null) {
    data.push({
      date: formatDate(current!.updatedAt),
      value: currentMarker.numericValue,
    });
  }

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
