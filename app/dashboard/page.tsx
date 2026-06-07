'use client';

// app/dashboard/page.tsx

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGutCheckStore } from '@/store/gutcheck.store';
import { ProfileSnapshot } from '@/components/dashboard/ProfileSnapshot';
import { MarkerGrid } from '@/components/dashboard/MarkerGrid';
import { DailyNudge } from '@/components/dashboard/DailyNudge';
import { SeasonalTip } from '@/components/dashboard/SeasonalTip';
import { SaveProfilePrompt } from '@/components/dashboard/SaveProfilePrompt';
import { TrendSparkline } from '@/components/dashboard/TrendSparkline';

// Cap the stagger index so long collections never feel slow. Mirrors the
// `--stagger-max-index: 8` design token and `staggerDelay`'s index cap in
// `lib/motion.ts` (the cap constant is not exported, so the documented max
// index of 8 is used directly).
const STAGGER_MAX_INDEX = 8;

// Single source for the quick-action destinations so they can be mapped with a
// per-item stagger index. Fields/labels unchanged from the prior markup.
const QUICK_ACTIONS = [
  { href: '/scan', icon: '🍽️', label: 'Scan menu' },
  { href: '/grocery', icon: '🛒', label: 'Audit grocery list' },
  { href: '/chef-card', icon: '🃏', label: "Chef's card" },
  { href: '/history', icon: '📊', label: 'View history' },
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const { isOnboarded, healthProfile, reportHistory, location } = useGutCheckStore();

  // Drives the `.gc-enter` JS fallback path (this is a client component): render
  // hidden, then flip to mounted after first paint so the CSS entrance runs even
  // where @starting-style is unsupported. Mirrors SaveProfilePrompt.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOnboarded) router.replace('/');
  }, [isOnboarded, router]);

  if (!healthProfile) return null;

  // Report history stores only PREVIOUS reports; the current one lives in
  // healthProfile. So "2 reports uploaded" means history.length >= 1.
  const showSparklines = reportHistory.length >= 1;
  const totalReports = reportHistory.length + 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <SaveProfilePrompt />

      {/* Profile snapshot */}
      <ProfileSnapshot profile={healthProfile} />

      {/* Tips row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DailyNudge consolidatedRules={healthProfile.consolidatedRules} />
        {/* Uses the user's saved location when set; SeasonalTip falls back to 'India'. */}
        <SeasonalTip profile={healthProfile} location={location && location.trim() ? location : 'India'} />
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {QUICK_ACTIONS.map((action, i) => (
          <ScanCard
            key={action.href}
            href={action.href}
            icon={action.icon}
            label={action.label}
            index={i}
            mounted={mounted}
          />
        ))}
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
            Based on {totalReports} uploaded reports
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthProfile.markers.slice(0, 6).map((marker, i) => (
              <div
                key={marker.id}
                className="gc-card gc-enter p-4"
                data-mounted={mounted}
                style={{ '--gc-stagger-index': Math.min(i, STAGGER_MAX_INDEX) } as CSSProperties}
              >
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
                  current={healthProfile}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScanCard({
  href,
  icon,
  label,
  index,
  mounted,
}: {
  href: string;
  icon: string;
  label: string;
  index: number;
  mounted: boolean;
}) {
  return (
    <Link
      href={href}
      data-mounted={mounted}
      className="gc-card gc-enter gc-interactive p-5 flex flex-col items-center justify-center gap-2 text-center"
      style={{ minHeight: '100px', '--gc-stagger-index': Math.min(index, STAGGER_MAX_INDEX) } as CSSProperties}
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
