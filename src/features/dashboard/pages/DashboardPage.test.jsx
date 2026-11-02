import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, testUsers } from '@/test/render';
import { statsApi } from '@/api/stats.api';
import { ticketsApi } from '@/api/tickets.api';
import DashboardPage from './DashboardPage';

vi.mock('@/api/stats.api', () => ({ statsApi: { get: vi.fn() } }));
vi.mock('@/api/tickets.api', () => ({ ticketsApi: { summary: vi.fn() } }));

const stats = {
  range: { from: null, to: null, interval: 'day', timezone: 'UTC' },
  tickets: { total: 12, open: 4, inProgress: 3, resolved: 5, unassigned: 2, resolutionRate: 41.7 },
  byStatus: { 'non résolu': 4, 'en cours': 3, 'résolu': 5 },
  byPriority: { low: 1, normal: 6, high: 3, urgent: 2 },
  openByPriority: { low: 0, normal: 2, high: 1, urgent: 1 },
  byCategory: [{ category: 'Payment', count: 7 }, { category: 'Account', count: 5 }],
  resolutionTime: { count: 5, averageHours: 30, fastestHours: 2, slowestHours: 96 },
  firstResponseTime: { count: 8, averageHours: 1.5, fastestHours: 0.2, slowestHours: 6 },
  timeline: [
    { period: '2026-10-30', created: 3, resolved: 1 },
    { period: '2026-10-31', created: 2, resolved: 2 },
  ],
  users: { total: 15, pendingActivation: 2, byRole: { user: 12, admin: 2, superadmin: 1 } },
};
const superadmin = { ...testUsers.admin, id: 's1', username: 'Sara', role: 'superadmin' };
const team = [{ adminId: 'a1', username: 'Malek', email: 'malek@test.com', handled: 6, resolved: 4, averageResolutionHours: 20 }];

const setup = (user = testUsers.admin, route = '/admin/dashboard') =>
  renderWithProviders(<DashboardPage />, { route, path: '/admin/dashboard', user });

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(ticketsApi.summary).mockResolvedValue({ needsReply: 3, needsReplyMine: 1, pendingUsers: 2 });
});

describe('DashboardPage', () => {
  it('shows the numbers of the period, response times and the accounts', async () => {
    vi.mocked(statsApi.get).mockResolvedValue(stats);
    setup();
    expect(await screen.findByText('41.7% resolved')).toBeInTheDocument();
    expect(screen.getByText('2 not assigned')).toBeInTheDocument();
    expect(screen.getByText('1.5 h')).toBeInTheDocument(); // first response
    expect(screen.getByText('1.3 d')).toBeInTheDocument(); // resolution 30 h
    const needsReply = screen.getByText('Needs reply now').closest('[data-slot="card"]');
    await waitFor(() => expect(needsReply).toHaveTextContent('Needs reply now3'));
    expect(screen.getByText('12 users · 2 admins · 1 superadmin')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Tickets by category' })).toHaveTextContent('Payment7');
  });

  it('the chart data is also available as a table for screen readers', async () => {
    vi.mocked(statsApi.get).mockResolvedValue(stats);
    setup();
    const table = await screen.findByRole('table', { name: /Tickets created \(5\) and resolved \(3\)/ });
    expect(table).toHaveTextContent('30 Oct');
  });

  it('asks for the last 30 days by default, then the chosen period', async () => {
    vi.mocked(statsApi.get).mockResolvedValue(stats);
    setup();
    await screen.findByText('41.7% resolved');
    expect(statsApi.get).toHaveBeenLastCalledWith(expect.objectContaining({ interval: 'day', from: expect.any(String) }));
    await userEvent.click(screen.getByLabelText('Period'));
    await userEvent.click(await screen.findByRole('option', { name: 'All time' }));
    await waitFor(() => expect(statsApi.get).toHaveBeenLastCalledWith({ interval: 'month' }));
  });

  it('an admin does not see the team table', async () => {
    vi.mocked(statsApi.get).mockResolvedValue(stats);
    setup();
    await screen.findByText('41.7% resolved');
    expect(screen.queryByText('Team')).not.toBeInTheDocument();
  });

  it('the superadmin sees the team table', async () => {
    vi.mocked(statsApi.get).mockResolvedValue({ ...stats, byAdmin: team });
    setup(superadmin);
    expect(await screen.findByText('Team')).toBeInTheDocument();
    expect(screen.getByText('malek@test.com')).toBeInTheDocument();
  });

  it('an empty period says so instead of empty charts', async () => {
    vi.mocked(statsApi.get).mockResolvedValue({
      ...stats,
      tickets: { total: 0, open: 0, inProgress: 0, resolved: 0, unassigned: 0, resolutionRate: 0 },
      byPriority: { low: 0, normal: 0, high: 0, urgent: 0 },
      byCategory: [],
      timeline: [],
      resolutionTime: { count: 0, averageHours: null, fastestHours: null, slowestHours: null },
      firstResponseTime: { count: 0, averageHours: null, fastestHours: null, slowestHours: null },
    });
    setup();
    expect((await screen.findAllByText('No data for this period')).length).toBe(3);
  });
});
