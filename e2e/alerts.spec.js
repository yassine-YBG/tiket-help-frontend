// Who must act next: "Needs reply" for support, "New answer" for the owner, menu counters
import { test, expect, fixtures } from './fixtures';

const api = (account) => ({ headers: { Authorization: `Bearer ${account.token}` } });

test('the full conversation: each side sees when the other one wrote', async ({ browser }) => {
  const { accounts, apiUrl } = fixtures();
  const TOKEN_KEY = 'tiket-help-token';
  const pageAs = async (key) => {
    const context = await browser.newContext();
    await context.addInitScript(([k, token]) => localStorage.setItem(k, token), [TOKEN_KEY, accounts[key].token]);
    return context.newPage();
  };
  const user = await pageAs('alerts');
  const admin = await pageAs('admin');

  // 1. the user opens a ticket -> support sees "Needs reply" and a red counter
  await user.goto('/tickets/new');
  await user.getByLabel('Subject').fill('Alerts flow');
  await user.getByLabel('Category').fill('Software');
  await user.getByLabel('Description').fill('My app crashes');
  await user.getByRole('button', { name: 'Create ticket' }).click();
  await expect(user.getByRole('heading', { name: 'Alerts flow' })).toBeVisible();

  await admin.goto('/admin/tickets?awaitingSupport=true&search=Alerts+flow');
  const menu = admin.getByRole('navigation', { name: 'Main' });
  await expect(menu.getByLabel(/waiting for a support reply/)).toBeVisible();
  const row = admin.getByRole('row').filter({ hasText: 'Alerts flow' });
  await expect(row).toContainText('Needs reply');

  // 2. support answers -> no longer "Needs reply"; the user gets "New answer" + counter
  await row.getByRole('link', { name: 'Alerts flow' }).click();
  await admin.getByRole('button', { name: 'Assign to me' }).click();
  await admin.getByLabel('Your reply').fill('Which version do you use?');
  await admin.getByRole('button', { name: 'Send reply' }).click();
  await expect(admin.getByRole('region', { name: 'Conversation' }).getByText('Which version do you use?')).toBeVisible();
  await admin.goto('/admin/tickets?awaitingSupport=true&search=Alerts+flow');
  await expect(admin.getByText('No ticket matches these filters')).toBeVisible();

  await user.goto('/tickets');
  await expect(user.getByRole('navigation', { name: 'Main' }).getByLabel('1 ticket with a new answer')).toBeVisible();
  await expect(user.getByRole('row').filter({ hasText: 'Alerts flow' })).toContainText('New answer');

  // 3. the user opens it -> the alert disappears
  await user.getByRole('link', { name: 'Alerts flow' }).click();
  await expect(user.getByText('Which version do you use?')).toBeVisible();
  await expect(user.getByRole('navigation', { name: 'Main' }).getByLabel(/new answer/)).toHaveCount(0);
  await user.getByRole('link', { name: 'Back to tickets' }).click();
  await expect(user.getByRole('row').filter({ hasText: 'Alerts flow' })).not.toContainText('New answer');

  // 4. the user answers -> "Needs reply" again for support
  await user.getByRole('link', { name: 'Alerts flow' }).click();
  await user.getByLabel('Your reply').fill('Version 2.1');
  await user.getByRole('button', { name: 'Send reply' }).click();
  await expect(user.getByRole('region', { name: 'Conversation' }).getByText('Version 2.1')).toBeVisible();
  await admin.goto('/admin/tickets?awaitingSupport=true&search=Alerts+flow');
  await expect(admin.getByRole('row').filter({ hasText: 'Alerts flow' })).toContainText('Needs reply');

  // 5. resolved -> closed for both, nobody waits; the user is told it was resolved
  const list = await admin.request.get(`${apiUrl}/tickets?search=Alerts+flow`, api(accounts.admin));
  const id = (await list.json()).tickets[0]._id;
  await admin.goto(`/tickets/${id}`);
  await admin.getByLabel('Change status').click();
  await admin.getByRole('option', { name: 'Resolved' }).click();
  await expect(admin.getByLabel('Your reply')).toHaveCount(0);

  await user.goto('/tickets');
  await expect(user.getByRole('row').filter({ hasText: 'Alerts flow' })).toContainText('New answer');
  await user.getByRole('link', { name: 'Alerts flow' }).click();
  await expect(user.getByRole('note')).toContainText('If the problem comes back, open a new ticket');
  await expect(user.getByLabel('Your reply')).toHaveCount(0);

  await user.context().close();
  await admin.context().close();
});

test('the refresh button shows new data without reloading the page', async ({ page, request, loginAs }) => {
  const { accounts, apiUrl } = fixtures();
  await loginAs('admin');
  await page.goto('/admin/tickets?search=Refresh+button');
  await expect(page.getByText('No ticket matches these filters')).toBeVisible();
  await page.getByLabel('Filter by reply').click();
  await page.getByRole('option', { name: 'Needs reply' }).click();

  // a user writes from another computer
  const res = await request.post(`${apiUrl}/tickets/create`, {
    ...api(accounts.alerts),
    multipart: { subject: 'Refresh button test', category: 'Software', description: 'New!' },
  });
  expect(res.status()).toBe(201);

  await page.getByRole('button', { name: 'Refresh' }).click();
  await expect(page.getByRole('link', { name: 'Refresh button test' })).toBeVisible();
  // same page, filters kept
  await expect(page).toHaveURL(/search=Refresh/);
  await expect(page).toHaveURL(/awaitingSupport=true/);
  await expect(page.getByLabel('Search tickets')).toHaveValue('Refresh button');
});

test('next to the ticket title: refresh shows a new reply and keeps the text being typed', async ({ page, request, loginAs }) => {
  const { accounts, apiUrl } = fixtures();
  const created = await request.post(`${apiUrl}/tickets/create`, {
    ...api(accounts.alerts),
    multipart: { subject: 'Refresh on ticket', category: 'Software', description: 'Hello' },
  });
  const id = (await created.json()).ticketId;

  await loginAs('alerts');
  await page.goto(`/tickets/${id}`);
  await page.getByLabel('Your reply').fill('Typed but not sent');

  // support answers from another computer
  await request.put(`${apiUrl}/tickets/assign/${id}`, api(accounts.admin));
  await request.post(`${apiUrl}/tickets/reply/${id}`, { ...api(accounts.admin), data: { message: 'Answer from support' } });

  await page.getByRole('button', { name: 'Refresh' }).click();
  await expect(page.getByText('Answer from support')).toBeVisible();
  await expect(page.getByText('Updated', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Your reply')).toHaveValue('Typed but not sent');

  // nothing new -> "Already up to date"
  // (opening the answer marks it seen, so let that settle with one more refresh first)
  await page.getByRole('button', { name: 'Refresh' }).click();
  await expect(page.getByRole('button', { name: 'Refresh' })).toBeEnabled();
  await page.getByRole('button', { name: 'Refresh' }).click();
  await expect(page.getByText('Already up to date')).toBeVisible();
});

test('the refresh button is next to the title of My tickets, not in the top bar', async ({ page, loginAs }) => {
  await loginAs('user');
  await page.goto('/tickets');
  await expect(page.getByRole('banner').getByRole('button', { name: 'Refresh' })).toHaveCount(0);
  await expect(page.getByRole('main').getByRole('button', { name: 'Refresh' })).toBeVisible();
});
