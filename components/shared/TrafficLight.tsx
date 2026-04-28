'use client';

// components/shared/TrafficLight.tsx
// NEVER shows "AVOID" or "DANGER" to user
// PRIORITIZE → "Great Choice" (sage green)
// MODERATE   → "Have Mindfully" (warm amber)
// AVOID      → "Skip Today" (muted terracotta, opacity-75)
// NEVER red. NEVER numeric scores.

import type { TrafficLight } from '@/types';
import { cn } from '@/lib/utils';

interface TrafficLightBadgeProps {
  classification: TrafficLight;
  className?: string;
}

const CONFIG: Record<TrafficLight, { label: string; className: string }> = {
  PRIORITIZE: {
    label: 'Great Choice',
    className: 'tl-prioritize',
  },
  MODERATE: {
    label: 'Have Mindfully',
    className: 'tl-moderate',
  },
  AVOID: {
    label: 'Skip Today',
    className: 'tl-avoid',
  },
};

export function TrafficLightBadge({ classification, className }: TrafficLightBadgeProps) {
  const config = CONFIG[classification];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {config.label}
    </span>
  );
}
