import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { NoData } from './ChartCard';
import { formatPeriod } from '../periods';

const SERIES = [
  { key: 'created', name: 'Created', color: 'var(--series-1)' },
  { key: 'resolved', name: 'Resolved', color: 'var(--series-2)' },
];

// Tickets created vs resolved per day / week / month.
// The chart is for the eyes; the same numbers are in a table for screen readers.
export function TimelineChart({ data }) {
  if (!data?.length) return <NoData />;
  const total = (key) => data.reduce((n, p) => n + p[key], 0);

  return (
    <>
      <div className="h-64 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="period"
              tickFormatter={formatPeriod}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
              minTickGap={16}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              labelFormatter={formatPeriod}
              cursor={{ stroke: 'var(--border)' }}
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--popover-foreground)',
                fontSize: 12,
              }}
            />
            <Legend
              iconType="plainline"
              wrapperStyle={{ fontSize: 12 }}
              // the line sample carries the color; the text stays in the normal text color
              formatter={(value) => <span style={{ color: 'var(--muted-foreground)' }}>{value}</span>}
            />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>
          Tickets created ({total('created')}) and resolved ({total('resolved')}) per period
        </caption>
        <thead>
          <tr>
            <th>Period</th>
            <th>Created</th>
            <th>Resolved</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p.period}>
              <td>{formatPeriod(p.period)}</td>
              <td>{p.created}</td>
              <td>{p.resolved}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
