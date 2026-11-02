import { NoData } from './ChartCard';

// Horizontal bars with the label and the number always written (no hover needed).
//   items: [{ label, value }]
export function BarList({ items, label }) {
  const max = Math.max(0, ...items.map((i) => i.value));
  if (!items.length || max === 0) return <NoData />;
  return (
    <ul className="grid gap-3.5" aria-label={label}>
      {items.map((item) => (
        <li key={item.label} className="grid gap-1.5">
          <div className="flex items-baseline justify-between gap-2 text-[13px]">
            <span className="truncate">{item.label}</span>
            <span className="min-w-6 text-right font-semibold tabular-nums">{item.value}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[var(--series-1)]"
              style={{ width: `${item.value ? Math.max(2, (item.value / max) * 100) : 0}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
