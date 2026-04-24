'use client';

// components/gutcheck/AnalysisStream.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChefHat, ArrowUpDown, SortAsc } from 'lucide-react';
import { useState } from 'react';
import type { MenuAnalysisResult } from '@/types';
import { DishCard } from './DishCard';
import { cn } from '@/lib/utils';

type AnalysisState =
  | { status: 'idle' }
  | { status: 'extracting'; message: string }
  | { status: 'analyzing'; message: string; dishCount?: number }
  | { status: 'done'; result: MenuAnalysisResult }
  | { status: 'error'; message: string };

interface AnalysisStreamProps {
  state: AnalysisState;
  onReset: () => void;
}

type SortMode = 'score' | 'classification';

const classificationOrder = { RECOMMENDED: 0, CAUTION: 1, AVOID: 2 };

export function AnalysisStream({ state, onReset }: AnalysisStreamProps) {
  const [sortMode, setSortMode] = useState<SortMode>('score');

  if (state.status === 'idle') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-700 p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
          <ChefHat className="h-8 w-8 text-slate-600" />
        </div>
        <div>
          <p className="font-semibold text-slate-400">Results will appear here</p>
          <p className="mt-1 text-sm text-slate-600">Paste a menu and click Analyze Menu</p>
        </div>
      </div>
    );
  }

  if (state.status === 'extracting' || state.status === 'analyzing') {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-slate-700/50 bg-slate-800/30 p-8">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
          <div>
            <p className="font-semibold text-white">
              {state.status === 'extracting' ? 'Pass 1: Reading Menu...' : 'Pass 2: Clinical Analysis...'}
            </p>
            <p className="text-sm text-slate-400">{state.message}</p>
          </div>
        </div>

        {state.status === 'analyzing' && state.dishCount != null && (
          <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs text-slate-400">Scoring {state.dishCount} dishes against your blood markers...</p>
            </div>
            {/* Skeleton cards */}
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-slate-700/30 animate-pulse" />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
        <p className="font-semibold text-red-400">Analysis Failed</p>
        <p className="mt-1 text-sm text-slate-400">{state.message}</p>
        <button
          onClick={onReset}
          className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Done — show results
  const { result } = state;

  const sortedDishes = [...result.recommendations].sort((a, b) => {
    if (sortMode === 'score') return b.score - a.score;
    return classificationOrder[a.classification] - classificationOrder[b.classification];
  });

  const recommended = result.recommendations.filter((d) => d.classification === 'RECOMMENDED').length;
  const caution = result.recommendations.filter((d) => d.classification === 'CAUTION').length;
  const avoid = result.recommendations.filter((d) => d.classification === 'AVOID').length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-5"
      >
        {/* Summary card */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-bold text-white text-lg">{result.menuSource}</h2>
              <p className="text-sm text-slate-400">{result.cuisineType} · {result.totalDishesAnalyzed} dishes analyzed</p>
            </div>
            <button
              onClick={onReset}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-700 transition-colors flex-shrink-0"
            >
              New Menu
            </button>
          </div>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed">{result.summary}</p>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{recommended}</p>
              <p className="text-xs text-emerald-600">Recommended</p>
            </div>
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-center">
              <p className="text-2xl font-bold text-amber-400">{caution}</p>
              <p className="text-xs text-amber-600">Caution</p>
            </div>
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
              <p className="text-2xl font-bold text-red-400">{avoid}</p>
              <p className="text-xs text-red-600">Avoid</p>
            </div>
          </div>
        </div>

        {/* Sort controls */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">
            {result.totalDishesAnalyzed} Dishes
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSortMode('score')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                sortMode === 'score'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <ArrowUpDown className="h-3 w-3" /> Score
            </button>
            <button
              onClick={() => setSortMode('classification')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                sortMode === 'classification'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <SortAsc className="h-3 w-3" /> Category
            </button>
          </div>
        </div>

        {/* Dish cards */}
        <div className="space-y-3">
          {sortedDishes.map((dish, index) => (
            <DishCard
              key={dish.id}
              dish={dish}
              index={index}
              isTopPick={dish.name === result.topPick}
              isWorstPick={dish.name === result.worstPick}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
