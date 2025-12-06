import { test, expect } from '../fixtures/base';
import { createTestUser } from '../helpers/database';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('Sign In', () => {
  test('should successfully sign in with valid credentials', async ({ page, cleanDatabase }) => {
    // Create a test user
    await createTestUser(TEST_USERS.user1);

    // Navigate to login page
    await page.goto('/login');

    // Fill in credentials
    await page.getByTestId('login-username-input').fill(TEST_USERS.user1.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.user1.password);

    // Submit login form
    await page.getByTestId('login-submit-button').click();

    // Should redirect to timeline
    await expect(page).toHaveURL('/timeline');

    // Should see user menu in navbar
    await expect(page.getByTestId('navbar-user-menu-trigger')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page, cleanDatabase }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill in invalid credentials
    await page.getByTestId('login-username-input').fill('nonexistent_user');
    await page.getByTestId('login-password-input').fill('WrongPassword123!');

    // Submit login form
    await page.getByTestId('login-submit-button').click();

    // Should show error message
    await expect(page.locator('text=Invalid username or password')).toBeVisible();

    // Should still be on login page
    await expect(page).toHaveURL('/login');
  });

  test('should show validation error when fields are empty', async ({ page }) => {
    await page.goto('/login');

    // Submit empty form
    await page.getByTestId('login-submit-button').click();

    // Should show validation error
    await expect(page.locator('text=Please fill in all fields')).toBeVisible();
  });

  test('should navigate to sign up page from login', async ({ page }) => {
    await page.goto('/login');

    // Click sign up link
    await page.getByTestId('login-signup-link').click();

    // Should redirect to register page
    await expect(page).toHaveURL('/register');
  });

  test('should persist authentication after page reload', async ({ page, cleanDatabase }) => {
    // Create a test user
    await createTestUser(TEST_USERS.user1);

    // Login
    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.user1.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.user1.password);
    await page.getByTestId('login-submit-button').click();

    await page.waitForURL('/timeline');

    // Reload page
    await page.reload();

    // Should still be authenticated
    await expect(page).toHaveURL('/timeline');
    await expect(page.getByTestId('navbar-user-menu-trigger')).toBeVisible();
  });
});
