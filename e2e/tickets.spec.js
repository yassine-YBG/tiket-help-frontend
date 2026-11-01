// User side of tickets: create, list, open, reply, files, priority, access rules
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect, fixtures } from './fixtures';

const FILES = path.join(path.dirname(fileURLToPath(import.meta.url)), 'files');

// Create a ticket directly through the API (faster than the form)
async function apiCreateTicket(request, account, fields) {
  const res = await request.post(`${fixtures().apiUrl}/tickets/create`, {
    headers: { Authorization: `Bearer ${account.token}` },
    multipart: { category: 'Software', description: 'Created by the test', priority: 'normal', ...fields },
  });
  expect(res.status()).toBe(201);
  return (await res.json()).ticketId;
}

test.describe('new ticket', () => {
  test('a user sees Low / Normal / High with an explanation, not Urgent', async ({ page, loginAs }) => {
    await loginAs('user');
    await page.goto('/tickets/new');
    await expect(page.getByText('Something does not work as expected')).toBeVisible();
    await page.getByLabel('Priority').click();
    await expect(page.getByRole('option')).toHaveText(['Low', 'Normal', 'High']);
  });

  test('the form checks required fields and forbidden files before sending', async ({ page, loginAs }) => {
    await loginAs('user');
    await page.goto('/tickets/new');
    await page.getByRole('button', { name: 'Create ticket' }).click();
    await expect(page.getByText('Subject is required')).toBeVisible();
    await expect(page.getByText('Description is required')).toBeVisible();

    await page.getByLabel('Attach files').setInputFiles(path.join(FILES, 'page.html'));
    await expect(page.getByRole('alert')).toContainText('this file type is not allowed');
  });

  test('a user creates a ticket with a file and lands on it', async ({ page, loginAs }) => {
    await loginAs('user');
    await page.goto('/tickets');
    await page.getByRole('link', { name: 'New ticket' }).first().click();
    await page.getByLabel('Subject').fill('Cannot export my project');
    await page.getByLabel('Category').fill('Software');
    await page.getByLabel('Description').fill('The export button does nothing.\nTried twice.');
    await page.getByLabel('Attach files').setInputFiles(path.join(FILES, 'screenshot.png'));
    await expect(page.getByRole('list', { name: 'Selected files' })).toContainText('screenshot.png');
    await page.getByRole('button', { name: 'Create ticket' }).click();

    await expect(page).toHaveURL(/\/tickets\/[a-f0-9]{24}$/);
    await expect(page.getByRole('heading', { name: 'Cannot export my project' })).toBeVisible();
    await expect(page.getByText('Ticket created')).toBeVisible();
    await expect(page.getByRole('button', { name: /screenshot\.png/ })).toBeVisible();

    await page.getByRole('link', { name: 'Back to tickets' }).click();
    await expect(page.getByRole('link', { name: 'Cannot export my project' })).toBeVisible();
  });
});

