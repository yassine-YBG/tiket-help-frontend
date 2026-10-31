import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// shadcn/ui helper: merge Tailwind classes without conflicts
// cn('px-2', condition && 'px-4') -> 'px-4'
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
