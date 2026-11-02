import { describe, it, expect } from 'vitest';
import { act, render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';
import { useUrlFilters, toApiParams } from './useUrlFilters';

// Render the hook inside a router and expose the current URL
function setup(initialUrl = '/list', defaults = { page: '1', sort: 'newest' }) {
  const result = { current: null };
  function Probe() {
    result.current = { ...useUrlFilters(defaults), location: useLocation() };
    return null;
  }
  const router = createMemoryRouter([{ path: '/list', element: <Probe /> }], { initialEntries: [initialUrl] });
  render(<RouterProvider router={router} />);
  return result;
}

describe('useUrlFilters', () => {
  it('uses defaults when the URL is empty', () => {
    const r = setup();
    expect(r.current.filters).toEqual({ page: '1', sort: 'newest' });
    expect(r.current.activeCount).toBe(0);
  });

  it('reads filters from the URL', () => {
    const r = setup('/list?status=r%C3%A9solu&page=3');
    expect(r.current.filters).toMatchObject({ status: 'résolu', page: '3', sort: 'newest' });
    expect(r.current.activeCount).toBe(1);
  });

  it('changing a filter goes back to page 1', () => {
    const r = setup('/list?page=4');
    act(() => r.current.setFilters({ status: 'en cours' }));
    expect(r.current.filters.page).toBe('1');
    expect(r.current.location.search).toBe('?status=en+cours');
  });

  it('changing only the page keeps the filters', () => {
    const r = setup('/list?status=en+cours');
    act(() => r.current.setFilters({ page: 2 }));
    expect(r.current.location.search).toBe('?status=en+cours&page=2');
  });

  it('empty values and defaults are removed from the URL', () => {
    const r = setup('/list?search=abc&sort=oldest');
    act(() => r.current.setFilters({ search: '', sort: 'newest' }));
    expect(r.current.location.search).toBe('');
  });

  it('resetFilters clears everything', () => {
    const r = setup('/list?search=abc&status=en+cours&page=2');
    act(() => r.current.resetFilters());
    expect(r.current.filters).toEqual({ page: '1', sort: 'newest' });
  });
});

describe('toApiParams', () => {
  it('drops empty values', () => {
    expect(toApiParams({ page: '1', search: '', status: undefined, sort: 'newest' })).toEqual({ page: '1', sort: 'newest' });
  });
  it('two quick changes in a row are both kept (no lost update)', () => {
    const r = setup();
    act(() => {
      r.current.setFilters({ from: '2000-01-01' });
      r.current.setFilters({ to: '2000-01-31' });
    });
    expect(r.current.location.search).toBe('?from=2000-01-01&to=2000-01-31');
  });

  it('after a reset, the next change starts from an empty URL', () => {
    const r = setup('/list?status=x&search=y');
    act(() => {
      r.current.resetFilters();
      r.current.setFilters({ priority: 'high' });
    });
    expect(r.current.location.search).toBe('?priority=high');
  });
});
