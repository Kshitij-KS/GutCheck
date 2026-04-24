'use client';

// components/profile/MarkerCard.tsx

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { BloodMarker } from '@/types';
import { getMarkerStatusColor } from '@/lib/utils';

interface MarkerCardProps {
  marker: BloodMarker;
  index: number;
}

const statusIcon = {
  OPTIMAL: Minus,
  BORDERLINE: TrendingUp,
  ELEVATED: TrendingUp,
  CRITICAL: TrendingUp,
  LOW: TrendingDown,
};

const statusLabel = {
  OPTIMAL: 'Optimal',
  BORDERLINE: 'Borderline',
  ELEVATED: 'Elevated',
  CRITICAL: 'Critical',
  LOW: 'Low',
};

export function MarkerCard({ marker, index }: MarkerCardProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = getMarkerStatusColor(marker.status);
  const Icon = statusIcon[marker.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-xl border p-4 transition-all ${colors.bg} ${colors.border}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${colors.bg}`}>
            <Icon className={`h-4 w-4 ${colors.text}`} />
          </div>
          <div>
            <h3 className={`font-semibold ${colors.text}`}>{marker.name}</h3>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {marker.value}
              </span>
              <span className="text-sm text-slate-500">{marker.unit}</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">Normal: {marker.normalRange}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
            {statusLabel[marker.status]}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg p-1 text-slate-500 hover:text-slate-700 transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Implication */}
      <p className="mt-3 text-sm text-slate-600 leading-relaxed">{marker.implication}</p>

      {/* Expanded food rules */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 space-y-3 pt-4 border-t border-slate-200/50"
        >
          {marker.foodRules.strictAvoid.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-red-600 uppercase tracking-wide">Strictly Avoid</p>
              <div className="flex flex-wrap gap-1.5">
                {marker.foodRules.strictAvoid.map((food) => (
                  <span key={food} className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">{food}</span>
                ))}
              </div>
            </div>
          )}
          {marker.foodRules.moderate.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-amber-600 uppercase tracking-wide">Moderate</p>
              <div className="flex flex-wrap gap-1.5">
                {marker.foodRules.moderate.map((food) => (
                  <span key={food} className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">{food}</span>
                ))}
              </div>
            </div>
          )}
          {marker.foodRules.prioritize.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-emerald-600 uppercase tracking-wide">Prioritize</p>
              <div className="flex flex-wrap gap-1.5">
                {marker.foodRules.prioritize.map((food) => (
                  <span key={food} className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">{food}</span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
