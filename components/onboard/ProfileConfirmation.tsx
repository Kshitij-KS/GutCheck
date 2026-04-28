'use client';

// components/onboard/ProfileConfirmation.tsx

import { motion } from 'framer-motion';
import type { HealthProfile } from '@/types';

interface ProfileConfirmationProps {
  profile: HealthProfile;
  onSave: () => void;
}

export function ProfileConfirmation({ profile, onSave }: ProfileConfirmationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="gc-card p-8 max-w-lg mx-auto"
    >
      <h2
        className="text-2xl mb-2"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 500 }}
      >
        Your profile is ready
      </h2>

      <p
        className="mb-6 leading-relaxed"
        style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}
      >
        {profile.overallSummary}
      </p>

      <div className="mb-6 space-y-3">
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          {profile.markers.length} markers extracted
        </p>
        {profile.primaryConcerns.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profile.primaryConcerns.slice(0, 4).map((c) => (
              <span
                key={c}
                className="px-2.5 py-0.5 rounded-full text-xs"
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

      <button onClick={onSave} className="gc-btn-primary w-full">
        Save my profile
      </button>

      <p
        className="mt-3 text-xs text-center"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
      >
        Saved locally on your device — never sent to any server
      </p>
    </motion.div>
  );
}
