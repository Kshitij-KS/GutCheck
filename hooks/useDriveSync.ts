'use client';

// hooks/useDriveSync.ts
// Drive sync hook — local write first, async Drive write (non-blocking)
// Token expiry → silent local cache; prompt re-auth

import { useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useGutCheckStore } from '@/store/gutcheck.store';
import type { DriveSyncPayload } from '@/lib/drive/sync';

export function useDriveSync() {
  const { data: session, status } = useSession();
  const { healthProfile, reportHistory, setDriveSync } = useGutCheckStore();

  const isAuthenticated = status === 'authenticated' && !!session;

  /**
   * Push local data to Drive.
   * Caller should NOT await this — fire and forget.
   */
  const pushToDrive = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated || !healthProfile) return false;

    setDriveSync('pending');

    try {
      const payload: DriveSyncPayload = {
        profile: healthProfile,
        history: reportHistory,
        syncedAt: new Date().toISOString(),
      };

      const res = await fetch('/api/drive/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        // Token expired — silent local cache, don't alarm user
        setDriveSync('error');
        return false;
      }

      if (!res.ok) throw new Error('Sync failed');

      setDriveSync('synced');
      return true;
    } catch {
      setDriveSync('error');
      return false;
    }
  }, [isAuthenticated, healthProfile, reportHistory, setDriveSync]);

  /**
   * Pull data from Drive and merge (newer updatedAt wins).
   */
  const pullFromDrive = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const res = await fetch('/api/drive/sync');
      if (!res.ok) return;

      const driveData = await res.json() as DriveSyncPayload | null;
      if (!driveData?.profile) return;

      useGutCheckStore.getState().mergeFromDrive(driveData);
      setDriveSync('synced');
    } catch {
      // Silent failure on pull — local data is authoritative
    }
  }, [isAuthenticated, setDriveSync]);

  /**
   * Explicitly pull from Drive and merge. Returns an outcome the UI can surface.
   */
  const restoreFromDrive = useCallback(async (): Promise<
    'restored' | 'up-to-date' | 'local-newer' | 'no-remote' | 'error'
  > => {
    if (!isAuthenticated) return 'error';
    try {
      const res = await fetch('/api/drive/sync');
      if (!res.ok) return 'error';

      const driveData = (await res.json()) as DriveSyncPayload | null;
      if (!driveData?.profile) return 'no-remote';

      const outcome = useGutCheckStore.getState().mergeFromDrive(driveData);
      setDriveSync('synced');
      return outcome;
    } catch {
      setDriveSync('error');
      return 'error';
    }
  }, [isAuthenticated, setDriveSync]);

  const initiateAuth = useCallback(() => {
    void signIn('google');
  }, []);

  return {
    isAuthenticated,
    pushToDrive,
    pullFromDrive,
    restoreFromDrive,
    initiateAuth,
  };
}
