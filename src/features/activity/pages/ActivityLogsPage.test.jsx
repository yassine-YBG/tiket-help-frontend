import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, testUsers } from '@/test/render';
import { activityLogsApi } from '@/api/activityLogs.api';
import ActivityLogsPage from './ActivityLogsPage';

vi.mock('@/api/activityLogs.api', () => ({ activityLogsApi: { list: vi.fn() } }));

const page = (logs) => ({
  logs,
  pagination: { page: 1, limit: 25, total: logs.length, totalPages: 1, hasNextPage: false, hasPrevPage: false },
});
const logs = [
  { _id: 'l1', user: { _id: 'a1', username: 'Malek', role: 'admin' }, action: 'Assigned self to ticket', target: 't1', targetModel: 'Ticket', timestamp: '2026-11-01T10:00:00Z' },
  { _id: 'l2', user: { _id: 'u1', username: 'Nour', role: 'user' }, action: 'Changed own password', target: 'u1', targetModel: 'User', timestamp: '2026-11-01T09:00:00Z' },
];
const setup = (route = '/admin/activity') =>
  renderWithProviders(<ActivityLogsPage />, { route, path: '/admin/activity', user: testUsers.admin });

beforeEach(() => vi.resetAllMocks());

describe('ActivityLogsPage', () => {
  it('lists who did what, with a link to the ticket', async () => {
    vi.mocked(activityLogsApi.list).mockResolvedValue(page(logs));
    setup();
    expect(await screen.findByText('Assigned self to ticket')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open ticket' })).toHaveAttribute('href', '/tickets/t1');
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('clicking a name shows only that person (the name is not sent to the API)', async () => {
    vi.mocked(activityLogsApi.list).mockResolvedValue(page(logs));
    setup();
    await userEvent.click(await screen.findByRole('button', { name: 'Malek' }));
    await waitFor(() => expect(activityLogsApi.list).toHaveBeenLastCalledWith(expect.objectContaining({ user: 'a1' })));
    expect(activityLogsApi.list.mock.lastCall[0]).not.toHaveProperty('userName');
    expect(screen.getByRole('button', { name: /Only actions by Malek/ })).toBeInTheDocument();
  });

  it('type and date filters are sent to the API', async () => {
    vi.mocked(activityLogsApi.list).mockResolvedValue(page(logs));
    setup('/admin/activity?targetModel=User&from=2026-10-01&to=2026-10-31');
    await screen.findByText('Assigned self to ticket');
    expect(activityLogsApi.list).toHaveBeenCalledWith(
      expect.objectContaining({ targetModel: 'User', from: '2026-10-01', to: '2026-10-31' })
    );
  });

  it('nothing found -> a clear message', async () => {
    vi.mocked(activityLogsApi.list).mockResolvedValue(page([]));
    setup('/admin/activity?targetModel=User');
    expect(await screen.findByText('No action matches these filters')).toBeInTheDocument();
  });
});
