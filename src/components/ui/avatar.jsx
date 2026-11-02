import { cn } from '@/lib/utils';

// Initials in a circle. The tint is picked from the name, so one person keeps
// the same color everywhere (conversation, lists, menu).
const TINTS = [
  'bg-[oklch(0.93_0.04_268)] text-[oklch(0.42_0.16_268)] dark:bg-[oklch(0.32_0.07_268)] dark:text-[oklch(0.86_0.08_268)]',
  'bg-[oklch(0.93_0.05_160)] text-[oklch(0.42_0.1_160)] dark:bg-[oklch(0.32_0.06_160)] dark:text-[oklch(0.86_0.08_160)]',
  'bg-[oklch(0.94_0.05_70)] text-[oklch(0.46_0.11_60)] dark:bg-[oklch(0.33_0.06_70)] dark:text-[oklch(0.87_0.09_75)]',
  'bg-[oklch(0.93_0.04_330)] text-[oklch(0.45_0.14_330)] dark:bg-[oklch(0.32_0.07_330)] dark:text-[oklch(0.86_0.08_330)]',
  'bg-[oklch(0.93_0.04_220)] text-[oklch(0.43_0.11_230)] dark:bg-[oklch(0.32_0.06_230)] dark:text-[oklch(0.86_0.07_230)]',
  'bg-[oklch(0.93_0.04_25)] text-[oklch(0.47_0.15_25)] dark:bg-[oklch(0.33_0.07_25)] dark:text-[oklch(0.87_0.08_25)]',
];

const SIZES = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-9 text-[13px]',
  lg: 'size-14 text-lg',
};

export function initialsOf(first = '', last = '') {
  const letters = `${first?.[0] ?? ''}${last?.[0] ?? ''}`.trim();
  return (letters || first?.slice(0, 2) || '?').toUpperCase();
}

function tintOf(seed = '') {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return TINTS[hash % TINTS.length];
}

export function Avatar({ first, last, seed, size = 'md', className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-tight select-none',
        SIZES[size],
        tintOf(seed ?? `${first}${last}`),
        className
      )}
    >
      {initialsOf(first, last)}
    </span>
  );
}
