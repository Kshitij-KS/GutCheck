'use client';

// components/scan/DishResultCard.tsx

import { motion } from 'framer-motion';
import { TrafficLightBadge } from '@/components/shared/TrafficLight';
import type { DishScanResult } from '@/types';
import { Wifi } from 'lucide-react';

interface DishResultCardProps {
  result: DishScanResult;
  delay?: number;
}

export function DishResultCard({ result, delay = 0 }: DishResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      className="gc-card p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p
            className="font-semibold truncate"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}
          >
            {result.dishName}
          </p>
          {result.isOfflineResult && (
            <div className="flex items-center gap-1 mt-0.5">
              <Wifi size={10} style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Offline check</span>
            </div>
          )}
        </div>
        <TrafficLightBadge classification={result.classification} />
      </div>

      <p
        className="text-sm leading-relaxed"
        style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}
      >
        {result.primaryReason}
      </p>

      {result.hiddenIngredients.length > 0 && (
        <div className="mt-3">
          <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            Worth knowing
          </p>
          <div className="flex flex-wrap gap-1.5">
            {result.hiddenIngredients.map((ing) => (
              <span
                key={ing}
                className="px-2 py-0.5 rounded text-xs"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
              >
                {ing}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.modification && (
        <div
          className="mt-3 p-3 rounded-lg text-sm"
          style={{ backgroundColor: 'var(--tl-prioritize-bg)', color: 'var(--tl-prioritize)', fontFamily: 'var(--font-body)' }}
        >
          💡 {result.modification}
        </div>
      )}
    </motion.div>
  );
}