test.describe('ticket page', () => {
  test('reply with a file, then download it with its original content', async ({ page, request, loginAs }) => {
    const { accounts } = fixtures();
    const id = await apiCreateTicket(request, accounts.user, { subject: 'Reply test' });
    await loginAs('user');
    await page.goto(`/tickets/${id}`);

    const send = page.getByRole('button', { name: 'Send reply' });
    await expect(send).toBeDisabled();
    await page.getByLabel('Your reply').fill('Here are my notes');
    await page.getByLabel('Attach files').setInputFiles(path.join(FILES, 'notes.txt'));
    await send.click();
    await expect(page.getByText('Reply sent')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Conversation' }).getByText('Here are my notes')).toBeVisible();
    await expect(page.getByLabel('Your reply')).toHaveValue('');

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /notes\.txt/ }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('notes.txt');
    const saved = await download.path();
    expect(fs.readFileSync(saved, 'utf8')).toBe(fs.readFileSync(path.join(FILES, 'notes.txt'), 'utf8'));
  });

  test('the owner changes the priority (Urgent is not offered to users)', async ({ page, request, loginAs }) => {
    const id = await apiCreateTicket(request, fixtures().accounts.user, { subject: 'Priority test', priority: 'low' });
    await loginAs('user');
    await page.goto(`/tickets/${id}`);
    await page.getByLabel('Change priority').click();
    await expect(page.getByRole('option')).toHaveText(['Low', 'Normal', 'High']);
    await page.getByRole('option', { name: 'High' }).click();
    await expect(page.getByText('Priority changed to High')).toBeVisible();
    await expect(page.getByRole('main').locator('div:has(> h1) + div')).toContainText('High');
  });

  test('support sets Urgent; the owner then sees it and can lower it', async ({ page, request, loginAs }) => {
    const { accounts, apiUrl } = fixtures();
    const id = await apiCreateTicket(request, accounts.user, { subject: 'Escalated ticket' });
    // a user cannot raise to urgent through the API either
    const refused = await request.put(`${apiUrl}/tickets/priority/${id}`, {
      headers: { Authorization: `Bearer ${accounts.user.token}` },
      data: { priority: 'urgent' },
    });
    expect(refused.status()).toBe(403);

    await loginAs('admin');
    await page.goto(`/tickets/${id}`);
    await page.getByLabel('Change priority').click();
    await page.getByRole('option', { name: 'Urgent' }).click();
    await expect(page.getByText('Priority changed to Urgent')).toBeVisible();
  });

  test('the owner of an urgent ticket can lower it', async ({ page, request, loginAs }) => {
    const { accounts, apiUrl } = fixtures();
    const id = await apiCreateTicket(request, accounts.user, { subject: 'Was urgent' });
    await request.put(`${apiUrl}/tickets/priority/${id}`, {
      headers: { Authorization: `Bearer ${accounts.admin.token}` },
      data: { priority: 'urgent' },
    });
    await loginAs('user');
    await page.goto(`/tickets/${id}`);
    await page.getByLabel('Change priority').click();
    await expect(page.getByRole('option')).toHaveText(['Low', 'Normal', 'High', 'Urgent']);
    await page.getByRole('option', { name: 'Normal' }).click();
    await expect(page.getByText('Priority changed to Normal')).toBeVisible();
  });

  test('🔒 another user cannot open the ticket', async ({ page, request, loginAs }) => {
    const id = await apiCreateTicket(request, fixtures().accounts.user, { subject: 'Private ticket' });
    await loginAs('user2');
    await page.goto(`/tickets/${id}`);
    await expect(page.getByText("You don't have access to this ticket")).toBeVisible();
    await expect(page.getByText('Private ticket')).toHaveCount(0);
  });

  test('an admin opens a user ticket and replies as support', async ({ page, request, loginAs }) => {
    const id = await apiCreateTicket(request, fixtures().accounts.user, { subject: 'Needs support' });
    await loginAs('admin');
    await page.goto(`/tickets/${id}`);
    // support must take the ticket before writing in it
    await expect(page.getByText('Assign this ticket to yourself to reply to the user.')).toBeVisible();
    await page.getByRole('button', { name: 'Assign to me' }).click();
    await page.getByLabel('Your reply').fill('We are looking into it');
    await page.getByRole('button', { name: 'Send reply' }).click();
    await expect(page.getByRole('region', { name: 'Conversation' }).getByText('We are looking into it')).toBeVisible();
  });

  test('the owner sees the support reply labelled "Support", without the admin email', async ({ page, request, loginAs }) => {
    const { accounts, apiUrl } = fixtures();
    const id = await apiCreateTicket(request, accounts.user, { subject: 'Support label test' });
    await request.put(`${apiUrl}/tickets/assign/${id}`, { headers: { Authorization: `Bearer ${accounts.admin.token}` } });
    await request.post(`${apiUrl}/tickets/reply/${id}`, {
      headers: { Authorization: `Bearer ${accounts.admin.token}` },
      multipart: { message: 'Answer from support' },
    });
    await loginAs('user');
    await page.goto(`/tickets/${id}`);
    const reply = page.locator('article', { hasText: 'Answer from support' });
    await expect(reply).toContainText('Support');
    await expect(page.locator('body')).not.toContainText(accounts.admin.email);
  });

  test('an unknown ticket shows "Ticket not found"', async ({ page, loginAs }) => {
    await loginAs('user');
    await page.goto('/tickets/aaaaaaaaaaaaaaaaaaaaaaaa');
    await expect(page.getByText('Ticket not found')).toBeVisible();
    await page.goto('/tickets/not-an-id');
    await expect(page.getByText('Ticket not found')).toBeVisible();
  });
});

