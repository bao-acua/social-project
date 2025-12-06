import { test as base } from '@playwright/test';
import { clearDatabase, createTestUser } from '../helpers/database';
import { TEST_USERS } from './test-data';

type TestFixtures = {
  cleanDatabase: void;
  authenticatedUser: { username: string; password: string; userId: number };
  authenticatedAdmin: { username: string; password: string; userId: number };
};

export const test = base.extend<TestFixtures>({
  // Clean database before each test
  cleanDatabase: [async ({}, use) => {
    await clearDatabase();
    await use();
  }, { auto: true }],

  // Create and authenticate a regular user
  authenticatedUser: async ({ page }, use) => {
    const user = await createTestUser(TEST_USERS.user1);

    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.user1.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.user1.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/timeline', { timeout: 5000 });

    await use({
      username: TEST_USERS.user1.username,
      password: TEST_USERS.user1.password,
      userId: user.id,
    });
  },

  // Create and authenticate an admin user
  authenticatedAdmin: async ({ page }, use) => {
    const admin = await createTestUser(TEST_USERS.admin);

    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.admin.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.admin.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/timeline', { timeout: 5000 });

    await use({
      username: TEST_USERS.admin.username,
      password: TEST_USERS.admin.password,
      userId: admin.id,
    });
  },
});

export { expect } from '@playwright/test';
