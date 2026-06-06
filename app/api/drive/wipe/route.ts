// app/api/drive/wipe/route.ts
// Protected Drive wipe route — part of Clean Slate Protocol

import { NextRequest, NextResponse } from 'next/server';
import { getDriveAccessToken } from '@/lib/drive-auth';
import { getDriveClient } from '@/lib/drive/client';
import { wipeDriveData } from '@/lib/drive/wipe';
import { logger } from '@/lib/utils';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const accessToken = await getDriveAccessToken(req);
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const drive = getDriveClient(accessToken);
    await wipeDriveData(drive);
    return NextResponse.json({ success: true, wipedAt: new Date().toISOString() });
  } catch (err) {
    logger.error('Drive Wipe', 'Error during drive wipe', err);
    // Return success to client — local data is already cleared (Clean Slate Protocol)
    // The UI shows a subtle "Sync issue — data cleared locally" notice only on repeated failure
    return NextResponse.json({ success: false, error: 'Drive wipe failed — data cleared locally' }, { status: 500 });
  }
}
