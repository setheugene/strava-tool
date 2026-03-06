import { useMemo } from 'react';
import {
  totalMilesThisYear,
  totalRunsThisYear,
  totalMilesRidden,
  totalRidesThisYear,
  totalElevationRunning,
  totalElevationRiding,
  longestRide,
  groupActivityMiles,
  longestRun,
  milesByMonth,
  availableYears,
} from '../lib/analytics';
import type { StravaActivity } from '../types/strava';

export function useAnalytics(activities: StravaActivity[], selectedYear?: number) {
  const currentYear = new Date().getFullYear();
  const year = selectedYear ?? currentYear;

  const years = useMemo(() => availableYears(activities), [activities]);

  const stats = useMemo(
    () => ({
      totalMilesThisYear: totalMilesThisYear(activities, year),
      totalRunsThisYear: totalRunsThisYear(activities, year),
      totalMilesRidden: totalMilesRidden(activities, year),
      totalRidesThisYear: totalRidesThisYear(activities, year),
      elevationRunning: totalElevationRunning(activities, year),
      elevationRiding: totalElevationRiding(activities, year),
      longestRide: longestRide(activities, year),
      groupMiles: groupActivityMiles(activities, year),
      longestRun: longestRun(activities, year),
    }),
    [activities, year]
  );

  const monthly = useMemo(() => milesByMonth(activities, year), [activities, year]);

  return { stats, monthly, years };
}
