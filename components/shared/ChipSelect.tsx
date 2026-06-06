'use client';

// components/shared/ChipSelect.tsx
// Toggleable preset pills + optional free-text entry. Matches existing pill styling.

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface ChipSelectProps {
  /** Preset options shown as toggle pills. */
  options: string[];
  /** Currently selected values (may include free-text additions). */
  value: string[];
  onChange: (next: string[]) => void;
  /** Allow free-text additions via an input. */
  allowCustom?: boolean;
  customPlaceholder?: string;
  /** Accent color tokens. Defaults to the "moderate" amber used elsewhere. */
  color?: string;
  bg?: string;
  ariaLabel?: string;
}

export function ChipSelect({
  options,
  value,
  onChange,
  allowCustom = false,
  customPlaceholder = 'Add your own…',
  color = 'var(--tl-moderate)',
  bg = 'var(--tl-moderate-bg)',
  ariaLabel,
}: ChipSelectProps) {
  const [custom, setCustom] = useState('');

  const toggle = (item: string) => {
    if (value.includes(item)) onChange(value.filter((v) => v !== item));
    else onChange([...value, item]);
  };

  const addCustom = () => {
    const v = custom.trim();
    if (!v) return;
    if (!value.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...value, v]);
    setCustom('');
  };

  // Custom values are those not in the preset option list.
  const customValues = value.filter((v) => !options.includes(v));

  return (
    <div role="group" aria-label={ariaLabel}>
      <div className="flex flex-wrap gap-2">
        {options.map((item) => {
          const selected = value.includes(item);
          return (
            <button
              key={item}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(item)}
              className="px-3 py-1.5 rounded-full text-sm transition-colors"
              style={{
                fontFamily: 'var(--font-body)',
                backgroundColor: selected ? bg : 'var(--bg-secondary)',
                color: selected ? color : 'var(--text-secondary)',
                border: `1px solid ${selected ? color : 'var(--border-strong)'}`,
              }}
            >
              {item}
            </button>
          );
        })}

        {/* Free-text values rendered as removable pills */}
        {customValues.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm"
            style={{ fontFamily: 'var(--font-body)', backgroundColor: bg, color, border: `1px solid ${color}` }}
          >
            {item}
            <button
              type="button"
              aria-label={`Remove ${item}`}
              onClick={() => onChange(value.filter((v) => v !== item))}
              className="inline-flex items-center justify-center"
            >
              <X size={13} />
            </button>
          </span>
        ))}
      </div>

      {allowCustom && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder={customPlaceholder}
            aria-label={customPlaceholder}
            className="gc-input flex-1 min-h-10 text-sm"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!custom.trim()}
            aria-label="Add"
            className="gc-btn-secondary px-3 text-sm flex items-center gap-1 disabled:opacity-50"
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      )}
    </div>
  );
}
