import { NoData } from './ChartCard';

// Horizontal bars with the label and the number always written (no hover needed).
//   items: [{ label, value }]
export function BarList({ items, label }) {
  const max = Math.max(0, ...items.map((i) => i.value));
  if (!items.length || max === 0) return <NoData />;
  return (
    <ul className="grid gap-3" aria-label={label}>
      {items.map((item) => (
        <li key={item.label} className="grid gap-1">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="truncate">{item.label}</span>
            <span className="font-medium tabular-nums">{item.value}</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-[var(--series-1)]"
              style={{ width: `${item.value ? Math.max(2, (item.value / max) * 100) : 0}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
