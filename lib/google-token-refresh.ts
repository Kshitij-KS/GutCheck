// lib/google-token-refresh.ts — refresh Google OAuth access token using refresh_token

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  error?: string;
  error_description?: string;
}

export async function refreshGoogleAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresAtSec: number;
  refreshToken?: string;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  const json = (await res.json()) as GoogleTokenResponse;
  if (!res.ok || json.error) {
    throw new Error(json.error_description ?? json.error ?? 'Token refresh failed');
  }

  const expiresAtSec = Math.floor(Date.now() / 1000) + (json.expires_in ?? 3600);
  return {
    accessToken: json.access_token,
    expiresAtSec,
    refreshToken: json.refresh_token,
  };
}
