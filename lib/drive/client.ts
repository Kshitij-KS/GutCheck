// lib/drive/client.ts
// Server-side Google Drive API client — AppData scope only
// Never instantiate in client components

import { google } from 'googleapis';

/**
 * Create an authenticated Drive API client from a user's OAuth access token.
 * Called within API route handlers after extracting the session.
 */
export function getDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  return google.drive({ version: 'v3', auth });
}

export const DRIVE_FILES = {
  profile: 'gutcheck_profile.json',
  history: 'gutcheck_history.json',
} as const;

export const DRIVE_SPACE = 'appDataFolder';
