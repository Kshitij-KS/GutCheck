'use client';

// components/gutcheck/MarkerImpactBadge.tsx

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { MarkerImpact } from '@/types';
import { cn } from '@/lib/utils';

interface MarkerImpactBadgeProps {
  markerName: string;
  impact: MarkerImpact;
  reason: string;
}

const impactConfig = {
  POSITIVE: {
    icon: TrendingUp,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  NEUTRAL: {
    icon: Minus,
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
  NEGATIVE: {
    icon: TrendingDown,
    className: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
};

export function MarkerImpactBadge({ markerName, impact, reason }: MarkerImpactBadgeProps) {
  const config = impactConfig[impact];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-start gap-2 rounded-lg border p-2.5', config.className)}>
      <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
        <div className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold">{markerName}</p>
        <p className="text-xs opacity-75 leading-relaxed">{reason}</p>
      </div>
    </div>
  );
}
