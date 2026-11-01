// Profile page: account info and password change
import { test, expect, fixtures, TOKEN_KEY } from './fixtures';

test('shows the account information', async ({ page, loginAs }) => {
  const account = await loginAs('profile');
  await page.goto('/profile');
  await expect(page.locator('dl').first()).toContainText(account.email);
  await expect(page.locator('dl').first()).toContainText(`${account.username} ${account.lastname}`);
});

test('wrong current password is refused', async ({ page, loginAs }) => {
  await loginAs('profile');
  await page.goto('/profile');
  await page.getByLabel('Current password').fill('not-my-password');
  await page.getByLabel('New password', { exact: true }).fill('brand-new-123');
  await page.getByLabel('Confirm new password').fill('brand-new-123');
  await page.getByRole('button', { name: 'Change password' }).click();
  await expect(page.getByRole('alert')).toContainText('Current password is incorrect');
});

test('changing the password keeps this browser logged in and logs out the old token', async ({ page, request, loginAs }) => {
  const { password, apiUrl } = fixtures();
  const account = await loginAs('profile');
  await page.goto('/profile');
  await page.getByLabel('Current password').fill(password);
  await page.getByLabel('New password', { exact: true }).fill('brand-new-123');
  await page.getByLabel('Confirm new password').fill('brand-new-123');
  await page.getByRole('button', { name: 'Change password' }).click();
  await expect(page.getByText('Password changed')).toBeVisible();

  // this browser got the new token: still logged in after a reload
  const newToken = await page.evaluate((key) => localStorage.getItem(key), TOKEN_KEY);
  expect(newToken).not.toBe(account.token);
  await page.reload();
  await expect(page.getByText(account.email).first()).toBeVisible();

  // the old token (another device) no longer works
  const res = await request.get(`${apiUrl}/auth/me`, { headers: { Authorization: `Bearer ${account.token}` } });
  expect(res.status()).toBe(401);
});
