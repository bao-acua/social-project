import { Page } from '@playwright/test';

export const login = async (page: Page, username: string, password: string) => {
  await page.goto('/login');
  await page.getByTestId('login-username-input').fill(username);
  await page.getByTestId('login-password-input').fill(password);
  await page.getByTestId('login-submit-button').click();

  // Wait for redirect to timeline
  await page.waitForURL('/timeline', { timeout: 5000 });
};

export const register = async (
  page: Page,
  username: string,
  password: string,
  fullName: string
) => {
  await page.goto('/register');
  await page.getByTestId('register-username-input').fill(username);
  await page.getByTestId('register-password-input').fill(password);
  await page.getByTestId('register-confirm-password-input').fill(password);
  await page.getByTestId('register-fullname-input').fill(fullName);
  await page.getByTestId('register-submit-button').click();

  // Wait for redirect to timeline
  await page.waitForURL('/timeline', { timeout: 5000 });
};

export const logout = async (page: Page) => {
  await page.getByTestId('navbar-user-menu-trigger').click();
  await page.getByTestId('navbar-logout-button').click();

  // Wait for redirect to home
  await page.waitForURL('/home', { timeout: 5000 });
};

export const getAuthToken = async (page: Page): Promise<string | null> => {
  return await page.evaluate(() => {
    return localStorage.getItem('token');
  });
};

export const setAuthToken = async (page: Page, token: string) => {
  await page.evaluate((token) => {
    localStorage.setItem('token', token);
  }, token);
};

export const clearAuthToken = async (page: Page) => {
  await page.evaluate(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  });
};
