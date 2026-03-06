const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Props {
  data: number[]; // 12 values, miles per month
  year: number;
}

export function MonthlyChart({ data, year }: Props) {
  const max = Math.max(...data, 1);
  const chartHeight = 140;
  const barWidth = 28;
  const gap = 8;
  const totalWidth = (barWidth + gap) * 12 - gap;
  const currentMonth = new Date().getFullYear() === year ? new Date().getMonth() : -1;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-4">Miles per Month — {year}</h3>
      <div>
        <svg
          viewBox={`0 0 ${totalWidth} ${chartHeight + 32}`}
          width="100%"
          className="block"
        >
          {data.map((miles, i) => {
            const barH = Math.max(miles > 0 ? 4 : 0, (miles / max) * chartHeight);
            const x = i * (barWidth + gap);
            const y = chartHeight - barH;
            const isCurrentMonth = i === currentMonth;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={4}
                  fill={isCurrentMonth ? '#f97316' : '#fed7aa'}
                />
                {miles > 0 && (
                  <title>{`${MONTHS[i]}: ${miles.toFixed(1)} mi`}</title>
                )}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  fontSize={10}
                  fill={isCurrentMonth ? '#f97316' : '#9ca3af'}
                  fontWeight={isCurrentMonth ? '600' : '400'}
                >
                  {MONTHS[i]}
                </text>
                {miles > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 4}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#6b7280"
                  >
                    {miles.toFixed(0)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
