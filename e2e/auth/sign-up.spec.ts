import { test, expect } from '../fixtures/base';
import { createTestUser } from '../helpers/database';
import { TEST_USERS, INVALID_PASSWORDS } from '../fixtures/test-data';

test.describe('Sign Up', () => {
  test('should successfully register with valid information', async ({ page, cleanDatabase }) => {
    await page.goto('/register');

    // Fill in registration form
    await page.getByTestId('register-username-input').fill('new_user');
    await page.getByTestId('register-fullname-input').fill('New User');
    await page.getByTestId('register-password-input').fill('ValidPass123!');
    await page.getByTestId('register-confirm-password-input').fill('ValidPass123!');

    // Submit form
    await page.getByTestId('register-submit-button').click();

    // Should redirect to timeline
    await page.waitForURL('/timeline', { timeout: 5000 });
    await expect(page).toHaveURL('/timeline');

    // Should be authenticated
    await expect(page.getByTestId('navbar-user-menu-trigger')).toBeVisible();
  });

  test('should show error when username already exists', async ({ page, cleanDatabase }) => {
    // Create existing user
    await createTestUser(TEST_USERS.user1);

    await page.goto('/register');

    // Try to register with same username
    await page.getByTestId('register-username-input').fill(TEST_USERS.user1.username);
    await page.getByTestId('register-fullname-input').fill('Another User');
    await page.getByTestId('register-password-input').fill('ValidPass123!');
    await page.getByTestId('register-confirm-password-input').fill('ValidPass123!');

    await page.getByTestId('register-submit-button').click();

    // Should show error
    await expect(page.getByTestId('register-error-message')).toBeVisible();
    await expect(page.locator('text=Username already exists')).toBeVisible();
  });

  test('should validate password strength - too short', async ({ page }) => {
    await page.goto('/register');

    await page.getByTestId('register-username-input').fill('testuser');
    await page.getByTestId('register-fullname-input').fill('Test User');
    await page.getByTestId('register-password-input').fill('Short1!');
    await page.getByTestId('register-confirm-password-input').fill('Short1!');

    // Button should be disabled due to weak password
    const submitButton = page.getByTestId('register-submit-button');
    await expect(submitButton).toBeDisabled();
  });

  test('should validate password strength - no uppercase', async ({ page }) => {
    await page.goto('/register');

    await page.getByTestId('register-username-input').fill('testuser');
    await page.getByTestId('register-fullname-input').fill('Test User');
    await page.getByTestId('register-password-input').fill('nouppercase123!');
    await page.getByTestId('register-confirm-password-input').fill('nouppercase123!');

    // Button should be disabled
    const submitButton = page.getByTestId('register-submit-button');
    await expect(submitButton).toBeDisabled();
  });

  test('should validate password strength - no special character', async ({ page }) => {
    await page.goto('/register');

    await page.getByTestId('register-username-input').fill('testuser');
    await page.getByTestId('register-fullname-input').fill('Test User');
    await page.getByTestId('register-password-input').fill('NoSpecial123');
    await page.getByTestId('register-confirm-password-input').fill('NoSpecial123');

    // Button should be disabled
    const submitButton = page.getByTestId('register-submit-button');
    await expect(submitButton).toBeDisabled();
  });

  test('should show error when passwords do not match', async ({ page }) => {
    await page.goto('/register');

    await page.getByTestId('register-username-input').fill('testuser');
    await page.getByTestId('register-fullname-input').fill('Test User');
    await page.getByTestId('register-password-input').fill('ValidPass123!');
    await page.getByTestId('register-confirm-password-input').fill('DifferentPass123!');

    // Should show mismatch error
    await expect(page.locator('text=Passwords do not match')).toBeVisible();

    // Button should be disabled
    const submitButton = page.getByTestId('register-submit-button');
    await expect(submitButton).toBeDisabled();
  });

  test('should validate username format - only alphanumeric', async ({ page }) => {
    await page.goto('/register');

    await page.getByTestId('register-username-input').fill('invalid@user!');
    await page.getByTestId('register-fullname-input').fill('Test User');
    await page.getByTestId('register-password-input').fill('ValidPass123!');
    await page.getByTestId('register-confirm-password-input').fill('ValidPass123!');

    // Should show username validation error
    await expect(page.locator('text=/.*only.*letters.*numbers.*/i')).toBeVisible();

    // Button should be disabled
    const submitButton = page.getByTestId('register-submit-button');
    await expect(submitButton).toBeDisabled();
  });

  test('should require all fields to be filled', async ({ page }) => {
    await page.goto('/register');

    // Leave all fields empty
    const submitButton = page.getByTestId('register-submit-button');
    await expect(submitButton).toBeDisabled();

    // Fill only username
    await page.getByTestId('register-username-input').fill('testuser');
    await expect(submitButton).toBeDisabled();

    // Fill full name
    await page.getByTestId('register-fullname-input').fill('Test User');
    await expect(submitButton).toBeDisabled();

    // Fill password
    await page.getByTestId('register-password-input').fill('ValidPass123!');
    await expect(submitButton).toBeDisabled();

    // Fill confirm password - now should be enabled
    await page.getByTestId('register-confirm-password-input').fill('ValidPass123!');
    await expect(submitButton).toBeEnabled();
  });

  test('should navigate to login page from register', async ({ page }) => {
    await page.goto('/register');

    // Click login link
    await page.getByTestId('register-login-link').click();

    // Should redirect to login page
    await expect(page).toHaveURL('/login');
  });

  test('should display password strength indicator', async ({ page }) => {
    await page.goto('/register');

    await page.getByTestId('register-username-input').fill('testuser');
    await page.getByTestId('register-fullname-input').fill('Test User');

    // Type a weak password
    await page.getByTestId('register-password-input').fill('weak');

    // Should show password strength indicator
    await expect(page.locator('text=/.*strength.*/i')).toBeVisible();
  });
});
