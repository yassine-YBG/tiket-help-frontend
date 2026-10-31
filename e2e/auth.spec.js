// Login, register, session — the real app in a real browser
import { test, expect, fixtures, TOKEN_KEY } from './fixtures';

test.describe('login page', () => {
  test('visitors are sent to the login page', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText('Welcome back')).toBeVisible();
  });

  test('empty form shows field errors without calling the server', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('wrong password shows the server message', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(fixtures().accounts.user.email);
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByRole('alert')).toContainText('Invalid email or password');
  });

  test('account not activated yet is explained', async ({ page }) => {
    const { accounts, password } = fixtures();
    await page.goto('/login');
    await page.getByLabel('Email').fill(accounts.pending.email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByRole('alert')).toContainText('not activated yet');
  });

  test('a user logs in and lands on My tickets, without the admin menu', async ({ page }) => {
    const { accounts, password } = fixtures();
    await page.goto('/login');
    await page.getByLabel('Email').fill(accounts.user.email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/\/tickets$/);
    await expect(page.getByText(accounts.user.email)).toBeVisible();
    await expect(page.getByText('Administration')).toHaveCount(0);
  });

  test('after login the user goes back to the page they asked for', async ({ page }) => {
    const { accounts, password } = fixtures();
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login$/);
    await page.getByLabel('Email').fill(accounts.user2.email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/\/profile$/);
  });
});

test.describe('session', () => {
  test('the session survives a page reload', async ({ page, loginAs }) => {
    const account = await loginAs('user');
    await page.goto('/tickets');
    await expect(page.getByText(account.email)).toBeVisible();
    await page.reload();
    await expect(page.getByText(account.email)).toBeVisible();
  });

  test('a logged-in user cannot open the login page', async ({ page, loginAs }) => {
    await loginAs('user');
    await page.goto('/login');
    await expect(page).toHaveURL(/\/tickets$/);
  });

  test('log out removes the token and returns to login', async ({ page, loginAs }) => {
    await loginAs('user2');
    await page.goto('/tickets');
    await page.getByRole('button', { name: 'Log out' }).click();
    await expect(page).toHaveURL(/\/login$/);
    expect(await page.evaluate((key) => localStorage.getItem(key), TOKEN_KEY)).toBeNull();
  });

  test('when the server ends the session (password changed) the user is sent to login with a message', async ({ page, request, loginAs }) => {
    const { apiUrl, password } = fixtures();
    const account = await loginAs('changer');
    await page.goto('/tickets');
    await expect(page.getByText(account.email)).toBeVisible();

    // the password is changed somewhere else -> this browser's token becomes invalid
    const res = await request.put(`${apiUrl}/auth/me/password`, {
      headers: { Authorization: `Bearer ${account.token}` },
      data: { currentPassword: password, newPassword: 'another-secret-456' },
    });
    expect(res.status()).toBe(200);

    await page.getByRole('link', { name: 'Profile' }).click();
    await page.reload();
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe('register', () => {
  test('validates and creates an account waiting for activation', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('First name').fill('Yassine');
    await page.getByLabel('Last name').fill('Test');
    await page.getByLabel('Email').fill('new-account@e2e.test');
    await page.getByLabel('Password', { exact: true }).fill('secret123');
    await page.getByLabel('Confirm password').fill('different');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText('Passwords do not match')).toBeVisible();

    await page.getByLabel('Confirm password').fill('secret123');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText('Account created')).toBeVisible();
  });

  test('an email that is already registered shows the server error', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('First name').fill('Copy');
    await page.getByLabel('Last name').fill('Cat');
    await page.getByLabel('Email').fill(fixtures().accounts.admin.email);
    await page.getByLabel('Password', { exact: true }).fill('secret123');
    await page.getByLabel('Confirm password').fill('secret123');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('alert')).toContainText('Email already registered');
  });
});
