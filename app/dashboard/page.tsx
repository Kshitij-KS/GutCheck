'use client';

// app/dashboard/page.tsx

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGutCheckStore } from '@/store/gutcheck.store';
import { ProfileSnapshot } from '@/components/dashboard/ProfileSnapshot';
import { MarkerGrid } from '@/components/dashboard/MarkerGrid';
import { DailyNudge } from '@/components/dashboard/DailyNudge';
import { SeasonalTip } from '@/components/dashboard/SeasonalTip';
import { SaveProfilePrompt } from '@/components/dashboard/SaveProfilePrompt';
import { TrendSparkline } from '@/components/dashboard/TrendSparkline';

export default function DashboardPage() {
  const router = useRouter();
  const { isOnboarded, healthProfile, reportHistory } = useGutCheckStore();

  useEffect(() => {
    if (!isOnboarded) router.replace('/');
  }, [isOnboarded, router]);

  if (!healthProfile) return null;

  // Only show sparklines when the user has uploaded at least 2 reports
  const showSparklines = reportHistory.length >= 2;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <SaveProfilePrompt />

      {/* Profile snapshot */}
      <ProfileSnapshot profile={healthProfile} />

      {/* Tips row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DailyNudge consolidatedRules={healthProfile.consolidatedRules} />
        {/* Pass 'India' default — SeasonalTip defaults to 'India' internally so this is explicit */}
        <SeasonalTip profile={healthProfile} location="India" />
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ScanCard href="/scan" icon="🍽️" label="Scan menu" />
        <ScanCard href="/grocery" icon="🛒" label="Audit grocery list" />
        <ScanCard href="/chef-card" icon="🃏" label="Chef's card" />
        <ScanCard href="/history" icon="📊" label="View history" />
      </div>

      {/* Markers */}
      <div>
        <h2
          className="text-xl mb-4"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 500 }}
        >
          Your markers
        </h2>
        <MarkerGrid markers={healthProfile.markers} />
      </div>

      {/* Trend sparklines — only shown after 2+ reports uploaded */}
      {showSparklines && (
        <div>
          <h2
            className="text-xl mb-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 500 }}
          >
            Trends over time
          </h2>
          <p
            className="text-sm mb-5"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}
          >
            Based on {reportHistory.length} uploaded reports
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthProfile.markers.slice(0, 6).map((marker) => (
              <div key={marker.id} className="gc-card p-4">
                <p
                  className="text-sm font-medium"
                  style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}
                >
                  {marker.name}
                </p>
                <TrendSparkline
                  markerName={marker.name}
                  markerId={marker.id}
                  history={reportHistory}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScanCard({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="gc-card p-5 flex flex-col items-center justify-center gap-2 text-center transition-all hover:scale-105"
      style={{ minHeight: '100px' }}
    >
      <span className="text-2xl">{icon}</span>
      <span
        className="text-sm font-medium"
        style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}
      >
        {label}
      </span>
    </Link>
  );
}
