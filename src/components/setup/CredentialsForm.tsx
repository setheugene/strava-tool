import { useState } from 'react';

interface Props {
  onSave: (clientId: string, clientSecret: string) => void;
}

export function CredentialsForm({ onSave }: Props) {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientId.trim() && clientSecret.trim()) {
      onSave(clientId.trim(), clientSecret.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066l-2.084 4.116z" />
              <path d="M11.094 13.828l2.716-5.372 2.716 5.372h2.759L15.387 8.456l-2.897 5.372h-1.396z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Strava Analytics</h1>
          <p className="text-gray-500 mt-2 text-sm">Connect your Strava account to get started</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
          <p className="font-medium mb-1">You'll need a Strava API app</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>Go to <strong>strava.com/settings/api</strong></li>
            <li>Create an app (any name/website)</li>
            <li>
              Set the Authorization Callback Domain to:{' '}
              <code className="bg-blue-100 px-1 rounded font-mono text-xs">
                {window.location.hostname}
              </code>
            </li>
            <li>Copy your Client ID and Client Secret below</li>
          </ol>
          <p className="mt-2 text-xs text-blue-600">
            Your credentials are stored only in your browser and never sent to any third party.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client ID
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="e.g. 12345"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Secret
            </label>
            <input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Your client secret"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
}