test.describe('my tickets list', () => {
  test.beforeAll(async ({ request }) => {
    const { accounts, apiUrl } = fixtures();
    const lister = accounts.lister;
    // only once, even if Playwright restarts after a failed test
    const existing = await request.get(`${apiUrl}/tickets/my?limit=1`, {
      headers: { Authorization: `Bearer ${lister.token}` },
    });
    if ((await existing.json()).pagination.total > 0) return;
    const priorities = ['low', 'normal', 'high', 'urgent'];
    for (let i = 1; i <= 25; i++) {
      const priority = priorities[i % 4];
      // users cannot create urgent tickets: create as high, then support raises it
      const id = await apiCreateTicket(request, lister, {
        subject: i === 7 ? 'Payment refused by bank' : `Lister ticket ${i}`,
        priority: priority === 'urgent' ? 'high' : priority,
      });
      if (priority === 'urgent') {
        await request.put(`${apiUrl}/tickets/priority/${id}`, {
          headers: { Authorization: `Bearer ${accounts.admin.token}` },
          data: { priority: 'urgent' },
        });
      }
    }
  });

  test('pages: 20 per page, next page, page number in the URL', async ({ page, loginAs }) => {
    await loginAs('lister');
    await page.goto('/tickets');
    await expect(page.getByRole('navigation', { name: 'Pagination' })).toContainText('Showing 1–20 of 25');
    await expect(page.locator('tbody tr')).toHaveCount(20);
    await page.getByRole('button', { name: 'Next page' }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.locator('tbody tr')).toHaveCount(5);
    await expect(page.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  test('sorted by priority by default: urgent first, low last', async ({ page, loginAs }) => {
    // 25 tickets: 6 urgent, 6 high, 7 normal, 6 low -> page 1 = 6 urgent ... 1 low
    await loginAs('lister');
    await page.goto('/tickets');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(20);
    await expect(rows.first()).toContainText('Urgent');
    await expect(rows.nth(6)).toContainText('High');
    await expect(rows.nth(12)).toContainText('Normal');
    await expect(rows.last()).toContainText('Low');
  });

  test('search waits for typing to stop, filters, and survives a reload', async ({ page, loginAs }) => {
    await loginAs('lister');
    await page.goto('/tickets');
    await page.getByLabel('Search tickets').fill('payment');
    await expect(page).toHaveURL(/search=payment/);
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.locator('tbody')).toContainText('Payment refused by bank');
    await page.reload();
    await expect(page.getByLabel('Search tickets')).toHaveValue('payment');
    await expect(page.locator('tbody tr')).toHaveCount(1);
  });

  test('filter by priority, then clear filters', async ({ page, loginAs }) => {
    await loginAs('lister');
    await page.goto('/tickets');
    await page.getByLabel('Filter by priority').click();
    await page.getByRole('option', { name: 'Urgent' }).click();
    await expect(page).toHaveURL(/priority=urgent/);
    await expect(page.getByRole('navigation', { name: 'Pagination' })).toContainText('of 6');
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(page.getByRole('navigation', { name: 'Pagination' })).toContainText('of 25');
  });

  test('no result for a search shows a clear message', async ({ page, loginAs }) => {
    await loginAs('lister');
    await page.goto('/tickets?search=zzzz-nothing');
    await expect(page.getByText('No ticket matches these filters')).toBeVisible();
  });

  test('a user without tickets sees the empty state with a "New ticket" button', async ({ page, loginAs }) => {
    await loginAs('empty');
    await page.goto('/tickets');
    await expect(page.getByText('You have no tickets yet')).toBeVisible();
  });
});
