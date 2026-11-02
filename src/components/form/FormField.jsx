import { CircleAlertIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';

// Label + input + hint or error message, used by every form
//   action: optional element on the right of the label (e.g. a counter)
export function FormField({ id, label, error, children, hint, action }) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id} className="text-[13px]">
          {label}
        </Label>
        {action}
      </div>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1 text-xs font-medium text-destructive">
          <CircleAlertIcon className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
