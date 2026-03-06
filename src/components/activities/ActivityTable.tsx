import { useState, useMemo } from 'react';
import { ActivityRow } from './ActivityRow';
import { FilterBar } from './FilterBar';
import { filterActivities, sortActivities, availableYears } from '../../lib/analytics';
import type { StravaActivity, ActivityFilters, SortKey, SortDir } from '../../types/strava';

const PAGE_SIZE = 50;

interface Props {
  activities: StravaActivity[];
}

export function ActivityTable({ activities }: Props) {
  const years = useMemo(() => availableYears(activities), [activities]);
  const [filters, setFilters] = useState<ActivityFilters>({ type: 'All' });
  const [sortKey, setSortKey] = useState<SortKey>('start_date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () => filterActivities(activities, filters),
    [activities, filters]
  );
  const sorted = useMemo(
    () => sortActivities(filtered, sortKey, sortDir),
    [filtered, sortKey, sortDir]
  );

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(0);
  };

  const handleFilterChange = (f: ActivityFilters) => {
    setFilters(f);
    setPage(0);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-orange-500 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Activities</h2>
        <span className="text-sm text-gray-400">{sorted.length} activities</span>
      </div>

      <FilterBar filters={filters} years={years} onChange={handleFilterChange} />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th
                  className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('start_date')}
                >
                  Date <SortIcon col="start_date" />
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Name
                </th>
                <th
                  className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('distance')}
                >
                  Distance <SortIcon col="distance" />
                </th>
                <th
                  className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('moving_time')}
                >
                  Time <SortIcon col="moving_time" />
                </th>
                <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Pace
                </th>
                <th
                  className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('kudos_count')}
                >
                  Kudos <SortIcon col="kudos_count" />
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                    No activities match your filters.
                  </td>
                </tr>
              ) : (
                paged.map((a) => <ActivityRow key={a.id} activity={a} />)
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
