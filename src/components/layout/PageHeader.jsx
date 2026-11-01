import { RefreshButton } from './RefreshButton';

// Title + description + optional buttons at the top of each page.
// refreshable: adds the "Refresh" button (pages that show data from the server).
export function PageHeader({ title, description, actions, refreshable = false }) {
  const hasActions = refreshable || actions;
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {hasActions && (
        <div className="flex items-center gap-2">
          {refreshable && <RefreshButton />}
          {actions}
        </div>
      )}
    </div>
  );
}
