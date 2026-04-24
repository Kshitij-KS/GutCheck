'use client';

// components/profile/FoodRulesPanel.tsx

import { useState } from 'react';
import { Ban, AlertCircle, Leaf } from 'lucide-react';
import type { ConsolidatedRules } from '@/types';
import { cn } from '@/lib/utils';

interface FoodRulesPanelProps {
  rules: ConsolidatedRules;
}

type Tab = 'avoid' | 'moderate' | 'prioritize';

const tabs: { key: Tab; label: string; icon: typeof Ban; color: string }[] = [
  { key: 'avoid', label: 'Strictly Avoid', icon: Ban, color: 'text-red-500' },
  { key: 'moderate', label: 'Moderate', icon: AlertCircle, color: 'text-amber-500' },
  { key: 'prioritize', label: 'Prioritize', icon: Leaf, color: 'text-emerald-500' },
];

const tagColors: Record<Tab, string> = {
  avoid: 'bg-red-50 text-red-700 border border-red-100',
  moderate: 'bg-amber-50 text-amber-700 border border-amber-100',
  prioritize: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
};

export function FoodRulesPanel({ rules }: FoodRulesPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('avoid');

  const content: Record<Tab, string[]> = {
    avoid: rules.strictAvoid,
    moderate: rules.moderate,
    prioritize: rules.prioritize,
  };

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-slate-700/50">
        {tabs.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
              activeTab === key
                ? 'border-b-2 border-emerald-500 bg-slate-700/30 text-white'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Icon className={cn('h-4 w-4', activeTab === key ? color : '')} />
            <span className="hidden sm:block">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5">
        {content[activeTab].length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {content[activeTab].map((item) => (
              <span
                key={item}
                className={cn('rounded-full px-3 py-1.5 text-sm font-medium capitalize', tagColors[activeTab])}
              >
                {item}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No specific items in this category.</p>
        )}

        {activeTab === 'avoid' && rules.cuisineGuidance && (
          <div className="mt-5 rounded-lg bg-slate-700/30 border border-slate-600/30 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Cuisine Guidance</p>
            <p className="text-sm text-slate-300 leading-relaxed">{rules.cuisineGuidance}</p>
          </div>
        )}
      </div>
    </div>
  );
}
