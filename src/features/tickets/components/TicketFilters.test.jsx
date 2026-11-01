import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { TicketFilters } from './TicketFilters';

function Page() {
  const urlFilters = useUrlFilters({ page: '1', sort: 'priority' });
  return <TicketFilters {...urlFilters} />;
}

function setup(url = '/') {
  const router = createMemoryRouter([{ path: '/', element: <Page /> }], { initialEntries: [url] });
  render(<RouterProvider router={router} />);
  return () => router.state.location.search; // current URL query
}

describe('TicketFilters', () => {
  it('writes the search to the URL after the user stops typing', async () => {
    const currentSearch = setup();
    await userEvent.type(screen.getByLabelText('Search tickets'), 'login');
    expect(currentSearch()).toBe(''); // not yet: waiting 300 ms
    await waitFor(() => expect(currentSearch()).toBe('?search=login'));
  });

  it('shows filters from the URL and clears them', async () => {
    const currentSearch = setup('/?search=export&status=en+cours');
    expect(screen.getByLabelText('Search tickets')).toHaveValue('export');
    expect(screen.getByLabelText('Filter by status')).toHaveTextContent('In progress');
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(currentSearch()).toBe('');
    expect(screen.getByLabelText('Search tickets')).toHaveValue('');
    expect(screen.getByLabelText('Filter by status')).toHaveTextContent('All statuses');
  });
});
