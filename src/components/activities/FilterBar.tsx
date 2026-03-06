import type { ActivityFilters, ActivityType } from '../../types/strava';

const ACTIVITY_TYPES: ActivityType[] = ['All', 'Run', 'Ride', 'Walk', 'Swim', 'Hike'];

interface Props {
  filters: ActivityFilters;
  years: number[];
  onChange: (filters: ActivityFilters) => void;
}

export function FilterBar({ filters, years, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <select
        value={filters.year ?? ''}
        onChange={(e) =>
          onChange({ ...filters, year: e.target.value ? Number(e.target.value) : undefined })
        }
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
      >
        <option value="">All years</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <select
        value={filters.type ?? 'All'}
        onChange={(e) => onChange({ ...filters, type: e.target.value as ActivityType })}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
      >
        {ACTIVITY_TYPES.map((t) => (
          <option key={t} value={t}>
            {t === 'All' ? 'All types' : t}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={!!filters.groupOnly}
          onChange={(e) => onChange({ ...filters, groupOnly: e.target.checked })}
          className="rounded border-gray-300 text-orange-500 focus:ring-orange-400"
        />
        Group runs only
      </label>

      <input
        type="search"
        value={filters.search ?? ''}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        placeholder="Search by name..."
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 w-48"
      />
    </div>
  );
}
