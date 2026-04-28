'use client';

// components/dashboard/MarkerGrid.tsx

import { MarkerCard } from './MarkerCard';
import type { BloodMarker } from '@/types';

interface MarkerGridProps {
  markers: BloodMarker[];
}

export function MarkerGrid({ markers }: MarkerGridProps) {
  if (markers.length === 0) return null;

  // Sort: CRITICAL/CRITICALLY_LOW first, then ELEVATED, then others
  const sorted = [...markers].sort((a, b) => {
    const order = { CRITICAL: 0, CRITICALLY_LOW: 1, ELEVATED: 2, LOW: 3, BORDERLINE: 4, OPTIMAL: 5 };
    return (order[a.status] ?? 5) - (order[b.status] ?? 5);
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sorted.map((marker, i) => (
        <MarkerCard key={marker.id} marker={marker} delay={i * 0.05} />
      ))}
    </div>
  );
}
