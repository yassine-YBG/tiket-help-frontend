import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCwIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// The icon spins at least this long, so a fast local server still shows it worked
const MIN_SPIN_MS = 600;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Reloads the data shown on the screen right now (current list, open ticket,
// menu counters) — not the whole page: filters, search and text being typed stay.
// The automatic refresh every 30 s keeps running; this is for "I want it now".
export function RefreshButton({ className }) {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    // TanStack Query keeps the SAME object when the new data is identical,
    // so comparing references tells us whether anything changed.
    const before = queryClient.getQueriesData({ type: 'active' });
    try {
      await Promise.all([
        queryClient.refetchQueries({ type: 'active' }, { throwOnError: true }),
        wait(MIN_SPIN_MS),
      ]);
      const changed = before.some(([key, data]) => queryClient.getQueryData(key) !== data);
      toast.success(changed ? 'Updated' : 'Already up to date', { id: 'refresh', duration: 1500 });
    } catch {
      toast.error('Could not refresh. Check your connection and try again.', { id: 'refresh' });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing} className={className}>
      <RefreshCwIcon className={cn(refreshing && 'animate-spin')} />
      {refreshing ? 'Refreshing…' : 'Refresh'}
    </Button>
  );
}
