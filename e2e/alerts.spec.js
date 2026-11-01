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
  await admin.getByLabel('Your reply').fill('Which version do you use?');
  await admin.getByRole('button', { name: 'Send reply' }).click();
  await expect(admin.getByText('Which version do you use?')).toBeVisible();
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
  await expect(user.getByText('Version 2.1')).toBeVisible();
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
