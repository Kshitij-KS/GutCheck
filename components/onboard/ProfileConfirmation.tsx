'use client';

// components/onboard/ProfileConfirmation.tsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { PreferencesFields } from '@/components/shared/PreferencesFields';
import type { HealthProfile } from '@/types';

interface ProfileConfirmationProps {
  profile: HealthProfile;
  onSave: () => void;
}

export function ProfileConfirmation({ profile, onSave }: ProfileConfirmationProps) {
  const [showPersonalize, setShowPersonalize] = useState(false);
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

      {/* Optional personalization — quiet, collapsible, skippable */}
      <div className="mb-5 rounded-xl" style={{ border: '1px solid var(--border)' }}>
        <button
          type="button"
          aria-expanded={showPersonalize}
          onClick={() => setShowPersonalize((v) => !v)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={15} style={{ color: 'var(--text-muted)' }} />
            <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>
              Personalize your guidance
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              optional
            </span>
          </span>
          <motion.span animate={{ rotate: showPersonalize ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
          </motion.span>
        </button>
        <AnimatePresence>
          {showPersonalize && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs leading-relaxed mb-4 mt-3" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                  Helps tailor menu scans, the Chef&apos;s Card, and seasonal tips. You can change these anytime in your profile.
                </p>
                <PreferencesFields />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button onClick={onSave} className="gc-btn-primary w-full">
        Save my profile
      </button>

      <p
        className="mt-3 text-xs text-center"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
      >
        Saved on your device — your report is processed securely and never stored on our servers
      </p>
    </motion.div>
  );
}
