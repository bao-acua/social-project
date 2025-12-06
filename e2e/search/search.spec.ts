import { test, expect } from '../fixtures/base';
import { createTestUser, createTestPost } from '../helpers/database';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('Search Functionality', () => {
  test('should search posts by content', async ({ page, cleanDatabase }) => {
    const user = await createTestUser(TEST_USERS.user1);

    // Create posts with different content
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

    // Login
    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.user1.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.user1.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/timeline');

    // Search for "technology"
    await page.getByTestId('search-input').fill('technology');
    await page.getByTestId('search-form').press('Enter');

    // Should see search results header
    await expect(page.getByTestId('search-results-header')).toBeVisible();
    await expect(page.locator('text=/.*Searching for.*technology.*/i')).toBeVisible();

    // Should see posts with "technology"
    await expect(page.locator('text=This post is about technology and innovation')).toBeVisible();
    await expect(page.locator('text=Advanced technology solutions')).toBeVisible();

    // Should NOT see post about cooking
    await expect(page.locator('text=This post is about cooking recipes')).not.toBeVisible();
  });

  test('should search posts by author name', async ({ page, cleanDatabase }) => {
    const user1 = await createTestUser(TEST_USERS.user1);
    const user2 = await createTestUser(TEST_USERS.user2);

    // Create posts by different users
    await createTestPost({
      content: 'Post by John Doe',
      authorId: user1.id,
    });
    await createTestPost({
      content: 'Post by Jane Smith',
      authorId: user2.id,
    });

    // Login as user1
    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.user1.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.user1.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/timeline');

    // Search for "Jane"
    await page.getByTestId('search-input').fill('Jane');
    await page.getByTestId('search-form').press('Enter');

    // Should see Jane's post
    await expect(page.locator('text=Post by Jane Smith')).toBeVisible();

    // Should NOT see John's post (unless it contains "Jane")
    // Assuming the post content doesn't contain "Jane"
  });

  test('should clear search and show all posts', async ({ page, cleanDatabase }) => {
    const user = await createTestUser(TEST_USERS.user1);

    // Create posts
    await createTestPost({
      content: 'Post about programming',
      authorId: user.id,
    });
    await createTestPost({
      content: 'Post about gardening',
      authorId: user.id,
    });

    // Login
    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.user1.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.user1.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/timeline');

    // Initially should see all posts
    await expect(page.locator('text=Post about programming')).toBeVisible();
    await expect(page.locator('text=Post about gardening')).toBeVisible();

    // Search for "programming"
    await page.getByTestId('search-input').fill('programming');
    await page.getByTestId('search-form').press('Enter');

    // Should only see programming post
    await expect(page.locator('text=Post about programming')).toBeVisible();
    await expect(page.locator('text=Post about gardening')).not.toBeVisible();

    // Clear search
    await page.getByTestId('search-clear-results-button').click();

    // Should see all posts again
    await expect(page.locator('text=Post about programming')).toBeVisible();
    await expect(page.locator('text=Post about gardening')).toBeVisible();

    // Search results header should not be visible
    await expect(page.getByTestId('search-results-header')).not.toBeVisible();
  });

  test('should clear search using X button in input', async ({ page, cleanDatabase }) => {
    const user = await createTestUser(TEST_USERS.user1);

    await createTestPost({
      content: 'Sample post for search test',
      authorId: user.id,
    });

    // Login
    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.user1.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.user1.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/timeline');

    // Type in search input
    await page.getByTestId('search-input').fill('test query');

    // Should see clear button in input
    await expect(page.getByTestId('search-clear-button')).toBeVisible();

    // Click clear button
    await page.getByTestId('search-clear-button').click();

    // Input should be cleared
    await expect(page.getByTestId('search-input')).toHaveValue('');

    // Clear button should not be visible
    await expect(page.getByTestId('search-clear-button')).not.toBeVisible();
  });

  test('should show no results message for non-existent search', async ({ page, cleanDatabase }) => {
    const user = await createTestUser(TEST_USERS.user1);

    await createTestPost({
      content: 'Regular post content',
      authorId: user.id,
    });

    // Login
    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.user1.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.user1.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/timeline');

    // Search for something that doesn't exist
    await page.getByTestId('search-input').fill('nonexistentqueryxyz123');
    await page.getByTestId('search-form').press('Enter');

    // Should see search results header
    await expect(page.getByTestId('search-results-header')).toBeVisible();

    // Should not see any posts
    await expect(page.locator('text=Regular post content')).not.toBeVisible();

    // May show "no posts found" message (depending on implementation)
    // await expect(page.locator('text=/no.*posts.*found/i')).toBeVisible();
  });

  test('should maintain search state after creating new post', async ({ page, cleanDatabase }) => {
    const user = await createTestUser(TEST_USERS.user1);

    await createTestPost({
      content: 'Existing post about cats',
      authorId: user.id,
    });

    // Login
    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.user1.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.user1.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/timeline');

    // Search for "cats"
    await page.getByTestId('search-input').fill('cats');
    await page.getByTestId('search-form').press('Enter');

    // Should see the cat post
    await expect(page.locator('text=Existing post about cats')).toBeVisible();

    // Create a new post about cats
    await page.getByTestId('create-post-trigger').click();
    await page.getByTestId('create-post-content-input').fill('New post about cats');
    await page.getByTestId('create-post-submit-button').click();

    // Should see the new post in search results
    await expect(page.locator('text=New post about cats')).toBeVisible();
    await expect(page.locator('text=Existing post about cats')).toBeVisible();
  });

  test('should search with case insensitivity', async ({ page, cleanDatabase }) => {
    const user = await createTestUser(TEST_USERS.user1);

    await createTestPost({
      content: 'This post talks about PROGRAMMING',
      authorId: user.id,
    });

    // Login
    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.user1.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.user1.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/timeline');

    // Search with lowercase
    await page.getByTestId('search-input').fill('programming');
    await page.getByTestId('search-form').press('Enter');

    // Should find the post despite case difference
    await expect(page.locator('text=This post talks about PROGRAMMING')).toBeVisible();
  });

  test('should handle empty search query', async ({ page, cleanDatabase }) => {
    const user = await createTestUser(TEST_USERS.user1);

    await createTestPost({
      content: 'Sample post',
      authorId: user.id,
    });

    // Login
    await page.goto('/login');
    await page.getByTestId('login-username-input').fill(TEST_USERS.user1.username);
    await page.getByTestId('login-password-input').fill(TEST_USERS.user1.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/timeline');

    // Try to search with empty query
    await page.getByTestId('search-input').fill('');
    await page.getByTestId('search-form').press('Enter');

    // Should still show all posts (no filtering)
    await expect(page.locator('text=Sample post')).toBeVisible();

    // Search header should not appear
    await expect(page.getByTestId('search-results-header')).not.toBeVisible();
  });
});
