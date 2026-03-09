import type { BestEffort } from '../../lib/analytics';

interface Props {
  efforts: BestEffort[];
  year: number;
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function BestEffortsCard({ efforts, year }: Props) {
  const hasAny = efforts.some((e) => e.seconds !== null);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">Best Running Efforts — {year}</h3>
        <span className="text-xs text-gray-400">est. from avg pace</span>
      </div>

      {!hasAny ? (
        <p className="text-sm text-gray-400 py-4 text-center">No qualifying runs logged in {year}.</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {efforts.map(({ label, seconds }) => (
            <div key={label} className="flex items-center justify-between py-2.5">
              <span className="text-sm text-gray-600">{label}</span>
              {seconds !== null ? (
                <span className="text-sm font-semibold text-gray-900 tabular-nums">
                  {formatTime(seconds)}
                </span>
              ) : (
                <span className="text-sm text-gray-300">—</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
