import { test, expect } from '../fixtures/base';

test.describe('Home Page', () => {
  test('should display hero section for unauthenticated users', async ({ page, cleanDatabase }) => {
    await page.goto('/home');

    await expect(page.getByTestId('hero-section')).toBeVisible();
    await expect(page.getByTestId('hero-title')).toBeVisible();
    await expect(page.getByTestId('hero-description')).toBeVisible();
    await expect(page.getByTestId('hero-guest-actions')).toBeVisible();
    await expect(page.getByTestId('hero-register-button')).toBeVisible();
    await expect(page.getByTestId('hero-login-button')).toBeVisible();
    await expect(page.getByTestId('hero-authenticated-actions')).not.toBeVisible();
  });

  test('should display hero section for authenticated users', async ({ page, authenticatedUser }) => {
    await page.goto('/home');

    await expect(page.getByTestId('hero-section')).toBeVisible();
    await expect(page.getByTestId('hero-title')).toBeVisible();
    await expect(page.getByTestId('hero-authenticated-actions')).toBeVisible();
    await expect(page.getByTestId('hero-timeline-button')).toBeVisible();
    await expect(page.getByTestId('hero-guest-actions')).not.toBeVisible();
  });

  test('should navigate to register page from hero section', async ({ page, cleanDatabase }) => {
    await page.goto('/home');

    const registerButton = page.getByTestId('hero-register-button');
    await registerButton.waitFor({ state: 'visible' });
    await registerButton.click();

    await expect(page).toHaveURL('/register');
  });

  test('should navigate to login page from hero section', async ({ page, cleanDatabase }) => {
    await page.goto('/home');

    const loginButton = page.getByTestId('hero-login-button');
    await loginButton.waitFor({ state: 'visible' });
    await loginButton.click();

    await expect(page).toHaveURL('/login');
  });

  test('should navigate to timeline from hero section when authenticated', async ({ page, authenticatedUser }) => {
    await page.goto('/home');

    const timelineButton = page.getByTestId('hero-timeline-button');
    await timelineButton.waitFor({ state: 'visible' });
    await timelineButton.click();

    await expect(page).toHaveURL('/timeline');
  });

  test('should display correct hero title and description', async ({ page, cleanDatabase }) => {
    await page.goto('/home');

    const heroTitle = page.getByTestId('hero-title');
    await heroTitle.waitFor({ state: 'visible' });
    await expect(heroTitle).toContainText('Connect, Share');
    await expect(heroTitle).toContainText('Inspire');

    const heroDescription = page.getByTestId('hero-description');
    await heroDescription.waitFor({ state: 'visible' });
    await expect(heroDescription).toContainText('vibrant community');
  });

  test('should have working navbar on home page', async ({ page, cleanDatabase }) => {
    await page.goto('/home');

    const navbar = page.locator('nav');
    await navbar.waitFor({ state: 'visible' });
    await expect(navbar).toBeVisible();
    await expect(page.locator('text=Sign In')).toBeVisible();
    await expect(page.locator('text=Sign Up')).toBeVisible();
  });

  test('should show user menu for authenticated users in navbar', async ({ page, authenticatedUser }) => {
    await page.goto('/home');

    const userMenuTrigger = page.getByTestId('navbar-user-menu-trigger');
    await userMenuTrigger.waitFor({ state: 'visible' });
    await expect(userMenuTrigger).toBeVisible();
    await expect(page.locator(`text=@${authenticatedUser.username}`)).toBeVisible();
  });
});
