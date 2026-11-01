import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCwIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Reloads the data shown on the screen right now (current list, open ticket,
// menu counters) — not the whole page: filters, search and a reply being typed stay.
// The automatic refresh every 30 s keeps running; this is for "I want it now".
export function RefreshButton() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    try {
      // only queries used by the current page ("active"); the others refresh when opened
      await queryClient.refetchQueries({ type: 'active' }, { throwOnError: true });
    } catch {
      toast.error('Could not refresh. Check your connection and try again.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={refresh}
      disabled={refreshing}
      aria-label={refreshing ? 'Refreshing…' : 'Refresh'}
      title="Refresh"
    >
      <RefreshCwIcon className={cn(refreshing && 'animate-spin')} />
    </Button>
  );
}
