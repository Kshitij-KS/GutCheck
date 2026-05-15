'use client';

// components/dashboard/SeasonalTip.tsx
// Only renders if getSeasonalNudge() returns non-null

import { useMemo } from 'react';
import { Sun } from 'lucide-react';
import { getSeasonalNudge } from '@/lib/cultural/seasonal-nudges';
import type { HealthProfile } from '@/types';

interface SeasonalTipProps {
  profile: HealthProfile;
  /** User's location hint. Defaults to 'India' for pan-India seasonal guidance. */
  location?: string;
}

export function SeasonalTip({ profile, location = 'India' }: SeasonalTipProps) {
  const nudge = useMemo(() => {
    // Use 'India' as the minimum default so pan-India nudges always fire in season
    const loc = location.trim().length > 0 ? location : 'India';
    return getSeasonalNudge(new Date(), loc, profile);
  }, [profile, location]);

  if (!nudge) return null;

  return (
    <div
      className="gc-card p-5 flex items-start gap-4"
      style={{ backgroundColor: 'var(--tl-moderate-bg)' }}
    >
      <div
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-elevated)' }}
      >
        <Sun size={18} style={{ color: 'var(--tl-moderate)' }} strokeWidth={1.5} />
      </div>
      <div>
        <p
          className="text-xs font-medium mb-1"
          style={{ color: 'var(--tl-moderate)', fontFamily: 'var(--font-body)' }}
        >
          Seasonal · Now
        </p>
        <p
          className="text-sm leading-relaxed"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}
        >
          {nudge}
        </p>
      </div>
    </div>
  );
}
