import { RefreshButton } from './RefreshButton';

// Title + description + optional buttons at the top of each page.
// refreshable: adds the "Refresh" button (pages that show data from the server).
// eyebrow: small line above the title (section name).
export function PageHeader({ title, description, actions, refreshable = false, eyebrow }) {
  const hasActions = refreshable || actions;
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-4 sm:mb-8">
      <div className="grid min-w-0 flex-1 basis-[15rem] gap-1.5">
        {eyebrow && <p className="text-xs font-medium tracking-wide text-primary uppercase">{eyebrow}</p>}
        <h1 className="text-[22px] leading-tight font-semibold tracking-tight sm:text-2xl">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-pretty text-muted-foreground">{description}</p>}
      </div>
      {hasActions && (
        <div className="flex flex-wrap items-end gap-2">
          {refreshable && <RefreshButton />}
          {actions}
        </div>
      )}
    </div>
  );
}
