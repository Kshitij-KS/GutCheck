'use client';

// app/profile/page.tsx
// Clean Slate Protocol + Drive sync settings

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useGutCheckStore } from '@/store/gutcheck.store';
import { formatDate } from '@/lib/utils';
import { Cloud, CloudOff, Trash2, UploadCloud } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { isOnboarded, healthProfile, driveSync, clearAll } = useGutCheckStore();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (!isOnboarded) router.replace('/');
  }, [isOnboarded, router]);

  const handleCleanSlate = async () => {
    const confirmed = window.confirm(
      'This will permanently delete all your data from this device and Google Drive. This cannot be undone. Are you sure?'
    );
    if (!confirmed) return;

    // STEP 1: clearAll() synchronously — UI is clean immediately
    clearAll();

    // STEP 2: async Drive wipe (non-blocking)
    if (session) {
      fetch('/api/drive/wipe', { method: 'POST' }).catch(() => {});
    }

    router.replace('/');
  };

  if (!healthProfile) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
      <h1
        className="text-3xl"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 500 }}
      >
        Profile settings
      </h1>

      {/* Report info */}
      <div className="gc-card p-6">
        <h2
          className="text-lg mb-4"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)', fontWeight: 600 }}
        >
          Your report
        </h2>
        <div className="space-y-2">
          <InfoRow label="Markers extracted" value={String(healthProfile.markers.length)} />
          {healthProfile.reportDate && (
            <InfoRow label="Report date" value={formatDate(healthProfile.reportDate)} />
          )}
          {healthProfile.reportLabName && (
            <InfoRow label="Lab" value={healthProfile.reportLabName} />
          )}
          <InfoRow label="Last updated" value={formatDate(healthProfile.updatedAt)} />
        </div>
      </div>

      {/* Drive sync */}
      <div className="gc-card p-6">
        <h2
          className="text-lg mb-2"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)', fontWeight: 600 }}
        >
          Google Drive backup
        </h2>
        <p
          className="text-sm mb-4 leading-relaxed"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}
        >
          Sync your profile to your private Google Drive AppData folder. Only your device can access it.
        </p>

        {status === 'authenticated' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {driveSync === 'synced' ? (
                <><Cloud size={16} style={{ color: 'var(--tl-prioritize)' }} />
                  <span className="text-sm" style={{ color: 'var(--tl-prioritize)', fontFamily: 'var(--font-body)' }}>
                    Synced to Drive
                  </span></>
              ) : driveSync === 'error' ? (
                <><CloudOff size={16} style={{ color: 'var(--tl-avoid)' }} />
                  <span className="text-sm" style={{ color: 'var(--tl-avoid)', fontFamily: 'var(--font-body)' }}>
                    Sync error — working offline
                  </span></>
              ) : (
                <><UploadCloud size={16} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                    {driveSync === 'pending' ? 'Syncing...' : 'Not synced yet'}
                  </span></>
              )}
            </div>
            <button
              onClick={() => void signOut()}
              className="gc-btn-secondary text-sm"
            >
              Disconnect Google Drive
            </button>
          </div>
        ) : (
          <button onClick={() => void signIn('google')} className="gc-btn-primary flex items-center gap-2">
            <Cloud size={16} />
            Connect Google Drive
          </button>
        )}
      </div>

      {/* Clean Slate Protocol */}
      <div
        className="gc-card p-6"
        style={{ borderColor: 'var(--tl-avoid)', borderWidth: '1px' }}
      >
        <h2
          className="text-lg mb-2 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--tl-avoid)', fontWeight: 600 }}
        >
          <Trash2 size={18} />
          Delete all my data
        </h2>
        <p
          className="text-sm mb-4 leading-relaxed"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}
        >
          Permanently removes all health data from this device and your Google Drive backup. This cannot be undone.
        </p>
        <button
          onClick={() => void handleCleanSlate()}
          className="gc-btn-secondary text-sm"
          style={{ borderColor: 'var(--tl-avoid)', color: 'var(--tl-avoid)' }}
        >
          Delete everything
        </button>
      </div>

      {/* Update report */}
      <div className="gc-card p-6">
        <h2
          className="text-lg mb-2"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)', fontWeight: 600 }}
        >
          Update with a new report
        </h2>
        <p
          className="text-sm mb-4"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}
        >
          Upload a newer blood report to update your profile and track trends over time.
        </p>
        <button onClick={() => router.push('/')} className="gc-btn-secondary text-sm">
          Upload new report
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
        {value}
      </span>
    </div>
  );
}
