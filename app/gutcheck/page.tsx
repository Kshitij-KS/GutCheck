'use client';

// app/gutcheck/page.tsx

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity, User, ChefHat } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { MenuInput } from '@/components/gutcheck/MenuInput';
import { AnalysisStream } from '@/components/gutcheck/AnalysisStream';
import { useMenuAnalysis } from '@/hooks/useMenuAnalysis';
import { useGutCheckStore } from '@/store/gutcheck.store';
import { getMarkerStatusColor } from '@/lib/utils';

export default function GutcheckPage() {
  const router = useRouter();
  const { healthProfile, isOnboarded } = useGutCheckStore();
  const { state, analyze, reset } = useMenuAnalysis();

  useEffect(() => {
    if (!isOnboarded) {
      router.replace('/onboard');
    }
  }, [isOnboarded, router]);

  if (!healthProfile) return null;

  const nonOptimalCount = healthProfile.markers.filter((m) => m.status !== 'OPTIMAL').length;

  return (
    <PageShell className="py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-emerald-400" />
            GutCheck
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Paste any restaurant menu to see what works for your health profile
          </p>
        </div>

        {/* Active profile indicator */}
        <Link
          href="/profile"
          className="flex items-center gap-2.5 rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 hover:bg-slate-800 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700">
            <User className="h-4 w-4 text-slate-300" />
          </div>
          <div>
            <p className="text-xs font-medium text-white">Active Profile</p>
            <p className="text-xs text-slate-500">{nonOptimalCount} markers flagged</p>
          </div>
        </Link>
      </div>

      {/* Profile quick summary bar */}
      <div className="mb-6 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-slate-500">Watching:</span>
        {healthProfile.markers
          .filter((m) => m.status !== 'OPTIMAL')
          .slice(0, 5)
          .map((marker) => {
            const colors = getMarkerStatusColor(marker.status);
            return (
              <span
                key={marker.id}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${colors.bg} ${colors.text} ${colors.border}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                {marker.name}
              </span>
            );
          })}
        {nonOptimalCount > 5 && (
          <span className="text-xs text-slate-600">+{nonOptimalCount - 5} more</span>
        )}
      </div>

      {/* Split layout */}
      <div className="grid gap-6 lg:grid-cols-[480px_1fr]">
        {/* Left: Input */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h2 className="font-semibold text-white text-sm">Menu Input</h2>
          </div>
          <MenuInput
            onAnalyze={analyze}
            disabled={state.status === 'extracting' || state.status === 'analyzing'}
          />
        </div>

        {/* Right: Results */}
        <div className="min-h-[500px]">
          <AnalysisStream state={state} onReset={reset} />
        </div>
      </div>

      {/* Two-pass explanation */}
      {(state.status === 'extracting' || state.status === 'analyzing') && (
        <div className="mt-6 rounded-lg border border-slate-700/30 bg-slate-800/20 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-slate-300">
              {state.status === 'extracting' ? '1' : '2'}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">
                {state.status === 'extracting'
                  ? 'Pass 1: Extracting dish list from menu...'
                  : 'Pass 2: Running clinical analysis against your blood markers...'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {state.status === 'extracting'
                  ? 'Compressing the menu into a structured dish list for efficient analysis'
                  : 'Scoring each dish against your specific elevated markers and food rules'}
              </p>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
