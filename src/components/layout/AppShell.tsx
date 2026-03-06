import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Dashboard } from '../dashboard/Dashboard';
import { ActivityTable } from '../activities/ActivityTable';
import { useActivities } from '../../hooks/useActivities';
import type { StravaAthlete } from '../../types/strava';

type Tab = 'dashboard' | 'activities';

interface Props {
  athlete: StravaAthlete;
  getValidToken: () => Promise<string | null>;
  onLogout: () => void;
}

export function AppShell({ athlete, getValidToken, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>('dashboard');
  const { activities, syncStatus, syncError, totalFetched, loadFromCache, sync, forceFullRefetch } =
    useActivities(getValidToken);

  useEffect(() => {
    // Load cached data first, then sync new activities
    loadFromCache().then((cached) => {
      if (cached.length === 0) {
        // First time: fetch everything
        forceFullRefetch();
      } else {
        // Incremental sync
        sync();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header athlete={athlete} onLogout={onLogout} />

      <div className="flex flex-1">
        {/* Sidebar — hidden on mobile */}
        <nav className="hidden md:flex md:flex-col w-48 bg-white border-r border-gray-100 p-4 space-y-1">
          <button
            onClick={() => setTab('dashboard')}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg font-medium transition-colors ${
              tab === 'dashboard'
                ? 'bg-orange-50 text-orange-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setTab('activities')}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg font-medium transition-colors ${
              tab === 'activities'
                ? 'bg-orange-50 text-orange-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Activities
          </button>

          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={forceFullRefetch}
              disabled={syncStatus === 'syncing'}
              className="w-full text-left text-xs px-3 py-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed"
            >
              {syncStatus === 'syncing' ? 'Syncing...' : 'Re-sync all'}
            </button>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 max-w-5xl pb-20 md:pb-6">
          {/* Sync status banner */}
          {syncStatus === 'syncing' && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Syncing your activities{totalFetched > 0 ? ` (${totalFetched} fetched)` : ''}...
            </div>
          )}
          {syncStatus === 'error' && syncError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">
              Sync error: {syncError}
            </div>
          )}

          {activities.length === 0 && syncStatus === 'syncing' ? (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
              Fetching your activities for the first time...
            </div>
          ) : (
            <>
              {tab === 'dashboard' && <Dashboard activities={activities} />}
              {tab === 'activities' && <ActivityTable activities={activities} />}
            </>
          )}
        </main>
      </div>

      {/* Bottom tab bar — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-10">
        <button
          onClick={() => setTab('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors ${
            tab === 'dashboard' ? 'text-orange-600' : 'text-gray-400'
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </button>
        <button
          onClick={() => setTab('activities')}
          className={`flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors ${
            tab === 'activities' ? 'text-orange-600' : 'text-gray-400'
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Activities
        </button>
        <button
          onClick={forceFullRefetch}
          disabled={syncStatus === 'syncing'}
          className="flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium text-gray-400 disabled:opacity-40"
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {syncStatus === 'syncing' ? 'Syncing…' : 'Re-sync'}
        </button>
      </nav>
    </div>
  );
}
