import { test, expect } from '../fixtures/base';
import { createTestUser } from '../helpers/database';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('Sign In', () => {
  test('should successfully sign in with valid credentials', async ({ page, cleanDatabase }) => {
    await createTestUser(TEST_USERS.user1);

    await page.goto('/login');

    const usernameInput = page.getByTestId('login-username-input');
    const passwordInput = page.getByTestId('login-password-input');
    const submitButton = page.getByTestId('login-submit-button');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill(TEST_USERS.user1.username);

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(TEST_USERS.user1.password);

    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();

    await expect(page).toHaveURL('/timeline');
    await expect(page.getByTestId('navbar-user-menu-trigger')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page, cleanDatabase }) => {
    await page.goto('/login');

    const usernameInput = page.getByTestId('login-username-input');
    const passwordInput = page.getByTestId('login-password-input');
    const submitButton = page.getByTestId('login-submit-button');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill('nonexistent_user');

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill('WrongPassword123!');

    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();

    await expect(page.locator('text=Invalid username or password')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('should show validation error when fields are empty', async ({ page }) => {
    await page.goto('/login');

    const submitButton = page.getByTestId('login-submit-button');
    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();

    await expect(page.locator('text=Please fill in all fields')).toBeVisible();
  });

  test('should navigate to sign up page from login', async ({ page }) => {
    await page.goto('/login');

    const signupLink = page.getByTestId('login-signup-link');
    await signupLink.waitFor({ state: 'visible' });
    await signupLink.click();

    await expect(page).toHaveURL('/register');
  });

  test('should persist authentication after page reload', async ({ page, cleanDatabase }) => {
    await createTestUser(TEST_USERS.user1);

    await page.goto('/login');

    const usernameInput = page.getByTestId('login-username-input');
    const passwordInput = page.getByTestId('login-password-input');
    const submitButton = page.getByTestId('login-submit-button');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill(TEST_USERS.user1.username);

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(TEST_USERS.user1.password);

    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();

    await page.waitForURL('/timeline');

    await page.reload();

    await expect(page).toHaveURL('/timeline');
    await expect(page.getByTestId('navbar-user-menu-trigger')).toBeVisible();
  });
});
