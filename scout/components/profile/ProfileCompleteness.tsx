'use client';

// components/profile/ProfileCompleteness.tsx

import type { HealthProfile } from '@/types';

interface ProfileCompletenessProps {
  profile: HealthProfile;
}

export function ProfileCompleteness({ profile }: ProfileCompletenessProps) {
  const checks = [
    { label: 'Blood markers extracted', done: profile.markers.length > 0 },
    { label: 'Food rules generated', done: profile.consolidatedRules.strictAvoid.length > 0 || profile.consolidatedRules.prioritize.length > 0 },
    { label: 'Primary concerns identified', done: profile.primaryConcerns.length > 0 },
    { label: 'Cuisine guidance available', done: !!profile.consolidatedRules.cuisineGuidance },
    { label: 'Overall summary generated', done: !!profile.overallSummary },
  ];

  const completed = checks.filter((c) => c.done).length;
  const percent = Math.round((completed / checks.length) * 100);

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Profile Completeness</h3>
        <span className="text-2xl font-bold text-emerald-400">{percent}%</span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-2 w-full rounded-full bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Checks */}
      <div className="space-y-2">
        {checks.map(({ label, done }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${done ? 'bg-emerald-500' : 'bg-slate-600'}`} />
            <span className={`text-xs ${done ? 'text-slate-300' : 'text-slate-600'}`}>{label}</span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {profile.markers.length} markers · Last updated {new Date(profile.updatedAt).toLocaleDateString('en-IN')}
      </p>
    </div>
  );
}
