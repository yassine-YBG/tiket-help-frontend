import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

const isEmpty = (value) => value === undefined || value === null || value === '';

// List filters stored in the URL (?status=en cours&page=2):
// refresh, back/forward and shared links keep the same view.
//
//   const { filters, setFilters, resetFilters } = useUrlFilters({ page: '1', sort: 'newest' });
//   setFilters({ status: 'résolu' })   -> also goes back to page 1
//   setFilters({ page: '3' })          -> only changes the page
//
// Values are strings (as in the URL). Defaults are not written to the URL.
export function useUrlFilters(defaults = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  // keep the first defaults object (callers often pass a new {} every render)
  const [defaultValues] = useState(defaults);

  const filters = useMemo(() => {
    const result = { ...defaultValues };
    for (const [key, value] of searchParams) result[key] = value;
    return result;
  }, [searchParams, defaultValues]);

  // The latest query, including changes not rendered yet: two quick changes
  // (e.g. "from" then "to") must both be kept — the second must not start
  // from the URL of the last render and erase the first.
  const latestRef = useRef(searchParams);
  useEffect(() => {
    latestRef.current = searchParams; // URL changed (render, back button, link)
  }, [searchParams]);

  const setFilters = useCallback(
    (changes, { replace = false } = {}) => {
      const next = new URLSearchParams(latestRef.current);
      for (const [key, value] of Object.entries(changes)) {
        if (isEmpty(value) || String(value) === String(defaultValues[key] ?? '')) next.delete(key);
        else next.set(key, String(value));
      }
      // any filter change starts again from page 1
      if (!('page' in changes)) next.delete('page');
      latestRef.current = next;
      setSearchParams(next, { replace });
    },
    [setSearchParams, defaultValues]
  );

  const resetFilters = useCallback(() => {
    latestRef.current = new URLSearchParams();
    setSearchParams({});
  }, [setSearchParams]);

  const activeCount = useMemo(
    () => [...searchParams.keys()].filter((key) => !['page', 'limit', 'sort'].includes(key)).length,
    [searchParams]
  );

  return { filters, setFilters, resetFilters, activeCount };
}

// Remove empty values before sending filters to the API
export function toApiParams(filters) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => !isEmpty(value)));
}
