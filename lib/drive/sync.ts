// lib/drive/sync.ts
// Drive sync operations: read, write, and conflict resolution
// Local Zustand is ALWAYS the source of truth — Drive is the backup

import type { drive_v3 } from 'googleapis';
import { DRIVE_FILES, DRIVE_SPACE } from './client';
import type { HealthProfile, ReportHistoryEntry } from '@/types';

export interface DriveSyncPayload {
  profile: HealthProfile | null;
  history: ReportHistoryEntry[];
  syncedAt: string;
}

/**
 * Write local data to Drive AppData.
 * Does NOT block UI — called asynchronously after local Zustand update.
 */
export async function syncToDrive(
  drive: drive_v3.Drive,
  payload: DriveSyncPayload
): Promise<void> {
  await writeFileToDrive(drive, DRIVE_FILES.profile, JSON.stringify(payload));
}

/**
 * Read data from Drive AppData.
 * Conflict resolution: if Drive updatedAt > local updatedAt, use Drive data.
 */
export async function loadFromDrive(
  drive: drive_v3.Drive
): Promise<DriveSyncPayload | null> {
  try {
    const content = await readFileFromDrive(drive, DRIVE_FILES.profile);
    if (!content) return null;
    return JSON.parse(content) as DriveSyncPayload;
  } catch {
    return null;
  }
}

async function findFile(
  drive: drive_v3.Drive,
  filename: string
): Promise<string | null> {
  const res = await drive.files.list({
    spaces: DRIVE_SPACE,
    fields: 'files(id, name)',
    q: `name='${filename}'`,
  });

  const files = res.data.files ?? [];
  return files.length > 0 ? (files[0]?.id ?? null) : null;
}

async function readFileFromDrive(
  drive: drive_v3.Drive,
  filename: string
): Promise<string | null> {
  const fileId = await findFile(drive, filename);
  if (!fileId) return null;

  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'text' }
  );

  return res.data as string;
}

async function writeFileToDrive(
  drive: drive_v3.Drive,
  filename: string,
  content: string
): Promise<void> {
  const fileId = await findFile(drive, filename);

  const media = {
    mimeType: 'application/json',
    body: content,
  };

  if (fileId) {
    // Update existing file
    await drive.files.update({ fileId, media });
  } else {
    // Create new file in AppData
    await drive.files.create({
      requestBody: {
        name: filename,
        parents: [DRIVE_SPACE],
      },
      media,
      fields: 'id',
    });
  }
}
