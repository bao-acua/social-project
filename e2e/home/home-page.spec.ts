import { test, expect } from '../fixtures/base';

test.describe('Home Page', () => {
  test('should display hero section for unauthenticated users', async ({ page, cleanDatabase }) => {
    await page.goto('/home');

    // Should see hero section
    await expect(page.getByTestId('hero-section')).toBeVisible();
    await expect(page.getByTestId('hero-title')).toBeVisible();
    await expect(page.getByTestId('hero-description')).toBeVisible();

    // Should see guest action buttons
    await expect(page.getByTestId('hero-guest-actions')).toBeVisible();
    await expect(page.getByTestId('hero-register-button')).toBeVisible();
    await expect(page.getByTestId('hero-login-button')).toBeVisible();

    // Should NOT see authenticated actions
    await expect(page.getByTestId('hero-authenticated-actions')).not.toBeVisible();
  });

  test('should display hero section for authenticated users', async ({ page, authenticatedUser }) => {
    await page.goto('/home');

    // Should see hero section
    await expect(page.getByTestId('hero-section')).toBeVisible();
    await expect(page.getByTestId('hero-title')).toBeVisible();

    // Should see authenticated actions
    await expect(page.getByTestId('hero-authenticated-actions')).toBeVisible();
    await expect(page.getByTestId('hero-timeline-button')).toBeVisible();

    // Should NOT see guest actions
    await expect(page.getByTestId('hero-guest-actions')).not.toBeVisible();
  });

  test('should navigate to register page from hero section', async ({ page, cleanDatabase }) => {
    await page.goto('/home');

    // Click register button
    await page.getByTestId('hero-register-button').click();

    // Should redirect to register page
    await expect(page).toHaveURL('/register');
  });

  test('should navigate to login page from hero section', async ({ page, cleanDatabase }) => {
    await page.goto('/home');

    // Click login button
    await page.getByTestId('hero-login-button').click();

    // Should redirect to login page
    await expect(page).toHaveURL('/login');
  });

  test('should navigate to timeline from hero section when authenticated', async ({ page, authenticatedUser }) => {
    await page.goto('/home');

    // Click timeline button
    await page.getByTestId('hero-timeline-button').click();

    // Should redirect to timeline page
    await expect(page).toHaveURL('/timeline');
  });

  test('should display correct hero title and description', async ({ page, cleanDatabase }) => {
    await page.goto('/home');

    // Check hero title contains expected text
    const heroTitle = page.getByTestId('hero-title');
    await expect(heroTitle).toContainText('Connect, Share');
    await expect(heroTitle).toContainText('Inspire');

    // Check hero description
    const heroDescription = page.getByTestId('hero-description');
    await expect(heroDescription).toContainText('vibrant community');
  });

  test('should have working navbar on home page', async ({ page, cleanDatabase }) => {
    await page.goto('/home');

    // Should see navbar
    await expect(page.locator('nav')).toBeVisible();

    // Should see Sign In and Sign Up links for unauthenticated users
    await expect(page.locator('text=Sign In')).toBeVisible();
    await expect(page.locator('text=Sign Up')).toBeVisible();
  });

  test('should show user menu for authenticated users in navbar', async ({ page, authenticatedUser }) => {
    await page.goto('/home');

    // Should see user menu trigger
    await expect(page.getByTestId('navbar-user-menu-trigger')).toBeVisible();

    // Should display username
    await expect(page.locator(`text=@${authenticatedUser.username}`)).toBeVisible();
  });
});
