import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { CredentialsForm } from './components/setup/CredentialsForm';
import { ConnectPage } from './components/auth/ConnectPage';
import { OAuthCallback } from './components/auth/OAuthCallback';
import { AppShell } from './components/layout/AppShell';

function getHash() {
  return window.location.hash || '#/';
}

function parseCallback(hash: string): string | null {
  // hash looks like: #/callback?code=abc&scope=...
  if (!hash.startsWith('#/callback')) return null;
  const queryStr = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
  const params = new URLSearchParams(queryStr);
  return params.get('code');
}

export default function App() {
  const auth = useAuth();
  const [hash, setHash] = useState(getHash);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setHash(getHash());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const handleOAuthSuccess = useCallback(
    (tokenData: Parameters<typeof auth.saveToken>[0]) => {
      auth.saveToken(tokenData);
      window.location.hash = '#/';
    },
    [auth]
  );

  const handleOAuthError = useCallback((msg: string) => {
    setError(msg);
    window.location.hash = '#/';
  }, []);

  // OAuth callback route
  const callbackCode = parseCallback(hash);
  if (callbackCode) {
    return (
      <OAuthCallback
        code={callbackCode}
        onSuccess={handleOAuthSuccess}
        onError={handleOAuthError}
      />
    );
  }

  // Error state (e.g., failed OAuth)
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <p className="text-red-600 font-medium mb-2">Connection Error</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => { setError(null); window.location.hash = '#/'; }}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (auth.authState === 'no-credentials') {
    return <CredentialsForm onSave={auth.saveCredentials} />;
  }

  if (auth.authState === 'no-token') {
    return <ConnectPage onConnect={auth.connectToStrava} />;
  }

  if (auth.authState === 'authenticated' && auth.athlete) {
    return (
      <AppShell
        athlete={auth.athlete}
        getValidToken={auth.getValidToken}
        onLogout={auth.logout}
      />
    );
  }

  // Loading / transitional state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
