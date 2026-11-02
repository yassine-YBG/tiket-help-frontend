import { Spinner } from '@/components/ui/spinner';
import { LogoMark } from '@/components/brand/Logo';

// First load (checking the saved session): brand + spinner, centered
export function FullPageSpinner() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas">
      <LogoMark className="size-10 rounded-xl" />
      <Spinner className="size-5 text-muted-foreground" />
    </div>
  );
}
