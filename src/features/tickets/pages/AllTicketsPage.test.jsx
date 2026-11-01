import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, testUsers } from '@/test/render';
import { ticketsApi } from '@/api/tickets.api';
import AllTicketsPage from './AllTicketsPage';

vi.mock('@/api/tickets.api', () => ({ ticketsApi: { listAll: vi.fn() } }));

const page = (tickets, extra = {}) => ({
  tickets,
  pagination: { page: 1, limit: 20, total: tickets.length, totalPages: 1, hasNextPage: false, hasPrevPage: false, ...extra },
  sort: 'priority',
});

const tickets = [
  {
    _id: 't1', subject: 'Payment refused', category: 'Payment', status: 'non résolu', priority: 'urgent',
    createdBy: { _id: 'u1', username: 'Nour' }, handledBy: null, createdAt: '2026-10-01T10:00:00Z', messages: [],
  },
  {
    _id: 't2', subject: 'Login loop', category: 'Account', status: 'en cours', priority: 'normal',
    createdBy: { _id: 'u2', username: 'Ali' }, handledBy: { _id: 'a1', username: 'Malek' },
    createdAt: '2026-10-02T10:00:00Z', messages: [],
  },
];

const setup = (route = '/admin/tickets') =>
  renderWithProviders(<AllTicketsPage />, { route, path: '/admin/tickets', user: testUsers.admin });

beforeEach(() => vi.resetAllMocks());

describe('AllTicketsPage', () => {
  it('lists every ticket with who created it and who handles it, urgent first', async () => {
    vi.mocked(ticketsApi.listAll).mockResolvedValue(page(tickets));
    setup();
    expect(await screen.findByRole('link', { name: 'Payment refused' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Created by' })).toBeInTheDocument();
    expect(screen.getByText('Ali')).toBeInTheDocument();
    expect(screen.getByText('Not assigned')).toBeInTheDocument();
    expect(ticketsApi.listAll).toHaveBeenCalledWith({ page: '1', limit: '20', sort: 'priority' });
  });

  it('sends the assignee filter from the URL to the API', async () => {
    vi.mocked(ticketsApi.listAll).mockResolvedValue(page([tickets[0]]));
    setup('/admin/tickets?handledBy=none');
    await screen.findByRole('link', { name: 'Payment refused' });
    expect(screen.getByLabelText('Filter by assignee')).toHaveTextContent('Not assigned');
    expect(ticketsApi.listAll).toHaveBeenCalledWith(expect.objectContaining({ handledBy: 'none' }));
  });

  it('choosing "Assigned to me" filters the list', async () => {
    vi.mocked(ticketsApi.listAll).mockResolvedValue(page(tickets));
    setup();
    await screen.findByRole('link', { name: 'Payment refused' });
    await userEvent.click(screen.getByLabelText('Filter by assignee'));
    await userEvent.click(await screen.findByRole('option', { name: 'Assigned to me' }));
    await waitFor(() =>
      expect(ticketsApi.listAll).toHaveBeenLastCalledWith(expect.objectContaining({ handledBy: 'me' }))
    );
  });

  it('shows a clear message when filters match nothing', async () => {
    vi.mocked(ticketsApi.listAll).mockResolvedValue(page([]));
    setup('/admin/tickets?status=r%C3%A9solu');
    expect(await screen.findByText('No ticket matches these filters')).toBeInTheDocument();
  });

  it('shows the empty state when there is no ticket at all', async () => {
    vi.mocked(ticketsApi.listAll).mockResolvedValue(page([]));
    setup();
    expect(await screen.findByText('No tickets yet')).toBeInTheDocument();
  });

  it('archived tickets: filter sent to the API and an "Archived" label on the row', async () => {
    vi.mocked(ticketsApi.listAll).mockResolvedValue(page([{ ...tickets[1], status: 'résolu', archived: true }]));
    setup('/admin/tickets?archived=only');
    await screen.findByRole('link', { name: 'Login loop' });
    expect(screen.getByLabelText('Archived tickets')).toHaveTextContent('Archived only');
    expect(screen.getByText('Archived')).toBeInTheDocument();
    expect(ticketsApi.listAll).toHaveBeenCalledWith(expect.objectContaining({ archived: 'only' }));
  });

  it('by default archived tickets are hidden (no "archived" sent)', async () => {
    vi.mocked(ticketsApi.listAll).mockResolvedValue(page(tickets));
    setup();
    await screen.findByRole('link', { name: 'Payment refused' });
    expect(screen.getByLabelText('Archived tickets')).toHaveTextContent('Hide archived');
    expect(ticketsApi.listAll.mock.calls[0][0]).not.toHaveProperty('archived');
  });

  it('"Needs reply" badge and filter', async () => {
    vi.mocked(ticketsApi.listAll).mockResolvedValue(page([{ ...tickets[1], awaitingSupport: true }]));
    setup();
    expect(await screen.findByText('Needs reply', { selector: 'span' })).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Filter by reply'));
    await userEvent.click(await screen.findByRole('option', { name: 'Needs reply' }));
    await waitFor(() =>
      expect(ticketsApi.listAll).toHaveBeenLastCalledWith(expect.objectContaining({ awaitingSupport: 'true' }))
    );
  });
});
