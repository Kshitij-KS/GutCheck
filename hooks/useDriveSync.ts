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
  const pushToDrive = useCallback(async () => {
    if (!isAuthenticated || !healthProfile) return;

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
        return;
      }

      if (!res.ok) throw new Error('Sync failed');

      setDriveSync('synced');
    } catch {
      setDriveSync('error');
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

      const localUpdatedAt = healthProfile?.updatedAt ?? '';
      const driveUpdatedAt = driveData.profile.updatedAt ?? '';

      // Conflict resolution: take newer updatedAt
      if (!healthProfile || driveUpdatedAt > localUpdatedAt) {
        useGutCheckStore.getState().setHealthProfile(driveData.profile);
        setDriveSync('synced');
      }
    } catch {
      // Silent failure on pull — local data is authoritative
    }
  }, [isAuthenticated, healthProfile, setDriveSync]);

  const initiateAuth = useCallback(() => {
    void signIn('google');
  }, []);

  return {
    isAuthenticated,
    pushToDrive,
    pullFromDrive,
    initiateAuth,
  };
}
