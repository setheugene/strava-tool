import { useState, useEffect, useCallback } from 'react';
import {
  LS_CLIENT_ID, LS_CLIENT_SECRET,
  LS_ACCESS_TOKEN, LS_REFRESH_TOKEN, LS_EXPIRES_AT, LS_ATHLETE,
  STRAVA_AUTH_URL, STRAVA_SCOPE,
} from '../lib/constants';
import { refreshToken as apiRefreshToken } from '../lib/strava';
import type { StravaAthlete } from '../types/strava';

export type AuthState = 'no-credentials' | 'no-token' | 'authenticated';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>('no-credentials');
  const [athlete, setAthlete] = useState<StravaAthlete | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const clientId = localStorage.getItem(LS_CLIENT_ID);
    const clientSecret = localStorage.getItem(LS_CLIENT_SECRET);
    const token = localStorage.getItem(LS_ACCESS_TOKEN);
    const athleteJson = localStorage.getItem(LS_ATHLETE);

    if (!clientId || !clientSecret) {
      setAuthState('no-credentials');
      return;
    }
    if (!token) {
      setAuthState('no-token');
      return;
    }
    if (athleteJson) {
      setAthlete(JSON.parse(athleteJson));
    }
    setAccessToken(token);
    setAuthState('authenticated');
  }, []);

  const saveCredentials = useCallback((clientId: string, clientSecret: string) => {
    localStorage.setItem(LS_CLIENT_ID, clientId);
    localStorage.setItem(LS_CLIENT_SECRET, clientSecret);
    setAuthState('no-token');
  }, []);

  const getRedirectUri = () => {
    const base = window.location.origin + window.location.pathname.replace(/\/$/, '');
    return `${base}#/callback`;
  };

  const connectToStrava = useCallback(() => {
    const clientId = localStorage.getItem(LS_CLIENT_ID);
    if (!clientId) return;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: getRedirectUri(),
      response_type: 'code',
      scope: STRAVA_SCOPE,
      approval_prompt: 'auto',
    });
    window.location.href = `${STRAVA_AUTH_URL}?${params}`;
  }, []);

  const saveToken = useCallback((tokenData: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    athlete: StravaAthlete;
  }) => {
    localStorage.setItem(LS_ACCESS_TOKEN, tokenData.access_token);
    localStorage.setItem(LS_REFRESH_TOKEN, tokenData.refresh_token);
    localStorage.setItem(LS_EXPIRES_AT, String(tokenData.expires_at));
    localStorage.setItem(LS_ATHLETE, JSON.stringify(tokenData.athlete));
    setAccessToken(tokenData.access_token);
    setAthlete(tokenData.athlete);
    setAuthState('authenticated');
  }, []);

  const getValidToken = useCallback(async (): Promise<string | null> => {
    const token = localStorage.getItem(LS_ACCESS_TOKEN);
    const expiresAt = Number(localStorage.getItem(LS_EXPIRES_AT) || '0');
    const clientId = localStorage.getItem(LS_CLIENT_ID);
    const clientSecret = localStorage.getItem(LS_CLIENT_SECRET);
    const storedRefreshToken = localStorage.getItem(LS_REFRESH_TOKEN);

    if (!token) return null;

    // Refresh if expired or within 5 minutes of expiry
    const now = Math.floor(Date.now() / 1000);
    if (expiresAt - now < 300 && clientId && clientSecret && storedRefreshToken) {
      try {
        const newTokenData = await apiRefreshToken(storedRefreshToken, clientId, clientSecret);
        saveToken({ ...newTokenData, athlete: JSON.parse(localStorage.getItem(LS_ATHLETE) || '{}') });
        return newTokenData.access_token;
      } catch {
        return token; // fall back to existing token
      }
    }

    return token;
  }, [saveToken]);

  const logout = useCallback(() => {
    localStorage.removeItem(LS_ACCESS_TOKEN);
    localStorage.removeItem(LS_REFRESH_TOKEN);
    localStorage.removeItem(LS_EXPIRES_AT);
    localStorage.removeItem(LS_ATHLETE);
    setAccessToken(null);
    setAthlete(null);
    setAuthState('no-token');
  }, []);

  const clearAll = useCallback(() => {
    localStorage.removeItem(LS_CLIENT_ID);
    localStorage.removeItem(LS_CLIENT_SECRET);
    logout();
    setAuthState('no-credentials');
  }, [logout]);

  return {
    authState,
    athlete,
    accessToken,
    saveCredentials,
    connectToStrava,
    saveToken,
    getValidToken,
    logout,
    clearAll,
  };
}
