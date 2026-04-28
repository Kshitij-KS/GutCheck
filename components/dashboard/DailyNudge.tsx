'use client';

// components/dashboard/DailyNudge.tsx
// Rotates between movement, hydration, and food tips daily

import { useMemo } from 'react';
import { Droplets, Footprints, Leaf } from 'lucide-react';
import type { ConsolidatedRules } from '@/types';

interface DailyNudgeProps {
  consolidatedRules: ConsolidatedRules;
}

const ICONS = [Footprints, Droplets, Leaf];

export function DailyNudge({ consolidatedRules }: DailyNudgeProps) {
  const nudge = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    const type = dayOfYear % 3;

    if (type === 0 && consolidatedRules.movementGuidance.length > 0) {
      const idx = dayOfYear % consolidatedRules.movementGuidance.length;
      return { text: consolidatedRules.movementGuidance[idx] ?? '', category: 'Move' };
    }

    if (type === 1) {
      return { text: consolidatedRules.hydrationGuidance, category: 'Hydrate' };
    }

    if (consolidatedRules.prioritize.length > 0) {
      const idx = dayOfYear % consolidatedRules.prioritize.length;
      return { text: `Today, focus on adding: ${consolidatedRules.prioritize[idx]}`, category: 'Eat well' };
    }

    return { text: consolidatedRules.cuisineGuidance, category: 'Today' };
  }, [consolidatedRules]);

  if (!nudge.text) return null;

  const Icon = ICONS[['Move', 'Hydrate'].indexOf(nudge.category)] ?? Leaf;

  return (
    <div
      className="gc-card p-5 flex items-start gap-4"
      style={{ backgroundColor: 'var(--tl-prioritize-bg)' }}
    >
      <div
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-elevated)' }}
      >
        <Icon size={18} style={{ color: 'var(--tl-prioritize)' }} strokeWidth={1.5} />
      </div>
      <div>
        <p
          className="text-xs font-medium mb-1"
          style={{ color: 'var(--tl-prioritize)', fontFamily: 'var(--font-body)' }}
        >
          {nudge.category} · Today
        </p>
        <p
          className="text-sm leading-relaxed"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}
        >
          {nudge.text}
        </p>
      </div>
    </div>
  );
}
