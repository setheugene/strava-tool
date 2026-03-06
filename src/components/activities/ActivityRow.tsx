import { metersToMiles, formatDuration, secondsToPace } from '../../lib/analytics';
import { RoastButton } from './RoastButton';
import type { StravaActivity } from '../../types/strava';

interface Props {
  activity: StravaActivity;
  getValidToken: () => Promise<string | null>;
}

export function ActivityRow({ activity, getValidToken }: Props) {
  const date = new Date(activity.start_date);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const miles = metersToMiles(activity.distance).toFixed(2);
  const duration = formatDuration(activity.moving_time);
  const pace = secondsToPace(activity.moving_time, activity.distance);
  const isGroup = activity.athlete_count > 1;
  const type = activity.sport_type || activity.type;

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">{dateStr}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-900 font-medium">{activity.name}</span>
          {isGroup && (
            <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
              Group
            </span>
          )}
          <RoastButton activity={activity} getValidToken={getValidToken} />
        </div>
        <span className="text-xs text-gray-400">{type}</span>
      </td>
      <td className="py-3 px-4 text-sm text-gray-700 text-right whitespace-nowrap">{miles} mi</td>
      <td className="py-3 px-4 text-sm text-gray-700 text-right whitespace-nowrap">{duration}</td>
      <td className="hidden sm:table-cell py-3 px-4 text-sm text-gray-500 text-right whitespace-nowrap">{pace}/mi</td>
      <td className="hidden sm:table-cell py-3 px-4 text-sm text-gray-400 text-right">{activity.kudos_count}</td>
    </tr>
  );
}
