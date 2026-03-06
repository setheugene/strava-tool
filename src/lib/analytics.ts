import { METERS_PER_MILE } from './constants';
import type { StravaActivity, ActivityFilters, SortKey, SortDir } from '../types/strava';

export function metersToMiles(meters: number): number {
  return meters / METERS_PER_MILE;
}

export function secondsToPace(seconds: number, meters: number): string {
  if (meters === 0) return '--';
  const milesPerSecond = meters / METERS_PER_MILE / seconds;
  const minutesPerMile = 1 / (milesPerSecond * 60);
  const mins = Math.floor(minutesPerMile);
  const secs = Math.round((minutesPerMile - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getYear(activity: StravaActivity): number {
  return new Date(activity.start_date).getFullYear();
}

function getMonth(activity: StravaActivity): number {
  return new Date(activity.start_date).getMonth(); // 0-11
}

function isRun(activity: StravaActivity): boolean {
  return activity.type === 'Run' || activity.sport_type === 'Run';
}

export function totalMilesThisYear(activities: StravaActivity[]): number {
  const year = new Date().getFullYear();
  return metersToMiles(
    activities
      .filter((a) => isRun(a) && getYear(a) === year)
      .reduce((sum, a) => sum + a.distance, 0)
  );
}

export function totalRunsThisYear(activities: StravaActivity[]): number {
  const year = new Date().getFullYear();
  return activities.filter((a) => isRun(a) && getYear(a) === year).length;
}

export function groupRunMiles(activities: StravaActivity[], year?: number): number {
  return metersToMiles(
    activities
      .filter(
        (a) =>
          isRun(a) &&
          a.athlete_count > 1 &&
          (year === undefined || getYear(a) === year)
      )
      .reduce((sum, a) => sum + a.distance, 0)
  );
}

export function longestRun(activities: StravaActivity[], year?: number): number {
  const runs = activities.filter(
    (a) => isRun(a) && (year === undefined || getYear(a) === year)
  );
  if (runs.length === 0) return 0;
  return metersToMiles(Math.max(...runs.map((a) => a.distance)));
}

export function milesByMonth(activities: StravaActivity[], year: number): number[] {
  const result = new Array(12).fill(0);
  activities
    .filter((a) => isRun(a) && getYear(a) === year)
    .forEach((a) => {
      result[getMonth(a)] += a.distance;
    });
  return result.map(metersToMiles);
}

export function availableYears(activities: StravaActivity[]): number[] {
  const years = new Set(activities.map(getYear));
  return Array.from(years).sort((a, b) => b - a);
}

export function filterActivities(
  activities: StravaActivity[],
  filters: ActivityFilters
): StravaActivity[] {
  return activities.filter((a) => {
    if (filters.year && getYear(a) !== filters.year) return false;
    if (filters.type && filters.type !== 'All') {
      const actType = a.sport_type || a.type;
      if (actType !== filters.type) return false;
    }
    if (filters.groupOnly && a.athlete_count <= 1) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!a.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export function sortActivities(
  activities: StravaActivity[],
  key: SortKey,
  dir: SortDir
): StravaActivity[] {
  const sorted = [...activities].sort((a, b) => {
    let av: number;
    let bv: number;
    if (key === 'start_date') {
      av = new Date(a.start_date).getTime();
      bv = new Date(b.start_date).getTime();
    } else {
      av = a[key] as number;
      bv = b[key] as number;
    }
    return dir === 'asc' ? av - bv : bv - av;
  });
  return sorted;
}
