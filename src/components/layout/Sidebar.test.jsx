import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, testUsers } from '@/test/render';
import { ticketsApi } from '@/api/tickets.api';
import { Sidebar } from './Sidebar';

vi.mock('@/api/tickets.api', () => ({ ticketsApi: { summary: vi.fn() } }));

beforeEach(() => vi.resetAllMocks());

describe('Sidebar counters', () => {
  it('a user sees how many tickets have a new answer', async () => {
    vi.mocked(ticketsApi.summary).mockResolvedValue({ newAnswers: 2 });
    renderWithProviders(<Sidebar />, { user: testUsers.user });
    expect(await screen.findByLabelText('2 tickets with a new answer')).toHaveTextContent('2');
  });

  it('an admin sees how many tickets wait for a support reply', async () => {
    vi.mocked(ticketsApi.summary).mockResolvedValue({ needsReply: 1, needsReplyMine: 0 });
    renderWithProviders(<Sidebar />, { user: testUsers.admin });
    expect(await screen.findByLabelText('1 ticket waiting for a support reply')).toHaveTextContent('1');
  });

  it('no badge when the count is 0', async () => {
    vi.mocked(ticketsApi.summary).mockResolvedValue({ newAnswers: 0 });
    renderWithProviders(<Sidebar />, { user: testUsers.user });
    await screen.findByRole('link', { name: /My tickets/ });
    expect(screen.queryByLabelText(/new answer/)).not.toBeInTheDocument();
  });
});
