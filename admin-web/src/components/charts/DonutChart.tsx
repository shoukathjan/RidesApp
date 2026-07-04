interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
}

export default function DonutChart({ data, size = 180 }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return (
      <div
        className="mx-auto flex items-center justify-center text-sm text-slate-500"
        style={{ width: size, height: size }}
      >
        No data
      </div>
    );
  }

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const segments = data.map((item) => {
    const pct = item.value / total;
    const dash = pct * circumference;
    const segment = {
      ...item,
      dash,
      offset: -offset,
      pct: Math.round(pct * 100),
    };
    offset += dash;
    return segment;
  });

  return (
    <div className="flex flex-wrap items-center gap-4">
      <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="14" />
        {segments.map((seg) => (
          <circle
            key={seg.label}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="14"
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
            strokeDashoffset={seg.offset}
            transform="rotate(-90 50 50)"
          />
        ))}
        <text x="50" y="48" textAnchor="middle" className="fill-brand-700 text-[14px] font-extrabold">
          {total}
        </text>
        <text x="50" y="58" textAnchor="middle" className="fill-slate-500 text-[7px] uppercase">
          total
        </text>
      </svg>
      <ul className="min-w-40 flex-1 list-none space-y-2 p-0">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: seg.color }}
            />
            <span className="flex-1 text-slate-700">{seg.label}</span>
            <span className="whitespace-nowrap text-xs text-slate-500">
              {seg.value} ({seg.pct}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
