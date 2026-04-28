'use client';

// components/grocery/GroceryAuditResults.tsx

import { motion } from 'framer-motion';
import { TrafficLightBadge } from '@/components/shared/TrafficLight';
import type { GroceryAuditResult } from '@/types';

interface GroceryAuditResultsProps {
  result: GroceryAuditResult;
}

export function GroceryAuditResults({ result }: GroceryAuditResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Overall guidance */}
      <div className="gc-card p-5">
        <p
          className="text-sm leading-relaxed"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}
        >
          {result.overallGuidance}
        </p>
      </div>

      {/* Item rows */}
      <div className="space-y-3">
        {result.items.map((item, i) => (
          <motion.div
            key={`${item.name}-${i}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="gc-card p-4"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <p
                className="font-medium"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}
              >
                {item.name}
              </p>
              <TrafficLightBadge classification={item.classification} />
            </div>
            <p
              className="text-sm"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}
            >
              {item.reason}
            </p>
            {item.swap && (
              <div
                className="mt-2 p-2.5 rounded-lg text-sm"
                style={{
                  backgroundColor: 'var(--tl-prioritize-bg)',
                  color: 'var(--tl-prioritize)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                ↔ Better option: {item.swap}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
