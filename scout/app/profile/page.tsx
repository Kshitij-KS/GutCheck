'use client';

// app/profile/page.tsx

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RefreshCw, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { useState } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { MarkerCard } from '@/components/profile/MarkerCard';
import { FoodRulesPanel } from '@/components/profile/FoodRulesPanel';
import { ProfileCompleteness } from '@/components/profile/ProfileCompleteness';
import { useGutCheckStore } from '@/store/gutcheck.store';
import { formatDate, formatTime } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { healthProfile, analysisHistory, clearProfile } = useGutCheckStore();
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (!healthProfile) {
      router.replace('/onboard');
    }
  }, [healthProfile, router]);

  if (!healthProfile) return null;

  const handleClear = () => {
    if (confirm('Are you sure you want to clear your health profile? All analysis history will be lost.')) {
      clearProfile();
      router.push('/');
    }
  };

  return (
    <PageShell className="py-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-white">Health Profile</h1>
          <p className="mt-1 text-slate-400">
            Created {formatDate(healthProfile.createdAt)}
            {healthProfile.reportDate && ` · Report date: ${healthProfile.reportDate}`}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/onboard"
            className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Update Report
          </Link>
          <button
            onClick={handleClear}
            className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Clear Profile
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="space-y-8">
          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5"
          >
            <h2 className="text-lg font-semibold text-white mb-3">Overview</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{healthProfile.overallSummary}</p>

            {healthProfile.primaryConcerns.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {healthProfile.primaryConcerns.map((concern) => (
                  <span
                    key={concern}
                    className="rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1 text-sm text-orange-300"
                  >
                    {concern}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Food Rules */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Consolidated Food Rules</h2>
            <FoodRulesPanel rules={healthProfile.consolidatedRules} />
          </div>

          {/* Blood Markers */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">
              Blood Markers
              <span className="ml-2 text-sm text-slate-500 font-normal">
                ({healthProfile.markers.length} total · {healthProfile.markers.filter(m => m.status !== 'OPTIMAL').length} flagged)
              </span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {healthProfile.markers.map((marker, index) => (
                <MarkerCard key={marker.id} marker={marker} index={index} />
              ))}
            </div>
          </div>

          {/* Analysis History */}
          {analysisHistory.length > 0 && (
            <div>
              <button
                onClick={() => setHistoryOpen(!historyOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-700/50 bg-slate-800/50 p-4"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-slate-400" />
                  <span className="font-semibold text-white">Analysis History</span>
                  <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                    {analysisHistory.length}
                  </span>
                </div>
                {historyOpen ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>

              {historyOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 space-y-2"
                >
                  {analysisHistory.map((result) => (
                    <div
                      key={result.id}
                      className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{result.menuSource}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {result.cuisineType} · {result.totalDishesAnalyzed} dishes ·{' '}
                            {formatDate(result.analyzedAt)} {formatTime(result.analyzedAt)}
                          </p>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5">
                            {result.recommendations.filter(r => r.classification === 'RECOMMENDED').length} OK
                          </span>
                          <span className="rounded-full bg-red-500/10 text-red-400 px-2 py-0.5">
                            {result.recommendations.filter(r => r.classification === 'AVOID').length} Avoid
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">{result.summary}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <ProfileCompleteness profile={healthProfile} />

          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
            <h3 className="font-semibold text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/gutcheck"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors"
              >
                Scan a Menu
              </Link>
              <Link
                href="/onboard"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 py-2.5 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Update Blood Report
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
