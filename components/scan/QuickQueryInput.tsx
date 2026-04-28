'use client';

// components/scan/QuickQueryInput.tsx
// CLIENT-SIDE emergency keyword check BEFORE any API call

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertTriangle } from 'lucide-react';
import { checkQuickQuerySafety } from '@/lib/guardrail/symptom-keywords';

interface QuickQueryInputProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
}

export function QuickQueryInput({ onSubmit, isLoading }: QuickQueryInputProps) {
  const [value, setValue] = useState('');
  const [emergencyMessage, setEmergencyMessage] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!value.trim() || isLoading) return;

    // Client-side emergency check — BEFORE any API call
    const safety = checkQuickQuerySafety(value);
    if (!safety.safe) {
      setEmergencyMessage(safety.emergencyResponse ?? null);
      return;
    }

    setEmergencyMessage(null);
    onSubmit(value.trim());
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); setEmergencyMessage(null); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder='e.g., "biryani", "telebhaja", "chole bhature"'
          className="gc-input flex-1"
          disabled={isLoading}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !value.trim()}
          className="gc-btn-primary px-4 flex items-center gap-2 disabled:opacity-50"
        >
          <Send size={14} />
          {isLoading ? 'Checking...' : 'Check'}
        </button>
      </div>

      {emergencyMessage && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{
            backgroundColor: 'var(--tl-avoid-bg)',
            border: '1px solid var(--tl-avoid)',
          }}
        >
          <AlertTriangle size={18} style={{ color: 'var(--tl-avoid)', flexShrink: 0, marginTop: 2 }} />
          <p
            className="text-sm leading-relaxed"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--tl-avoid)' }}
          >
            {emergencyMessage}
          </p>
        </motion.div>
      )}
    </div>
  );
}
