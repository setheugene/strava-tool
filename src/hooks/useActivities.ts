import { useState, useCallback } from 'react';
import { fetchActivities } from '../lib/strava';
import { saveActivities, getAllActivities, clearActivities } from '../lib/cache';
import { LS_LAST_SYNCED } from '../lib/constants';
import type { StravaActivity } from '../types/strava';

export type SyncStatus = 'idle' | 'syncing' | 'done' | 'error';

export function useActivities(getValidToken: () => Promise<string | null>) {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [totalFetched, setTotalFetched] = useState(0);

  const loadFromCache = useCallback(async () => {
    const cached = await getAllActivities();
    setActivities(cached);
    return cached;
  }, []);

  const sync = useCallback(async () => {
    setSyncStatus('syncing');
    setSyncError(null);

    try {
      const token = await getValidToken();
      if (!token) throw new Error('Not authenticated');

      const lastSynced = localStorage.getItem(LS_LAST_SYNCED);
      const after = lastSynced ? Number(lastSynced) : undefined;

      const fetched = await fetchActivities(token, after);

      if (fetched.length > 0) {
        await saveActivities(fetched);
        setTotalFetched((n) => n + fetched.length);
      }

      // Update last_synced to now
      localStorage.setItem(LS_LAST_SYNCED, String(Math.floor(Date.now() / 1000)));

      const all = await getAllActivities();
      setActivities(all);
      setSyncStatus('done');
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Sync failed');
      setSyncStatus('error');
    }
  }, [getValidToken]);

  const forceFullRefetch = useCallback(async () => {
    setSyncStatus('syncing');
    setSyncError(null);
    setTotalFetched(0);

    try {
      const token = await getValidToken();
      if (!token) throw new Error('Not authenticated');

      await clearActivities();
      localStorage.removeItem(LS_LAST_SYNCED);

      const fetched = await fetchActivities(token);
      await saveActivities(fetched);

      localStorage.setItem(LS_LAST_SYNCED, String(Math.floor(Date.now() / 1000)));

      setActivities(fetched);
      setTotalFetched(fetched.length);
      setSyncStatus('done');
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Full sync failed');
      setSyncStatus('error');
    }
  }, [getValidToken]);

  return {
    activities,
    syncStatus,
    syncError,
    totalFetched,
    loadFromCache,
    sync,
    forceFullRefetch,
  };
}
