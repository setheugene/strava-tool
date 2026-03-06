interface Props {
  onConnect: () => void;
}

export function ConnectPage({ onConnect }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066l-2.084 4.116z" />
            <path d="M11.094 13.828l2.716-5.372 2.716 5.372h2.759L15.387 8.456l-2.897 5.372h-1.396z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Strava Analytics</h1>
        <p className="text-gray-500 text-sm mb-8">
          Authorize this app to read your Strava activities.
        </p>
        <button
          onClick={onConnect}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066l-2.084 4.116z" />
            <path d="M11.094 13.828l2.716-5.372 2.716 5.372h2.759L15.387 8.456l-2.897 5.372h-1.396z" />
          </svg>
          Connect with Strava
        </button>
        <p className="text-xs text-gray-400 mt-4">
          You'll be redirected to Strava to authorize. Only read access is requested.
        </p>
      </div>
    </div>
  );
}
