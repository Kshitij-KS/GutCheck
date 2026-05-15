'use client';

// components/scan/ScanModeToggle.tsx

import type { ScanMode } from '@/types';
import { Camera, ImageUp, MessageSquare, FileText } from 'lucide-react';

interface ScanModeToggleProps {
  mode: ScanMode;
  onChange: (mode: ScanMode) => void;
}

const MODES: { id: ScanMode; label: string; icon: typeof Camera }[] = [
  { id: 'camera', label: 'Camera', icon: Camera },
  { id: 'menu-upload', label: 'Upload Photo', icon: ImageUp },
  { id: 'quick-query', label: 'Quick Query', icon: MessageSquare },
  { id: 'menu-text', label: 'Paste Menu', icon: FileText },
];

export function ScanModeToggle({ mode, onChange }: ScanModeToggleProps) {
  return (
    <div
      className="flex flex-wrap w-full rounded-xl p-1 gap-1 sm:inline-flex sm:w-auto"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
      role="tablist"
      aria-label="Scan input mode"
    >
      {MODES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={mode === id}
          onClick={() => onChange(id)}
          className="flex flex-1 min-w-[min(100%,7rem)] sm:flex-initial items-center justify-center gap-2 min-h-11 px-3 sm:px-4 rounded-lg text-sm font-medium transition-all"
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
