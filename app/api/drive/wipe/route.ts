// app/api/drive/wipe/route.ts
// Protected Drive wipe route — part of Clean Slate Protocol

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDriveClient } from '@/lib/drive/client';
import { wipeDriveData } from '@/lib/drive/wipe';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const drive = getDriveClient(session.accessToken as string);
    await wipeDriveData(drive);
    return NextResponse.json({ success: true, wipedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[drive/wipe]', (err as Error).message);
    // Return success to client — local data is already cleared (Clean Slate Protocol)
    // The UI shows a subtle "Sync issue — data cleared locally" notice only on repeated failure
    return NextResponse.json({ success: false, error: 'Drive wipe failed — data cleared locally' }, { status: 500 });
  }
}
