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

const RIDE_TYPES = new Set(['Ride', 'VirtualRide', 'EBikeRide', 'MountainBikeRide', 'GravelRide']);

function isRide(activity: StravaActivity): boolean {
  return RIDE_TYPES.has(activity.sport_type) || RIDE_TYPES.has(activity.type);
}

export function totalMilesThisYear(activities: StravaActivity[], year: number): number {
  return metersToMiles(
    activities
      .filter((a) => isRun(a) && getYear(a) === year)
      .reduce((sum, a) => sum + a.distance, 0)
  );
}

export function totalRunsThisYear(activities: StravaActivity[], year: number): number {
  return activities.filter((a) => isRun(a) && getYear(a) === year).length;
}

export function totalMilesRidden(activities: StravaActivity[], year: number): number {
  return metersToMiles(
    activities
      .filter((a) => isRide(a) && getYear(a) === year)
      .reduce((sum, a) => sum + a.distance, 0)
  );
}

export function totalRidesThisYear(activities: StravaActivity[], year: number): number {
  return activities.filter((a) => isRide(a) && getYear(a) === year).length;
}

export function longestRide(activities: StravaActivity[], year?: number): { miles: number; id: number | null } {
  const rides = activities.filter(
    (a) => isRide(a) && (year === undefined || getYear(a) === year)
  );
  if (rides.length === 0) return { miles: 0, id: null };
  const best = rides.reduce((a, b) => (a.distance >= b.distance ? a : b));
  return { miles: metersToMiles(best.distance), id: best.id };
}

function metersToFeet(m: number): number {
  return m * 3.28084;
}

export function totalElevationRunning(activities: StravaActivity[], year: number): number {
  return metersToFeet(
    activities
      .filter((a) => isRun(a) && getYear(a) === year)
      .reduce((sum, a) => sum + a.total_elevation_gain, 0)
  );
}

export function totalElevationRiding(activities: StravaActivity[], year: number): number {
  return metersToFeet(
    activities
      .filter((a) => isRide(a) && getYear(a) === year)
      .reduce((sum, a) => sum + a.total_elevation_gain, 0)
  );
}

export function groupActivityMiles(activities: StravaActivity[], year?: number): number {
  return metersToMiles(
    activities
      .filter(
        (a) =>
          a.athlete_count > 1 &&
          (year === undefined || getYear(a) === year)
      )
      .reduce((sum, a) => sum + a.distance, 0)
  );
}

export function longestRun(activities: StravaActivity[], year?: number): { miles: number; id: number | null } {
  const runs = activities.filter(
    (a) => isRun(a) && (year === undefined || getYear(a) === year)
  );
  if (runs.length === 0) return { miles: 0, id: null };
  const best = runs.reduce((a, b) => (a.distance >= b.distance ? a : b));
  return { miles: metersToMiles(best.distance), id: best.id };
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

export type ActivityFilter = 'runs' | 'rides' | 'both';
export type Metric = 'miles' | 'elevation';

export function weeklyData(
  activities: StravaActivity[],
  year: number,
  filter: ActivityFilter,
  metric: Metric
): number[] {
  const result = new Array(52).fill(0);
  const yearStart = new Date(year, 0, 1).getTime();

  activities
    .filter((a) => {
      if (getYear(a) !== year) return false;
      if (filter === 'runs') return isRun(a);
      if (filter === 'rides') return isRide(a);
      return isRun(a) || isRide(a);
    })
    .forEach((a) => {
      const dayOfYear = Math.floor((new Date(a.start_date).getTime() - yearStart) / 86400000);
      const week = Math.min(Math.floor(dayOfYear / 7), 51);
      result[week] += metric === 'miles' ? metersToMiles(a.distance) : metersToFeet(a.total_elevation_gain);
    });

  return result;
}

const BEST_EFFORT_DISTANCES = [
  { label: '1 Mile',        meters: 1609.34 },
  { label: '5K',            meters: 5000 },
  { label: '10K',           meters: 10000 },
  { label: 'Half Marathon', meters: 21097.5 },
  { label: 'Marathon',      meters: 42195 },
] as const;

export interface BestEffort {
  label: string;
  seconds: number | null; // null = no qualifying run found
}

export function bestEffortsRunning(activities: StravaActivity[], year: number): BestEffort[] {
  const runs = activities.filter((a) => isRun(a) && getYear(a) === year && a.average_speed > 0);

  return BEST_EFFORT_DISTANCES.map(({ label, meters }) => {
    // Qualifying runs must cover at least 95% of the target distance
    const qualifying = runs.filter((a) => a.distance >= meters * 0.95);
    if (qualifying.length === 0) return { label, seconds: null };

    // Best estimated time = target distance / fastest average speed
    const best = qualifying.reduce((a, b) => (a.average_speed >= b.average_speed ? a : b));
    return { label, seconds: Math.round(meters / best.average_speed) };
  });
}

export function availableYears(activities: StravaActivity[]): number[] {  const years = new Set(activities.map(getYear));
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
