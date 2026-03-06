import { useState } from 'react';
import { fetchActivityDetail } from '../../lib/strava';
import { generateRoast } from '../../lib/roast';
import type { StravaActivity } from '../../types/strava';

interface Props {
  activity: StravaActivity;
  getValidToken: () => Promise<string | null>;
}

type Status = 'idle' | 'loading' | 'done' | 'error';

export function RoastButton({ activity, getValidToken }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [roast, setRoast] = useState<string | null>(null);

  async function handleRoast() {
    if (status === 'done') {
      setStatus('idle');
      setRoast(null);
      return;
    }
    setStatus('loading');
    try {
      const token = await getValidToken();
      if (!token) throw new Error('No token');
      const splits = await fetchActivityDetail(activity.id, token);
      setRoast(generateRoast(activity, splits));
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        onClick={handleRoast}
        disabled={status === 'loading'}
        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-orange-200 text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {status === 'loading' ? (
          <>
            <span className="w-3 h-3 border border-orange-400 border-t-transparent rounded-full animate-spin" />
            Roasting…
          </>
        ) : status === 'done' ? (
          '✕ close'
        ) : (
          <>🔥 Roast</>
        )}
      </button>

      {status === 'done' && roast && (
        <span className="block text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-lg px-2 py-1.5 max-w-xs italic">
          {roast}
        </span>
      )}

      {status === 'error' && (
        <span className="text-xs text-gray-400">Couldn't load splits.</span>
      )}
    </span>
  );
}
