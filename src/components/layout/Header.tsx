import type { StravaAthlete } from '../../types/strava';

interface Props {
  athlete: StravaAthlete;
  onLogout: () => void;
}

export function Header({ athlete, onLogout }: Props) {
  return (
    <header className="bg-white border-b border-gray-100 px-3 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066l-2.084 4.116z" />
          <path d="M11.094 13.828l2.716-5.372 2.716 5.372h2.759L15.387 8.456l-2.897 5.372h-1.396z" />
        </svg>
        <span className="font-semibold text-gray-900 text-sm">Strava Analytics</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {athlete.profile_medium && (
            <img
              src={athlete.profile_medium}
              alt={`${athlete.firstname} ${athlete.lastname}`}
              className="w-7 h-7 rounded-full object-cover"
            />
          )}
          <span className="hidden sm:block text-sm text-gray-700 font-medium">
            {athlete.firstname} {athlete.lastname}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
