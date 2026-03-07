import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { weeklyData } from '../../lib/analytics';
import type { ActivityFilter, Metric } from '../../lib/analytics';
import type { StravaActivity } from '../../types/strava';

const YEAR_COLORS = [
  '#f97316', // orange (brand)
  '#3b82f6', // blue
  '#10b981', // green
  '#8b5cf6', // purple
  '#ef4444', // red
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#84cc16', // lime
  '#6b7280', // gray
];

interface Props {
  activities: StravaActivity[];
  availableYears: number[];
}

export function YearComparisonChart({ activities, availableYears }: Props) {
  const [selectedYears, setSelectedYears] = useState<number[]>(
    availableYears.slice(0, 2)
  );
  const [metric, setMetric] = useState<Metric>('miles');
  const [filter, setFilter] = useState<ActivityFilter>('runs');

  function toggleYear(year: number) {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  }

  const chartData = useMemo(() => {
    const byYear: Record<number, number[]> = {};
    for (const year of selectedYears) {
      byYear[year] = weeklyData(activities, year, filter, metric);
    }
    return Array.from({ length: 52 }, (_, week) => {
      const entry: Record<string, number> = { week: week + 1 };
      for (const year of selectedYears) {
        entry[String(year)] = Math.round(byYear[year][week] * 10) / 10;
      }
      return entry;
    });
  }, [activities, selectedYears, filter, metric]);

  const unit = metric === 'miles' ? 'mi' : 'ft';
  const yLabel = metric === 'miles' ? 'Miles' : 'Elevation (ft)';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <h3 className="text-sm font-medium text-gray-500">Year Comparison — Weekly</h3>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Activity filter */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
            {(['runs', 'rides', 'both'] as ActivityFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 capitalize transition-colors ${
                  filter === f
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Metric toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
            {(['miles', 'elevation'] as Metric[]).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`px-3 py-1.5 capitalize transition-colors ${
                  metric === m
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Year checkboxes */}
      <div className="flex flex-wrap gap-2 mb-5">
        {availableYears.map((year) => {
          const active = selectedYears.includes(year);
          const color = YEAR_COLORS[availableYears.indexOf(year) % YEAR_COLORS.length];
          return (
            <button
              key={year}
              onClick={() => toggleYear(year)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                active
                  ? 'text-white border-transparent'
                  : 'text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
              style={active ? { backgroundColor: color, borderColor: color } : {}}
            >
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-white/70 inline-block" />
              )}
              {year}
            </button>
          );
        })}
      </div>

      {selectedYears.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-gray-400">
          Select at least one year above to see the chart.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              label={{ value: 'Week', position: 'insideBottomRight', offset: -4, fontSize: 11, fill: '#9ca3af' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: '#9ca3af' }}
              width={55}
            />
            <Tooltip
              formatter={(value) => [`${value} ${unit}`]}
              labelFormatter={(label) => `Week ${label}`}
              contentStyle={{ fontSize: 12, borderColor: '#e5e7eb', borderRadius: 8 }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            {selectedYears.map((year) => (
              <Line
                key={year}
                type="monotone"
                dataKey={String(year)}
                stroke={YEAR_COLORS[availableYears.indexOf(year) % YEAR_COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
