import { Avatar } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatHours } from '@/lib/format';
import { NoData } from './ChartCard';

// Each admin's numbers for the period (sent by the backend to the superadmin only)
export function TeamTable({ rows }) {
  if (!rows?.length) return <NoData text="Nobody handled a ticket in this period" />;
  const sorted = [...rows].sort((a, b) => b.handled - a.handled);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Admin</TableHead>
          <TableHead className="text-right">Handled</TableHead>
          <TableHead className="text-right">Resolved</TableHead>
          <TableHead className="text-right">Avg. resolution</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((a) => (
          <TableRow key={a.adminId}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar first={a.username} seed={a.email ?? a.username} size="sm" />
                <div className="min-w-0">
                  <div className="font-medium">{a.username}</div>
                  {a.email && <div className="text-xs text-muted-foreground">{a.email}</div>}
                </div>
              </div>
            </TableCell>
            <TableCell className="text-right tabular-nums">{a.handled}</TableCell>
            <TableCell className="text-right tabular-nums">{a.resolved}</TableCell>
            <TableCell className="text-right tabular-nums">{formatHours(a.averageResolutionHours)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
