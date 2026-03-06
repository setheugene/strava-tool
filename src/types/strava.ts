export interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  profile: string; // URL to profile photo
  profile_medium: string;
}

export interface StravaToken {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix timestamp
  athlete: StravaAthlete;
}

export interface StravaActivity {
  id: number;
  name: string;
  type: string;       // 'Run', 'Ride', 'Walk', etc.
  sport_type: string; // newer, more specific field
  start_date: string; // ISO 8601
  distance: number;   // meters
  moving_time: number; // seconds
  elapsed_time: number; // seconds
  total_elevation_gain: number; // meters
  athlete_count: number; // 1 = solo, >1 = group
  kudos_count: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_speed: number; // m/s
  map?: {
    summary_polyline: string;
  };
}

export type ActivityType = 'Run' | 'Ride' | 'Walk' | 'Swim' | 'Hike' | 'All';

export interface ActivityFilters {
  year?: number;
  type?: ActivityType;
  groupOnly?: boolean;
  search?: string;
}

export type SortKey = 'start_date' | 'distance' | 'moving_time' | 'kudos_count';
export type SortDir = 'asc' | 'desc';
