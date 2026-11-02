import { CloudAlertIcon, RotateCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/errors';

// Shown when data could not be loaded. "Try again" re-runs the request.
export function ErrorState({ error, onRetry, title = 'Could not load this data' }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-danger-soft">
        <CloudAlertIcon className="size-5 text-danger" />
      </div>
      <div className="grid max-w-sm gap-1">
        <p className="text-[15px] font-semibold">{title}</p>
        <p className="text-sm text-pretty text-muted-foreground">{getErrorMessage(error)}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCwIcon />
          Try again
        </Button>
      )}
    </div>
  );
}
