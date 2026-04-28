'use client';

// components/scan/ScanModeToggle.tsx

import type { ScanMode } from '@/types';
import { Camera, MessageSquare, FileText } from 'lucide-react';

interface ScanModeToggleProps {
  mode: ScanMode;
  onChange: (mode: ScanMode) => void;
}

const MODES: { id: ScanMode; label: string; icon: typeof Camera }[] = [
  { id: 'camera', label: 'Camera', icon: Camera },
  { id: 'quick-query', label: 'Quick Query', icon: MessageSquare },
  { id: 'menu-text', label: 'Paste Menu', icon: FileText },
];

export function ScanModeToggle({ mode, onChange }: ScanModeToggleProps) {
  return (
    <div
      className="inline-flex rounded-xl p-1 gap-1"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      {MODES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            fontFamily: 'var(--font-body)',
            backgroundColor: mode === id ? 'var(--bg-elevated)' : 'transparent',
            color: mode === id ? 'var(--accent)' : 'var(--text-secondary)',
            boxShadow: mode === id ? '0 1px 3px rgba(28,26,23,0.08)' : 'none',
          }}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}
