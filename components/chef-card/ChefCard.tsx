'use client';

// components/chef-card/ChefCard.tsx
// Printable card for restaurants/family
// Imperative framing only — never "avoid", just "I eat best with..."
// @media print hides everything else

import { useRef } from 'react';
import { Printer } from 'lucide-react';
import type { ConsolidatedRules } from '@/types';

interface ChefCardProps {
  rules: ConsolidatedRules;
  userName?: string;
}

export function ChefCard({ rules, userName }: ChefCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Print button */}
      <button
        onClick={handlePrint}
        className="gc-btn-secondary flex items-center gap-2 mb-6 no-print"
      >
        <Printer size={14} />
        Print this card
      </button>

      {/* Card */}
      <div
        ref={cardRef}
        className="gc-card p-8 max-w-lg"
        id="chef-card-print"
        style={{ border: '1.5px solid var(--border-strong)' }}
      >
        {/* Header */}
        <div className="mb-6 pb-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2
            className="text-3xl"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 500 }}
          >
            {userName ? `${userName}'s food card` : 'My food card'}
          </h2>
          <p
            className="mt-1 text-sm"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}
          >
            Based on my blood report · GutCheck
          </p>
        </div>

        {/* I eat best with */}
        <div className="mb-5">
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--tl-prioritize)', fontFamily: 'var(--font-body)' }}
          >
            I eat best with
          </p>
          <div className="flex flex-wrap gap-2">
            {rules.prioritize.slice(0, 10).map((item) => (
              <span
                key={item}
                className="px-2.5 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: 'var(--tl-prioritize-bg)',
                  color: 'var(--tl-prioritize)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* I eat mindfully with */}
        {rules.moderate.length > 0 && (
          <div className="mb-5">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--tl-moderate)', fontFamily: 'var(--font-body)' }}
            >
              I eat mindfully with
            </p>
            <div className="flex flex-wrap gap-2">
              {rules.moderate.slice(0, 8).map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: 'var(--tl-moderate-bg)',
                    color: 'var(--tl-moderate)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* I prefer less of */}
        {rules.strictAvoid.length > 0 && (
          <div className="mb-5">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--tl-avoid)', fontFamily: 'var(--font-body)' }}
            >
              I prefer less of
            </p>
            <div className="flex flex-wrap gap-2">
              {rules.strictAvoid.slice(0, 8).map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: 'var(--tl-avoid-bg)',
                    color: 'var(--tl-avoid)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cuisine guidance */}
        {rules.cuisineGuidance && (
          <div
            className="mt-4 p-4 rounded-xl text-sm leading-relaxed border-t pt-4"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {rules.cuisineGuidance}
          </div>
        )}
      </div>
    </div>
  );
}
