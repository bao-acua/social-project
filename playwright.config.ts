import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run tests sequentially to avoid database conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Use single worker to ensure database isolation
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Start backend and frontend before running tests
  // NOTE: Servers should be running before tests
  // Run in separate terminals:
  // Terminal 1: cd packages/backend && NODE_ENV=test DATABASE_URL="postgres://localhost:5432/social_project_test_db" npm run dev
  // Terminal 2: cd packages/frontend && npm run dev
  webServer: [
    {
      command: 'cd packages/backend && NODE_ENV=test DATABASE_URL="postgres://localhost:5432/social_project_test_db" npm run dev',
      url: 'http://localhost:3000/health',
      reuseExistingServer: true, // Use existing servers instead of starting new ones
      timeout: 120 * 1000,
    },
    {
      command: 'cd packages/frontend && npm run dev',
      url: 'http://localhost:3001',
      reuseExistingServer: true, // Use existing servers instead of starting new ones
      timeout: 120 * 1000,
    },
  ],

  // Global timeout for each test
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
});
