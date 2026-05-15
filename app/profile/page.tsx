'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Cloud, CloudOff, Trash2, UploadCloud } from 'lucide-react';
import { useGutCheckStore } from '@/store/gutcheck.store';
import { formatDate } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { isOnboarded, healthProfile, driveSync, clearAll } = useGutCheckStore();
  const { data: session, status } = useSession();
  const [cleanSlateStep, setCleanSlateStep] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    if (!isOnboarded) router.replace('/');
  }, [isOnboarded, router]);

  const handleCleanSlate = async () => {
    clearAll();

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
                <>
                  <Cloud size={16} style={{ color: 'var(--tl-prioritize)' }} />
                  <span className="text-sm" style={{ color: 'var(--tl-prioritize)', fontFamily: 'var(--font-body)' }}>
                    Synced to Drive
                  </span>
                </>
              ) : driveSync === 'error' ? (
                <>
                  <CloudOff size={16} style={{ color: 'var(--tl-avoid)' }} />
                  <span className="text-sm" style={{ color: 'var(--tl-avoid)', fontFamily: 'var(--font-body)' }}>
                    Sync error - working offline
                  </span>
                </>
              ) : (
                <>
                  <UploadCloud size={16} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                    {driveSync === 'pending' ? 'Syncing...' : 'Not synced yet'}
                  </span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              className="gc-btn-secondary text-sm"
            >
              Disconnect Google Drive
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => void signIn('google')} className="gc-btn-primary flex items-center gap-2">
            <Cloud size={16} />
            Connect Google Drive
          </button>
        )}
      </div>

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
          type="button"
          onClick={() => setCleanSlateStep(1)}
          className="gc-btn-secondary text-sm"
          style={{ borderColor: 'var(--tl-avoid)', color: 'var(--tl-avoid)' }}
        >
          Delete everything
        </button>
      </div>

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
        <button
          type="button"
          onClick={() => router.push('/onboard?replace=1')}
          className="gc-btn-secondary text-sm"
        >
          Upload new report
        </button>
      </div>

      {cleanSlateStep > 0 && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-[rgba(28,26,23,0.35)] p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clean-slate-title"
        >
          <div className="gc-card w-full max-w-md p-6">
            <p className="text-xs font-medium uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>
              Clean Slate
            </p>
            <h2
              id="clean-slate-title"
              className="mt-2 text-2xl"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 500 }}
            >
              {cleanSlateStep === 1 ? 'Delete your local profile?' : 'Final confirmation'}
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
              {cleanSlateStep === 1
                ? 'This clears your profile, report history, menu scans, and grocery audits from this device immediately.'
                : 'This also asks Google Drive to delete the backup if you are connected. This cannot be undone.'}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button type="button" className="gc-btn-secondary min-h-11" onClick={() => setCleanSlateStep(0)}>
                Cancel
              </button>
              {cleanSlateStep === 1 ? (
                <button
                  type="button"
                  className="gc-btn-secondary min-h-11"
                  style={{ borderColor: 'var(--tl-avoid)', color: 'var(--tl-avoid)' }}
                  onClick={() => setCleanSlateStep(2)}
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  className="gc-btn-secondary min-h-11"
                  style={{ borderColor: 'var(--tl-avoid)', color: 'var(--tl-avoid)' }}
                  onClick={() => void handleCleanSlate()}
                >
                  Yes, delete everything
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        {label}
      </span>
      <span className="text-right" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
        {value}
      </span>
    </div>
  );
}
