import { test, expect } from '../fixtures/base';
import { createTestUser, createTestPost } from '../helpers/database';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('Search Functionality', () => {
  test('should search posts by content', async ({ page, cleanDatabase }) => {
    const user = await createTestUser(TEST_USERS.user1);

    await createTestPost({
      content: 'This post is about technology and innovation',
      authorId: user.id,
    });
    await createTestPost({
      content: 'This post is about cooking recipes',
      authorId: user.id,
    });
    await createTestPost({
      content: 'Advanced technology solutions',
      authorId: user.id,
    });

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

    const searchInput = page.getByTestId('search-input');
    await searchInput.waitFor({ state: 'visible' });
    await searchInput.fill('technology');

    const searchForm = page.getByTestId('search-form');
    await searchForm.waitFor({ state: 'visible' });
    await searchForm.press('Enter');

    await expect(page.getByTestId('search-results-header')).toBeVisible();
    await expect(page.locator('text=/.*Searching for.*technology.*/i')).toBeVisible();
    await expect(page.locator('text=This post is about technology and innovation')).toBeVisible();
    await expect(page.locator('text=Advanced technology solutions')).toBeVisible();
    await expect(page.locator('text=This post is about cooking recipes')).not.toBeVisible();
  });

  test('should search posts by author name', async ({ page, cleanDatabase }) => {
    const user1 = await createTestUser(TEST_USERS.user1);
    const user2 = await createTestUser(TEST_USERS.user2);

    await createTestPost({
      content: 'Post by John Doe',
      authorId: user1.id,
    });
    await createTestPost({
      content: 'Post by Jane Smith',
      authorId: user2.id,
    });

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

    const searchInput = page.getByTestId('search-input');
    await searchInput.waitFor({ state: 'visible' });
    await searchInput.fill('Jane');

    const searchForm = page.getByTestId('search-form');
    await searchForm.waitFor({ state: 'visible' });
    await searchForm.press('Enter');

    await expect(page.locator('text=Post by Jane Smith')).toBeVisible();
  });

  test('should clear search and show all posts', async ({ page, cleanDatabase }) => {
    const user = await createTestUser(TEST_USERS.user1);

    await createTestPost({
      content: 'Post about programming',
      authorId: user.id,
    });
    await createTestPost({
      content: 'Post about gardening',
      authorId: user.id,
    });

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

    await expect(page.locator('text=Post about programming')).toBeVisible();
    await expect(page.locator('text=Post about gardening')).toBeVisible();

    const searchInput = page.getByTestId('search-input');
    await searchInput.waitFor({ state: 'visible' });
    await searchInput.fill('programming');

    const searchForm = page.getByTestId('search-form');
    await searchForm.waitFor({ state: 'visible' });
    await searchForm.press('Enter');

    await expect(page.locator('text=Post about programming')).toBeVisible();
    await expect(page.locator('text=Post about gardening')).not.toBeVisible();

    const clearButton = page.getByTestId('search-clear-results-button');
    await clearButton.waitFor({ state: 'visible' });
    await clearButton.click();

    await expect(page.locator('text=Post about programming')).toBeVisible();
    await expect(page.locator('text=Post about gardening')).toBeVisible();
    await expect(page.getByTestId('search-results-header')).not.toBeVisible();
  });

  test('should clear search using X button in input', async ({ page, cleanDatabase }) => {
    const user = await createTestUser(TEST_USERS.user1);

    await createTestPost({
      content: 'Sample post for search test',
      authorId: user.id,
    });

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

    const searchInput = page.getByTestId('search-input');
    await searchInput.waitFor({ state: 'visible' });
    await searchInput.fill('test query');

    const clearButton = page.getByTestId('search-clear-button');
    await clearButton.waitFor({ state: 'visible' });
    await expect(clearButton).toBeVisible();

    await clearButton.click();

    await expect(searchInput).toHaveValue('');
    await expect(clearButton).not.toBeVisible();
  });

  test('should show no results message for non-existent search', async ({ page, cleanDatabase }) => {
    const user = await createTestUser(TEST_USERS.user1);

    await createTestPost({
      content: 'Regular post content',
      authorId: user.id,
    });

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

    const searchInput = page.getByTestId('search-input');
    await searchInput.waitFor({ state: 'visible' });
    await searchInput.fill('nonexistentqueryxyz123');

    const searchForm = page.getByTestId('search-form');
    await searchForm.waitFor({ state: 'visible' });
    await searchForm.press('Enter');

    await expect(page.getByTestId('search-results-header')).toBeVisible();
    await expect(page.locator('text=Regular post content')).not.toBeVisible();
  });

  test('should maintain search state after creating new post', async ({ page, cleanDatabase }) => {
    const user = await createTestUser(TEST_USERS.user1);

    await createTestPost({
      content: 'Existing post about cats',
      authorId: user.id,
    });

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

    const searchInput = page.getByTestId('search-input');
    await searchInput.waitFor({ state: 'visible' });
    await searchInput.fill('cats');

    const searchForm = page.getByTestId('search-form');
    await searchForm.waitFor({ state: 'visible' });
    await searchForm.press('Enter');

    await expect(page.locator('text=Existing post about cats')).toBeVisible();

    const createPostTrigger = page.getByTestId('create-post-trigger');
    await createPostTrigger.waitFor({ state: 'visible' });
    await createPostTrigger.click();

    const contentInput = page.getByTestId('create-post-content-input');
    await contentInput.waitFor({ state: 'visible' });
    await contentInput.fill('New post about cats');

    const createSubmitButton = page.getByTestId('create-post-submit-button');
    await createSubmitButton.waitFor({ state: 'visible' });
    await createSubmitButton.click();

    await expect(page.locator('text=New post about cats')).toBeVisible();
    await expect(page.locator('text=Existing post about cats')).toBeVisible();
  });

  test('should search with case insensitivity', async ({ page, cleanDatabase }) => {
    const user = await createTestUser(TEST_USERS.user1);

    await createTestPost({
      content: 'This post talks about PROGRAMMING',
      authorId: user.id,
    });

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

    const searchInput = page.getByTestId('search-input');
    await searchInput.waitFor({ state: 'visible' });
    await searchInput.fill('programming');

    const searchForm = page.getByTestId('search-form');
    await searchForm.waitFor({ state: 'visible' });
    await searchForm.press('Enter');

    await expect(page.locator('text=This post talks about PROGRAMMING')).toBeVisible();
  });

  test('should handle empty search query', async ({ page, cleanDatabase }) => {
    const user = await createTestUser(TEST_USERS.user1);

    await createTestPost({
      content: 'Sample post',
      authorId: user.id,
    });

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

    const searchInput = page.getByTestId('search-input');
    await searchInput.waitFor({ state: 'visible' });
    await searchInput.fill('');

    const searchForm = page.getByTestId('search-form');
    await searchForm.waitFor({ state: 'visible' });
    await searchForm.press('Enter');

    await expect(page.locator('text=Sample post')).toBeVisible();
    await expect(page.getByTestId('search-results-header')).not.toBeVisible();
  });
});
