import { STRAVA_TOKEN_URL, STRAVA_API_BASE } from './constants';
import type { StravaToken, StravaActivity } from '../types/strava';

export async function exchangeToken(
  code: string,
  clientId: string,
  clientSecret: string
): Promise<StravaToken> {
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Token exchange failed');
  }
  return res.json();
}

export async function refreshToken(
  refreshTok: string,
  clientId: string,
  clientSecret: string
): Promise<StravaToken> {
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshTok,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Token refresh failed');
  }
  return res.json();
}

export async function fetchActivities(
  accessToken: string,
  after?: number
): Promise<StravaActivity[]> {
  const all: StravaActivity[] = [];
  let page = 1;

  while (true) {
    const params = new URLSearchParams({
      per_page: '200',
      page: String(page),
    });
    if (after !== undefined) {
      params.set('after', String(after));
    }

    const res = await fetch(`${STRAVA_API_BASE}/athlete/activities?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch activities (page ${page}): ${res.status}`);
    }

    const batch: StravaActivity[] = await res.json();
    if (batch.length === 0) break;
    all.push(...batch);
    page++;

    // Respect Strava rate limits: 200 req/15min
    if (batch.length === 200) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  return all;
}
