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

export default function DashboardPage() {
  const router = useRouter();
  const { isOnboarded, healthProfile } = useGutCheckStore();

  useEffect(() => {
    if (!isOnboarded) router.replace('/');
  }, [isOnboarded, router]);

  if (!healthProfile) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <SaveProfilePrompt />
      {/* Profile snapshot */}
      <ProfileSnapshot profile={healthProfile} />

      {/* Tips row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DailyNudge consolidatedRules={healthProfile.consolidatedRules} />
        <SeasonalTip profile={healthProfile} location="" />
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
