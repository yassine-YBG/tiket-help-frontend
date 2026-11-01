import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { renderWithProviders, testUsers } from '@/test/render';
import { RefreshButton } from './RefreshButton';

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

beforeEach(() => vi.clearAllMocks());

// A page showing data from a query, plus the refresh button
function Page({ fetcher }) {
  const { data } = useQuery({ queryKey: ['demo'], queryFn: fetcher, staleTime: Infinity });
  return (
    <>
      <RefreshButton />
      <p>value: {data ?? '…'}</p>
    </>
  );
}

describe('RefreshButton', () => {
  it('reloads the data on the screen', async () => {
    let n = 0;
    const fetcher = vi.fn(async () => ++n);
    renderWithProviders(<Page fetcher={fetcher} />, { user: testUsers.user });
    expect(await screen.findByText('value: 1')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(await screen.findByText('value: 2')).toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Updated', expect.anything()), { timeout: 2000 });
  });

  it('says "Already up to date" when nothing changed', async () => {
    const fetcher = vi.fn(async () => ({ same: true }));
    function Same() {
      const { data } = useQuery({ queryKey: ['same'], queryFn: fetcher, staleTime: Infinity });
      return (
        <>
          <RefreshButton />
          <p>{data ? 'loaded' : '…'}</p>
        </>
      );
    }
    renderWithProviders(<Same />, { user: testUsers.user });
    await screen.findByText('loaded');
    await userEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Already up to date', expect.anything()), { timeout: 2000 });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('keeps spinning at least 0.6 s, even when the server is instant', async () => {
    renderWithProviders(<Page fetcher={async () => 1} />, { user: testUsers.user });
    await screen.findByText('value: 1');
    const start = Date.now();
    await userEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(screen.getByRole('button', { name: /Refreshing/ })).toBeDisabled();
    await screen.findByRole('button', { name: 'Refresh' }, { timeout: 2000 });
    expect(Date.now() - start).toBeGreaterThanOrEqual(550);
  });

  it('is disabled while refreshing', async () => {
    let finish;
    let calls = 0;
    const fetcher = () => (++calls === 1 ? Promise.resolve(1) : new Promise((r) => { finish = () => r(2); }));
    renderWithProviders(<Page fetcher={fetcher} />, { user: testUsers.user });
    await screen.findByText('value: 1');

    await userEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(screen.getByRole('button', { name: /Refreshing/ })).toBeDisabled();
    finish();
    expect(await screen.findByRole('button', { name: 'Refresh' }, { timeout: 2000 })).toBeEnabled();
  });

  it('shows an error and keeps the old data when it fails', async () => {
    let calls = 0;
    const fetcher = async () => {
      if (++calls === 1) return 1;
      throw new Error('offline');
    };
    renderWithProviders(<Page fetcher={fetcher} />, { user: testUsers.user });
    await screen.findByText('value: 1');

    await userEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Could not refresh. Check your connection and try again.', expect.anything()), { timeout: 2000 });
    expect(screen.getByText('value: 1')).toBeInTheDocument();
  });
});
