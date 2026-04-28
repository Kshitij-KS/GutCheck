'use client';

// components/onboard/GuardrailAlert.tsx
// Non-alarming modal — warm bg, calm icon, shows redirectMessage, NOT a red warning

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import type { GuardrailResult } from '@/types';

interface GuardrailAlertProps {
  result: GuardrailResult;
  onDismiss: () => void;
}

export function GuardrailAlert({ result, onDismiss }: GuardrailAlertProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(28, 26, 23, 0.4)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="gc-card p-8 max-w-md w-full"
        style={{ backgroundColor: 'var(--bg-elevated)' }}
      >
        {/* Icon — calm, not alarming */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: 'var(--tl-moderate-bg)' }}
        >
          <Heart size={22} style={{ color: 'var(--tl-moderate)' }} strokeWidth={1.5} />
        </div>

        <h2
          className="text-xl mb-3"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 500 }}
        >
          A note before we continue
        </h2>

        <p
          className="leading-relaxed mb-6"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '0.95rem' }}
        >
          {result.redirectMessage ?? "Some values in your report need clinical evaluation before dietary guidance would be appropriate. GutCheck works best with reports in a normal clinical range."}
        </p>

        <button
          onClick={onDismiss}
          className="gc-btn-primary w-full"
          style={{ backgroundColor: 'var(--tl-moderate)', fontSize: '0.9rem' }}
        >
          I understand — I&apos;ll speak with my doctor
        </button>
      </motion.div>
    </div>
  );
}
