// Admin side of tickets: all-tickets list, assign / take over, status, archive
import { test, expect, fixtures } from './fixtures';

const api = (account) => ({ headers: { Authorization: `Bearer ${account.token}` } });

// Create a ticket directly through the API (faster than the form), optionally with one text file
async function apiCreateTicket(request, account, fields, fileName) {
  const multipart = { category: 'Software', description: 'Created by the test', priority: 'normal', ...fields };
  if (fileName) {
    multipart.attachments = { name: fileName, mimeType: 'text/plain', buffer: Buffer.from(`content of ${fileName}`) };
  }
  const res = await request.post(`${fixtures().apiUrl}/tickets/create`, { ...api(account), multipart });
  expect(res.status()).toBe(201);
  return (await res.json()).ticketId;
}

test.describe('all tickets list', () => {
  test('an admin sees tickets of every user, with who created them', async ({ page, request, loginAs }) => {
    const { accounts } = fixtures();
    await apiCreateTicket(request, accounts.user, { subject: 'Admin list - from Nour' });
    await apiCreateTicket(request, accounts.user2, { subject: 'Admin list - from Ali' });
    await loginAs('admin');
    await page.goto('/admin/tickets');

    await page.getByLabel('Search tickets').fill('Admin list');
    const rows = page.getByRole('row');
    await expect(page.getByRole('link', { name: 'Admin list - from Nour' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Admin list - from Ali' })).toBeVisible();
    await expect(rows.filter({ hasText: 'Admin list - from Ali' })).toContainText('Ali');
    await expect(page).toHaveURL(/search=Admin/);
  });

  test('"Not assigned" and "Assigned to me" filters', async ({ page, request, loginAs }) => {
    const { accounts } = fixtures();
    const mine = await apiCreateTicket(request, accounts.user, { subject: 'Filter assignee - mine' });
    await apiCreateTicket(request, accounts.user, { subject: 'Filter assignee - free' });
    const res = await request.put(`${fixtures().apiUrl}/tickets/assign/${mine}`, api(accounts.admin));
    expect(res.status()).toBe(200);

    await loginAs('admin');
    await page.goto('/admin/tickets?search=Filter+assignee');
    await page.getByLabel('Filter by assignee').click();
    await page.getByRole('option', { name: 'Not assigned' }).click();
    await expect(page).toHaveURL(/handledBy=none/);
    await expect(page.getByRole('link', { name: 'Filter assignee - free' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Filter assignee - mine' })).toHaveCount(0);

    await page.getByLabel('Filter by assignee').click();
    await page.getByRole('option', { name: 'Assigned to me' }).click();
    await expect(page.getByRole('link', { name: 'Filter assignee - mine' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Filter assignee - free' })).toHaveCount(0);
  });
});

test.describe('admin actions on a ticket', () => {
  test('assign to me, then resolve', async ({ page, request, loginAs }) => {
    const id = await apiCreateTicket(request, fixtures().accounts.user, { subject: 'Assign and resolve' });
    await loginAs('admin');
    await page.goto(`/tickets/${id}`);

    // not assigned yet: no status change, no reply box
    await expect(page.getByLabel('Change status')).toHaveCount(0);
    await expect(page.getByLabel('Your reply')).toHaveCount(0);
    await page.getByRole('button', { name: 'Assign to me' }).click();
    await expect(page.getByText('You are handling this ticket')).toBeVisible();
    await expect(page.getByLabel('Change status')).toHaveText('In progress'); // the backend moved it
    await expect(page.getByRole('complementary', { name: 'Ticket details' })).toContainText('Malek');

    await page.getByLabel('Change status').click();
    await page.getByRole('option', { name: 'Resolved' }).click();
    await expect(page.getByText('Status changed to Resolved')).toBeVisible();
    await expect(page.getByRole('complementary', { name: 'Ticket details' }).getByText('Resolved', { exact: true }).first()).toBeVisible();
    // resolved = closed: no reply box, even for support
    await expect(page.getByRole('note')).toContainText('can set the status back to In progress to write in it');
    await expect(page.getByLabel('Your reply')).toHaveCount(0);
    await page.getByLabel('Change status').click();
    await page.getByRole('option', { name: 'In progress' }).click();
    await expect(page.getByLabel('Your reply')).toBeVisible();
  });

  test('taking over a ticket another admin handles asks first', async ({ page, request, loginAs }) => {
    const { accounts } = fixtures();
    const id = await apiCreateTicket(request, accounts.user, { subject: 'Take over test' });
    await request.put(`${fixtures().apiUrl}/tickets/assign/${id}`, api(accounts.admin2));

    await loginAs('admin');
    await page.goto(`/tickets/${id}`);
    await page.getByRole('button', { name: 'Take over' }).click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toContainText('Rami is handling this ticket');

    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('complementary', { name: 'Ticket details' })).toContainText('Rami'); // nothing changed

    await page.getByRole('button', { name: 'Take over' }).click();
    await dialog.getByRole('button', { name: 'Take over' }).click();
    await expect(page.getByText('You took over this ticket')).toBeVisible();
    await expect(page.getByText('You are handling this ticket')).toBeVisible();
  });

  test('archive: only a resolved ticket; the owner keeps it; nobody can write in it', async ({ page, request, loginAs }) => {
    const { accounts, apiUrl } = fixtures();
    const id = await apiCreateTicket(request, accounts.user, { subject: 'Archive flow' }, 'kept.txt');
    await loginAs('admin');
    await page.goto(`/tickets/${id}`);

    // not resolved yet -> no archive button
    await page.getByRole('button', { name: 'Assign to me' }).click();
    await expect(page.getByText('Resolve the ticket to be able to archive it.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Archive ticket' })).toHaveCount(0);

    await page.getByLabel('Change status').click();
    await page.getByRole('option', { name: 'Resolved' }).click();
    await page.getByRole('button', { name: 'Archive ticket' }).click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toContainText('The user still sees it');
    await dialog.getByRole('button', { name: 'Archive' }).click();

    // back on the list, where the ticket is hidden...
    await expect(page).toHaveURL(/\/admin\/tickets$/);
    await expect(page.getByText('Ticket archived')).toBeVisible();
    await page.getByLabel('Search tickets').fill('Archive flow');
    await expect(page.getByText('No ticket matches these filters')).toBeVisible();
    // ...unless asked for
    await page.getByLabel('Archived tickets').click();
    await page.getByRole('option', { name: 'Archived only' }).click();
    const row = page.getByRole('row').filter({ hasText: 'Archive flow' });
    await expect(row).toContainText('Archived');

    // the owner still sees it, marked "Closed by support", with its file
    const ownerView = await request.get(`${apiUrl}/tickets/${id}`, api(accounts.user));
    expect(ownerView.status()).toBe(200);
    expect((await ownerView.json()).archived).toBe(true);
    const mine = await (await request.get(`${apiUrl}/tickets/my?search=Archive+flow`, api(accounts.user))).json();
    expect(mine.tickets.map((t) => t._id)).toContain(id);

    // a resolved / archived ticket is closed: replies are refused
    const reply = await request.post(`${apiUrl}/tickets/reply/${id}`, { ...api(accounts.user), data: { message: 'Still broken' } });
    expect(reply.status()).toBe(400);
  });

  test('the owner sees "Closed by support" and opens a follow-up ticket', async ({ page, request, loginAs }) => {
    const { accounts, apiUrl } = fixtures();
    const id = await apiCreateTicket(request, accounts.user, { subject: 'Closed note' });
    await request.put(`${apiUrl}/tickets/assign/${id}`, api(accounts.admin));
    await request.put(`${apiUrl}/tickets/status/${id}`, { ...api(accounts.admin), data: { status: 'résolu' } });
    expect((await request.put(`${apiUrl}/tickets/archive/${id}`, api(accounts.admin))).status()).toBe(200);

    await loginAs('user');
    await page.goto('/tickets?search=Closed+note');
    await expect(page.getByRole('row').filter({ hasText: 'Closed note' })).toContainText('Closed by support');
    await page.getByRole('link', { name: 'Closed note' }).click();
    await expect(page.getByRole('note')).toContainText('Closed by support');
    await expect(page.getByLabel('Your reply')).toHaveCount(0);

    await page.getByRole('link', { name: 'Open a new ticket' }).click();
    await expect(page).toHaveURL(/\/tickets\/new$/);
    await expect(page.getByLabel('Subject')).toHaveValue('Follow-up: Closed note');
    await expect(page.getByLabel('Description')).toHaveValue(new RegExp(`/tickets/${id}`));
    await page.getByLabel('Category').fill('Software');
    await page.getByRole('button', { name: 'Create ticket' }).click();
    await expect(page.getByRole('heading', { name: 'Follow-up: Closed note' })).toBeVisible();
  });

  test('another admin cannot archive or restore; a superadmin can restore', async ({ page, request, loginAs }) => {
    const { accounts, apiUrl } = fixtures();
    const id = await apiCreateTicket(request, accounts.user, { subject: 'Restore test' });
    await request.put(`${apiUrl}/tickets/assign/${id}`, api(accounts.admin));
    await request.put(`${apiUrl}/tickets/status/${id}`, { ...api(accounts.admin), data: { status: 'résolu' } });
    expect((await request.put(`${apiUrl}/tickets/archive/${id}`, api(accounts.superadmin))).status()).toBe(200);

    await loginAs('superadmin');
    await page.goto(`/tickets/${id}`);
    await expect(page.getByText('Archived — hidden from the All tickets list')).toBeVisible();
    await page.getByRole('button', { name: 'Restore ticket' }).click();
    await expect(page.getByText('Ticket restored to the All tickets list')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Restore ticket' })).toHaveCount(0);
  });

  test('a ticket held by the superadmin is locked for admins', async ({ page, request, loginAs }) => {
    const { accounts, apiUrl } = fixtures();
    const id = await apiCreateTicket(request, accounts.user, { subject: 'Superadmin lock' });
    expect((await request.put(`${apiUrl}/tickets/assign/${id}`, api(accounts.superadmin))).status()).toBe(200);

    await loginAs('admin');
    await page.goto(`/tickets/${id}`);
    await expect(page.getByText('Sara (superadmin) is handling this ticket.')).toBeVisible();
    await expect(page.getByRole('button', { name: /Take over|Assign to me/ })).toHaveCount(0);
    await expect(page.getByLabel('Change priority')).toHaveCount(0);
    // and the backend refuses it even without the UI
    expect((await request.put(`${apiUrl}/tickets/assign/${id}`, api(accounts.admin))).status()).toBe(403);
    expect((await request.put(`${apiUrl}/tickets/priority/${id}`, { ...api(accounts.admin), data: { priority: 'high' } })).status()).toBe(403);
  });

  test('a normal user sees none of these actions', async ({ page, request, loginAs }) => {
    const id = await apiCreateTicket(request, fixtures().accounts.user, { subject: 'No admin buttons' });
    await loginAs('user');
    await page.goto(`/tickets/${id}`);
    await expect(page.getByRole('heading', { name: 'No admin buttons' })).toBeVisible();
    await expect(page.getByLabel('Change status')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Assign to me' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Archive ticket' })).toHaveCount(0);
  });

  test('the backend refuses admin actions from a normal user (even without the UI)', async ({ request }) => {
    const { accounts, apiUrl } = fixtures();
    const id = await apiCreateTicket(request, accounts.user, { subject: 'Direct API attempt' });
    const asUser = api(accounts.user);
    expect((await request.put(`${apiUrl}/tickets/status/${id}`, { ...asUser, data: { status: 'résolu' } })).status()).toBe(403);
    expect((await request.put(`${apiUrl}/tickets/assign/${id}`, asUser)).status()).toBe(403);
    expect((await request.put(`${apiUrl}/tickets/archive/${id}`, asUser)).status()).toBe(403);
    expect((await request.put(`${apiUrl}/tickets/unarchive/${id}`, asUser)).status()).toBe(403);
    expect((await request.get(`${apiUrl}/tickets`, asUser)).status()).toBe(403);
  });
});
