interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  formatValue?: (value: number) => string;
}

const DEFAULT_COLORS = ['#1c5e78', '#34a853', '#5b9bd5', '#f4a261', '#9b59b6', '#e76f51'];

export default function BarChart({
  data,
  height = 200,
  formatValue = (v) => String(v),
}: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end" style={{ height }}>
      <div className="flex h-full w-full items-end justify-around gap-2 pt-2">
        {data.map((item, i) => {
          const pct = (item.value / max) * 100;
          const color = item.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          return (
            <div
              key={item.label}
              className="flex h-full min-w-0 flex-1 flex-col items-center"
              title={`${item.label}: ${formatValue(item.value)}`}
            >
              <span className="mb-1 min-h-3.5 text-[11px] font-semibold text-slate-600">
                {item.value > 0 ? formatValue(item.value) : ''}
              </span>
              <div className="flex w-full max-w-12 flex-1 items-end overflow-hidden rounded-t-lg bg-slate-100">
                <div
                  className="w-full rounded-t-lg transition-all duration-300"
                  style={{ height: `${pct}%`, backgroundColor: color, minHeight: item.value > 0 ? 4 : 0 }}
                />
              </div>
              <span className="mt-2 text-center text-[11px] text-slate-500">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
