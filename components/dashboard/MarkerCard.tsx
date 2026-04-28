'use client';

// components/dashboard/MarkerCard.tsx
// Blood marker as a card with expandable food rules
// DM Mono for values, status chip, implication, expand chevron → food rules

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { BloodMarker, MarkerStatus } from '@/types';

interface MarkerCardProps {
  marker: BloodMarker;
  delay?: number;
}

const STATUS_COLORS: Record<MarkerStatus, { color: string; bg: string; label: string }> = {
  OPTIMAL:       { color: 'var(--status-optimal)',    bg: 'var(--tl-prioritize-bg)', label: 'Optimal' },
  BORDERLINE:    { color: 'var(--status-borderline)', bg: 'var(--tl-moderate-bg)',   label: 'Borderline' },
  ELEVATED:      { color: 'var(--status-elevated)',   bg: '#FEF0E7',                 label: 'Elevated' },
  CRITICAL:      { color: 'var(--status-critical)',   bg: '#FDECEA',                 label: 'Needs attention' },
  LOW:           { color: 'var(--status-low)',        bg: '#E8F0F7',                 label: 'Low' },
  CRITICALLY_LOW:{ color: 'var(--status-critical)',   bg: '#FDECEA',                 label: 'Very low' },
};

export function MarkerCard({ marker, delay = 0 }: MarkerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = STATUS_COLORS[marker.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      className="gc-card overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Marker name */}
            <p
              className="text-sm font-semibold truncate"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}
            >
              {marker.name}
            </p>

            {/* Value + unit in DM Mono */}
            <div className="mt-1 flex items-baseline gap-1.5">
              <span
                className="text-2xl font-normal"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}
              >
                {marker.value}
              </span>
              {marker.unit && (
                <span
                  className="text-xs"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
                >
                  {marker.unit}
                </span>
              )}
            </div>

            {/* Standard range */}
            <p
              className="mt-1 text-xs"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
            >
              Normal: {marker.standardRange}
            </p>
          </div>

          {/* Status chip */}
          <span
            className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              color: status.color,
              backgroundColor: status.bg,
              fontFamily: 'var(--font-body)',
            }}
          >
            {status.label}
          </span>
        </div>

        {/* Implication */}
        {marker.implication && (
          <p
            className="mt-3 text-sm leading-relaxed"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}
          >
            {marker.implication}
          </p>
        )}

        {/* Expand button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 flex items-center gap-1 text-xs transition-colors"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
        >
          Food guidance
          <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={12} />
          </motion.span>
        </button>
      </div>

      {/* Expandable food rules */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="px-5 pb-5 pt-0 border-t space-y-3"
              style={{ borderColor: 'var(--border)' }}
            >
              <FoodList
                label="Great choices"
                items={marker.foodRules.prioritize}
                colorStyle={{ color: 'var(--tl-prioritize)', bg: 'var(--tl-prioritize-bg)' }}
              />
              <FoodList
                label="Have mindfully"
                items={marker.foodRules.moderate}
                colorStyle={{ color: 'var(--tl-moderate)', bg: 'var(--tl-moderate-bg)' }}
              />
              <FoodList
                label="Skip today"
                items={marker.foodRules.strictAvoid}
                colorStyle={{ color: 'var(--tl-avoid)', bg: 'var(--tl-avoid-bg)' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FoodList({
  label,
  items,
  colorStyle,
}: {
  label: string;
  items: string[];
  colorStyle: { color: string; bg: string };
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <p
        className="text-xs font-medium mb-1.5"
        style={{ color: colorStyle.color, fontFamily: 'var(--font-body)' }}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.slice(0, 7).map((item) => (
          <span
            key={item}
            className="px-2 py-0.5 rounded text-xs"
            style={{
              backgroundColor: colorStyle.bg,
              color: colorStyle.color,
              fontFamily: 'var(--font-body)',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
