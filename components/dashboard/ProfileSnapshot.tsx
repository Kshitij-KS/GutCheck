'use client';

// components/dashboard/ProfileSnapshot.tsx

import type { HealthProfile } from '@/types';
import { formatDate } from '@/lib/utils';

interface ProfileSnapshotProps {
  profile: HealthProfile;
}

export function ProfileSnapshot({ profile }: ProfileSnapshotProps) {
  return (
    <div className="gc-card p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-3xl leading-snug"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 500 }}
          >
            Your wellness snapshot
          </h1>
          {profile.reportDate && (
            <p
              className="mt-1 text-sm"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
            >
              Report dated {formatDate(profile.reportDate)}
              {profile.reportLabName && ` · ${profile.reportLabName}`}
            </p>
          )}
        </div>

        {/* Primary concerns chips */}
        {profile.primaryConcerns.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profile.primaryConcerns.slice(0, 4).map((c) => (
              <span
                key={c}
                className="px-2.5 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: 'var(--tl-moderate-bg)',
                  color: 'var(--tl-moderate)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      <p
        className="mt-4 leading-relaxed"
        style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}
      >
        {profile.overallSummary}
      </p>
    </div>
  );
}
