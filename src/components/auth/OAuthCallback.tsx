import { useEffect, useState } from 'react';
import { exchangeToken } from '../../lib/strava';
import { LS_CLIENT_ID, LS_CLIENT_SECRET } from '../../lib/constants';

interface Props {
  code: string;
  onSuccess: (tokenData: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    athlete: { id: number; firstname: string; lastname: string; profile: string; profile_medium: string };
  }) => void;
  onError: (msg: string) => void;
}

export function OAuthCallback({ code, onSuccess, onError }: Props) {
  const [status, setStatus] = useState('Exchanging authorization code...');

  useEffect(() => {
    const clientId = localStorage.getItem(LS_CLIENT_ID);
    const clientSecret = localStorage.getItem(LS_CLIENT_SECRET);

    if (!clientId || !clientSecret) {
      onError('Missing credentials. Please set up your API credentials again.');
      return;
    }

    exchangeToken(code, clientId, clientSecret)
      .then((tokenData) => {
        setStatus('Connected! Redirecting...');
        onSuccess(tokenData);
      })
      .catch((err: Error) => {
        onError(err.message || 'Failed to connect to Strava.');
      });
  }, [code, onSuccess, onError]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600 text-sm">{status}</p>
      </div>
    </div>
  );
}
