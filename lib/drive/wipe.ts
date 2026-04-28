// lib/drive/wipe.ts
// Clean Slate Protocol implementation
// Order: clearAll() SYNCHRONOUSLY first → UI is clean → THEN async Drive delete with retry

import type { drive_v3 } from 'googleapis';
import { DRIVE_FILES, DRIVE_SPACE } from './client';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

/**
 * Execute the Clean Slate Protocol:
 * 1. clearAll() is called SYNCHRONOUSLY by the caller BEFORE this function
 * 2. This function handles async Drive deletion with exponential backoff retry
 */
export async function wipeDriveData(drive: drive_v3.Drive): Promise<void> {
  const filenames = Object.values(DRIVE_FILES);

  for (const filename of filenames) {
    await deleteWithRetry(drive, filename, MAX_RETRIES);
  }
}

async function deleteWithRetry(
  drive: drive_v3.Drive,
  filename: string,
  retries: number
): Promise<void> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const fileId = await findFile(drive, filename);
      if (!fileId) return; // File doesn't exist — success

      await drive.files.delete({ fileId });
      return;
    } catch (err) {
      if (attempt === retries - 1) {
        // All retries exhausted — log to console only (never leak to UI)
        console.error(`[GutCheck Drive] Failed to delete ${filename} after ${retries} retries`, err);
        return;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
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
