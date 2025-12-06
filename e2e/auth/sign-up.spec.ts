import { test, expect } from '../fixtures/base';
import { createTestUser } from '../helpers/database';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('Sign Up', () => {
  test('should successfully register with valid information', async ({ page, cleanDatabase }) => {
    await page.goto('/register');

    const usernameInput = page.getByTestId('register-username-input');
    const fullnameInput = page.getByTestId('register-fullname-input');
    const passwordInput = page.getByTestId('register-password-input');
    const confirmPasswordInput = page.getByTestId('register-confirm-password-input');
    const submitButton = page.getByTestId('register-submit-button');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill('new_user');

    await fullnameInput.waitFor({ state: 'visible' });
    await fullnameInput.fill('New User');

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill('ValidPass123!');

    await confirmPasswordInput.waitFor({ state: 'visible' });
    await confirmPasswordInput.fill('ValidPass123!');

    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();

    await page.waitForURL('/timeline', { timeout: 5000 });
    await expect(page).toHaveURL('/timeline');
    await expect(page.getByTestId('navbar-user-menu-trigger')).toBeVisible();
  });

  test('should show error when username already exists', async ({ page, cleanDatabase }) => {
    await createTestUser(TEST_USERS.user1);

    await page.goto('/register');

    const usernameInput = page.getByTestId('register-username-input');
    const fullnameInput = page.getByTestId('register-fullname-input');
    const passwordInput = page.getByTestId('register-password-input');
    const confirmPasswordInput = page.getByTestId('register-confirm-password-input');
    const submitButton = page.getByTestId('register-submit-button');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill(TEST_USERS.user1.username);

    await fullnameInput.waitFor({ state: 'visible' });
    await fullnameInput.fill('Another User');

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill('ValidPass123!');

    await confirmPasswordInput.waitFor({ state: 'visible' });
    await confirmPasswordInput.fill('ValidPass123!');

    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();

    await expect(page.getByTestId('register-error-message')).toBeVisible();
    await expect(page.locator('text=Username already exists')).toBeVisible();
  });

  test('should validate password strength - too short', async ({ page }) => {
    await page.goto('/register');

    const usernameInput = page.getByTestId('register-username-input');
    const fullnameInput = page.getByTestId('register-fullname-input');
    const passwordInput = page.getByTestId('register-password-input');
    const confirmPasswordInput = page.getByTestId('register-confirm-password-input');
    const submitButton = page.getByTestId('register-submit-button');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill('testuser');

    await fullnameInput.waitFor({ state: 'visible' });
    await fullnameInput.fill('Test User');

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill('Short1!');

    await confirmPasswordInput.waitFor({ state: 'visible' });
    await confirmPasswordInput.fill('Short1!');

    await expect(submitButton).toBeDisabled();
  });

  test('should validate password strength - no uppercase', async ({ page }) => {
    await page.goto('/register');

    const usernameInput = page.getByTestId('register-username-input');
    const fullnameInput = page.getByTestId('register-fullname-input');
    const passwordInput = page.getByTestId('register-password-input');
    const confirmPasswordInput = page.getByTestId('register-confirm-password-input');
    const submitButton = page.getByTestId('register-submit-button');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill('testuser');

    await fullnameInput.waitFor({ state: 'visible' });
    await fullnameInput.fill('Test User');

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill('nouppercase123!');

    await confirmPasswordInput.waitFor({ state: 'visible' });
    await confirmPasswordInput.fill('nouppercase123!');

    await expect(submitButton).toBeDisabled();
  });

  test('should validate password strength - no special character', async ({ page }) => {
    await page.goto('/register');

    const usernameInput = page.getByTestId('register-username-input');
    const fullnameInput = page.getByTestId('register-fullname-input');
    const passwordInput = page.getByTestId('register-password-input');
    const confirmPasswordInput = page.getByTestId('register-confirm-password-input');
    const submitButton = page.getByTestId('register-submit-button');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill('testuser');

    await fullnameInput.waitFor({ state: 'visible' });
    await fullnameInput.fill('Test User');

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill('NoSpecial123');

    await confirmPasswordInput.waitFor({ state: 'visible' });
    await confirmPasswordInput.fill('NoSpecial123');

    await expect(submitButton).toBeDisabled();
  });

  test('should show error when passwords do not match', async ({ page }) => {
    await page.goto('/register');

    const usernameInput = page.getByTestId('register-username-input');
    const fullnameInput = page.getByTestId('register-fullname-input');
    const passwordInput = page.getByTestId('register-password-input');
    const confirmPasswordInput = page.getByTestId('register-confirm-password-input');
    const submitButton = page.getByTestId('register-submit-button');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill('testuser');

    await fullnameInput.waitFor({ state: 'visible' });
    await fullnameInput.fill('Test User');

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill('ValidPass123!');

    await confirmPasswordInput.waitFor({ state: 'visible' });
    await confirmPasswordInput.fill('DifferentPass123!');

    await expect(page.locator('text=Passwords do not match')).toBeVisible();
    await expect(submitButton).toBeDisabled();
  });

  test('should validate username format - only alphanumeric', async ({ page }) => {
    await page.goto('/register');

    const usernameInput = page.getByTestId('register-username-input');
    const fullnameInput = page.getByTestId('register-fullname-input');
    const passwordInput = page.getByTestId('register-password-input');
    const confirmPasswordInput = page.getByTestId('register-confirm-password-input');
    const submitButton = page.getByTestId('register-submit-button');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill('invalid@user!');

    await fullnameInput.waitFor({ state: 'visible' });
    await fullnameInput.fill('Test User');

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill('ValidPass123!');

    await confirmPasswordInput.waitFor({ state: 'visible' });
    await confirmPasswordInput.fill('ValidPass123!');

    await expect(page.locator('text=/.*only.*letters.*numbers.*/i')).toBeVisible();
    await expect(submitButton).toBeDisabled();
  });

  test('should require all fields to be filled', async ({ page }) => {
    await page.goto('/register');

    const usernameInput = page.getByTestId('register-username-input');
    const fullnameInput = page.getByTestId('register-fullname-input');
    const passwordInput = page.getByTestId('register-password-input');
    const confirmPasswordInput = page.getByTestId('register-confirm-password-input');
    const submitButton = page.getByTestId('register-submit-button');

    await submitButton.waitFor({ state: 'visible' });
    await expect(submitButton).toBeDisabled();

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill('testuser');
    await expect(submitButton).toBeDisabled();

    await fullnameInput.waitFor({ state: 'visible' });
    await fullnameInput.fill('Test User');
    await expect(submitButton).toBeDisabled();

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill('ValidPass123!');
    await expect(submitButton).toBeDisabled();

    await confirmPasswordInput.waitFor({ state: 'visible' });
    await confirmPasswordInput.fill('ValidPass123!');
    await expect(submitButton).toBeEnabled();
  });

  test('should navigate to login page from register', async ({ page }) => {
    await page.goto('/register');

    const loginLink = page.getByTestId('register-login-link');
    await loginLink.waitFor({ state: 'visible' });
    await loginLink.click();

    await expect(page).toHaveURL('/login');
  });

  test('should display password strength indicator', async ({ page }) => {
    await page.goto('/register');

    const usernameInput = page.getByTestId('register-username-input');
    const fullnameInput = page.getByTestId('register-fullname-input');
    const passwordInput = page.getByTestId('register-password-input');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill('testuser');

    await fullnameInput.waitFor({ state: 'visible' });
    await fullnameInput.fill('Test User');

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill('weak');

    await expect(page.locator('text=/.*strength.*/i')).toBeVisible();
  });
});
