'use client';

// components/gutcheck/DishCard.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Star, AlertOctagon, Pencil, Scale } from 'lucide-react';
import type { DishRecommendation } from '@/types';
import { getDishClassificationColor, getScoreBarColor, cn } from '@/lib/utils';
import { MarkerImpactBadge } from './MarkerImpactBadge';

interface DishCardProps {
  dish: DishRecommendation;
  index: number;
  isTopPick?: boolean;
  isWorstPick?: boolean;
}

const classificationIcon = {
  RECOMMENDED: Star,
  CAUTION: AlertOctagon,
  AVOID: AlertOctagon,
};

const classificationLabel = {
  RECOMMENDED: 'Recommended',
  CAUTION: 'Caution',
  AVOID: 'Avoid',
};

export function DishCard({ dish, index, isTopPick, isWorstPick }: DishCardProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = getDishClassificationColor(dish.classification);
  const scoreBarColor = getScoreBarColor(dish.score);
  const Icon = classificationIcon[dish.classification];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        'rounded-xl border p-4 transition-all',
        colors.bg,
        colors.border,
        (isTopPick || isWorstPick) && 'ring-2',
        isTopPick && 'ring-emerald-400/50',
        isWorstPick && 'ring-red-400/50'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={cn('mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg', colors.bg)}>
            <Icon className={cn('h-4 w-4', colors.text)} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={cn('font-semibold truncate', colors.text)}>{dish.name}</h3>
              {isTopPick && (
                <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
                  ⭐ Top Pick
                </span>
              )}
              {isWorstPick && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  ⚠️ Worst Pick
                </span>
              )}
            </div>
            <span className={cn('mt-0.5 inline-block rounded-full border px-2 py-0.5 text-xs font-semibold', colors.badge, colors.border)}>
              {classificationLabel[dish.classification]}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {/* Score */}
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', scoreBarColor)}
                style={{ width: `${dish.score}%` }}
              />
            </div>
            <span className={cn('text-sm font-bold', colors.text)}>{dish.score}</span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg p-1 text-slate-500 hover:text-slate-700 transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Primary reason */}
      <p className={cn('mt-2.5 text-sm leading-relaxed', colors.text, 'opacity-80')}>
        {dish.primaryReason}
      </p>

      {/* Expanded details */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 space-y-4 border-t border-slate-200/50 pt-4"
        >
          {/* Marker impacts */}
          {dish.markerImpacts.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Marker Impacts
              </p>
              <div className="space-y-1.5">
                {dish.markerImpacts.map((impact) => (
                  <MarkerImpactBadge
                    key={impact.markerId}
                    markerName={impact.markerName}
                    impact={impact.impact}
                    reason={impact.reason}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Modification */}
          {dish.modification && (
            <div className="flex items-start gap-2 rounded-lg bg-slate-100/50 border border-slate-200/50 p-3">
              <Pencil className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-slate-500" />
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-0.5">Modification</p>
                <p className="text-xs text-slate-500 leading-relaxed">{dish.modification}</p>
              </div>
            </div>
          )}

          {/* Portion advice */}
          {dish.portionAdvice && (
            <div className="flex items-start gap-2 rounded-lg bg-slate-100/50 border border-slate-200/50 p-3">
              <Scale className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-slate-500" />
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-0.5">Portion Advice</p>
                <p className="text-xs text-slate-500 leading-relaxed">{dish.portionAdvice}</p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
