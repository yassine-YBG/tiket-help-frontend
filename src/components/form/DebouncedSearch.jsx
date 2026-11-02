import { useEffect, useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

// Search box for lists whose filters live in the URL.
// The box updates instantly; onCommit (URL + request) runs 300 ms after the user stops typing.
//   value     the search currently in the URL ('' when none)
//   onCommit  (text) => void — called with the trimmed text
export function DebouncedSearch({ value = '', onCommit, label, placeholder, maxLength = 100 }) {
  const [text, setText] = useState(value);
  const debounced = useDebouncedValue(text, 300);

  // URL changed from elsewhere (clear filters, back button): show it in the box.
  // Done during render, as React recommends, instead of in an effect.
  const [previousValue, setPreviousValue] = useState(value);
  if (value !== previousValue) {
    setPreviousValue(value);
    if (value !== text.trim()) setText(value);
  }

  // the user stopped typing: commit (only react to typing, not to URL changes)
  useEffect(() => {
    const next = debounced.trim();
    if (next !== value) onCommit(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="relative w-full md:w-72">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        enterKeyHint="search"
        placeholder={placeholder}
        aria-label={label}
        value={text}
        maxLength={maxLength}
        onChange={(e) => setText(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
