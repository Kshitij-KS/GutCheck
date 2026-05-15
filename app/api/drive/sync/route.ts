// app/api/drive/sync/route.ts
// Protected Drive sync proxy — requires valid next-auth session
// Pure relay: never stores health data on server

import { NextRequest, NextResponse } from 'next/server';
import { getDriveAccessToken } from '@/lib/drive-auth';
import { getDriveClient } from '@/lib/drive/client';
import { syncToDrive, loadFromDrive } from '@/lib/drive/sync';
import type { DriveSyncPayload } from '@/lib/drive/sync';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const accessToken = await getDriveAccessToken(req);
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const drive = getDriveClient(accessToken);
    const data = await loadFromDrive(drive);
    return NextResponse.json(data ?? { profile: null, history: [] });
  } catch (err) {
    console.error('[drive/sync GET]', (err as Error).message);
    return NextResponse.json({ error: 'Failed to load from Drive' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const accessToken = await getDriveAccessToken(req);
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload: DriveSyncPayload = await req.json();
    const drive = getDriveClient(accessToken);
    await syncToDrive(drive, payload);
    return NextResponse.json({ success: true, syncedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[drive/sync POST]', (err as Error).message);
    return NextResponse.json({ error: 'Failed to sync to Drive' }, { status: 500 });
  }
}
